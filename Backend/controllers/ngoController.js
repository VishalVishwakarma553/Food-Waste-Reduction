import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const API_BASE = process.env.API_BASE || "http://localhost:8080";

// Helper to query Nominatim to geocode an address
async function geocodeAddressString(addressStr) {
    if (!addressStr || !addressStr.trim()) return null;
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr.trim())}&format=json&limit=1&countrycodes=in`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "FoodSave-App/1.0 (foodwaste-reduction-platform)",
                "Accept-Language": "en",
            },
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
        }
    } catch (err) {
        console.error("Geocoding failed for address:", addressStr, err);
    }
    return null;
}

// Lazy geocoder for a user (NGO or Restaurant)
async function ensureUserCoordinates(user) {
    if (user.latitude !== null && user.longitude !== null) {
        return { latitude: user.latitude, longitude: user.longitude };
    }

    const parts = [user.address, user.city, user.state, user.pincode].filter(Boolean);
    let coords = null;

    if (parts.length > 0) {
        coords = await geocodeAddressString(parts.join(", "));
        if (!coords && user.city) {
            coords = await geocodeAddressString(user.city);
        }
    }

    // Default coordinate fallback: Ayodhya coordinates (26.7956, 82.1943)
    // as database seed and users are located in Ayodhya
    if (!coords) {
        coords = { latitude: 26.7956, longitude: 82.1943 };
    }

    // Update in database to persist it and fire Postgres triggers
    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                latitude: coords.latitude,
                longitude: coords.longitude
            }
        });
    } catch (err) {
        console.error(`Failed to update coordinates for user ${user.id}:`, err);
    }

    return coords;
}

// Haversine formula to compute distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 9999;
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper to format remaining time until expiry
function formatExpiry(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "N/A";
    const exp = new Date(`${dateStr}T${timeStr}:00`);
    const diffMs = exp - new Date();
    if (diffMs <= 0) return "Expired";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 24) {
        return `${Math.round(hrs / 24)}d`;
    }
    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
}

// GET /api/ngo/donations
export async function getAvailableDonations(req, res) {
    try {
        const { search, category, dietary, type, maxDistance = "15" } = req.query;

        // 1. Fetch NGO user coordinates
        const ngoUser = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!ngoUser) return res.status(404).json({ error: "NGO user not found" });

        const ngoCoords = await ensureUserCoordinates(ngoUser);

        // 2. Fetch all active listings
        const listings = await prisma.foodListing.findMany({
            where: { status: "active" },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        businessName: true,
                        businessImage: true,
                        address: true,
                        city: true,
                        state: true,
                        pincode: true,
                        latitude: true,
                        longitude: true,
                    }
                }
            }
        });

        // 3. Process and filter listings
        const items = [];
        for (const l of listings) {
            const restCoords = await ensureUserCoordinates(l.restaurant);
            const distance = getDistanceKm(
                ngoCoords.latitude,
                ngoCoords.longitude,
                restCoords.latitude,
                restCoords.longitude
            );

            // Filter by distance
            if (maxDistance && distance > parseFloat(maxDistance)) {
                continue;
            }

            // Parse JSON fields
            const images = (() => {
                try {
                    const arr = JSON.parse(l.images || "[]");
                    return arr.map(p => `${API_BASE}${p}`);
                } catch {
                    return [];
                }
            })();
            const dietaryArr = (() => {
                try {
                    return JSON.parse(l.dietary || "[]");
                } catch {
                    return [];
                }
            })();

            // Filter by Category
            if (category && category !== "All") {
                const catMap = { "Fresh Produce": "Produce" };
                const dbCat = catMap[category] || category;
                if (l.category !== dbCat) continue;
            }

            // Derive and filter by Dietary
            const isVegan = dietaryArr.some(d => /vegan/i.test(d));
            const isVeg = dietaryArr.some(d => /veg/i.test(d) && !/vegan/i.test(d)) || isVegan;

            let itemDietary = "Non-veg";
            if (isVegan) itemDietary = "Vegan";
            else if (isVeg) itemDietary = "Veg";

            if (dietary && dietary !== "All") {
                if (dietary === "Veg" && itemDietary !== "Veg" && itemDietary !== "Vegan") continue;
                if (dietary === "Vegan" && itemDietary !== "Vegan") continue;
                if (dietary === "Non-veg" && itemDietary !== "Non-veg") continue;
            }

            // Derive and filter by Pricing Model Type
            const itemType = l.discountedPrice === 0 ? "Free" : "Subsidized";
            if (type && type !== "All" && itemType !== type) {
                continue;
            }

            // Filter by search
            if (search) {
                const query = search.toLowerCase();
                const matchName = l.name.toLowerCase().includes(query);
                const matchDesc = (l.description || "").toLowerCase().includes(query);
                const matchTags = (l.tags || "").toLowerCase().includes(query);
                const matchRest = (l.restaurant.businessName || l.restaurant.name).toLowerCase().includes(query);
                if (!matchName && !matchDesc && !matchTags && !matchRest) {
                    continue;
                }
            }

            items.push({
                id: l.id,
                name: l.name,
                category: l.category,
                description: l.description || "",
                restaurant: l.restaurant.businessName || l.restaurant.name,
                restaurantAddress: l.restaurant.address || "",
                quantity: l.quantity,
                unit: l.unit,
                distance: parseFloat(distance.toFixed(1)),
                expiry: formatExpiry(l.expiryDate, l.expiryTime),
                expiresAt: l.expiryDate && l.expiryTime ? new Date(`${l.expiryDate}T${l.expiryTime}:00`).toISOString() : null,
                type: itemType,
                dietary: itemDietary,
                img: images.length ? images[0] : "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
                latitude: restCoords.latitude,
                longitude: restCoords.longitude,
            });
        }

        res.json({ donations: items, ngoLatitude: ngoCoords.latitude, ngoLongitude: ngoCoords.longitude });
    } catch (err) {
        console.error("getAvailableDonations error:", err);
        res.status(500).json({ error: "Failed to load available donations" });
    }
}

// POST /api/ngo/donations/claim
export async function claimDonations(req, res) {
    try {
        const { listingIds, notes, pickupSlot } = req.body;
        if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
            return res.status(400).json({ error: "No items selected to claim" });
        }

        const ids = listingIds.map(id => parseInt(id));
        const listings = await prisma.foodListing.findMany({
            where: { id: { in: ids }, status: "active" },
            include: { restaurant: { select: { businessName: true, name: true } } }
        });

        if (listings.length !== ids.length) {
            return res.status(400).json({ error: "Some items are no longer available for claim" });
        }

        const foodSaved = listings.reduce((sum, l) => sum + 0.4 * l.quantity, 0);

        // Run as a transaction to create the order and mark listings as claimed (expired)
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    consumerId: req.user.id,
                    notes: notes || "NGO Donation Claim Request",
                    status: "pending",
                    foodSaved: parseFloat(foodSaved.toFixed(2)),
                    co2Saved: parseFloat((foodSaved * 0.4).toFixed(2)),
                    items: {
                        create: listings.map(l => {
                            const imgs = (() => {
                                try { return JSON.parse(l.images || "[]"); } catch { return []; }
                            })();
                            return {
                                listingId: l.id,
                                quantity: l.quantity,
                                pickupSlot: pickupSlot || "Anytime within available slots",
                                name: l.name,
                                image: imgs[0] || null,
                                restaurantName: l.restaurant.businessName || l.restaurant.name,
                            };
                        })
                    }
                },
                include: { items: true }
            });

            // Mark listings as claimed by setting status to expired
            await tx.foodListing.updateMany({
                where: { id: { in: ids } },
                data: { status: "expired" }
            });

            return newOrder;
        });

        res.status(201).json({ order, message: "Donation claimed successfully" });
    } catch (err) {
        console.error("claimDonations error:", err);
        res.status(500).json({ error: "Failed to claim donations" });
    }
}

// GET /api/ngo/pickups
export async function getNgoPickups(req, res) {
    try {
        const ngoId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { consumerId: ngoId },
            include: {
                items: {
                    include: {
                        listing: {
                            include: {
                                restaurant: {
                                    select: {
                                        id: true,
                                        name: true,
                                        businessName: true,
                                        address: true,
                                        city: true,
                                        state: true,
                                        pincode: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Format orders into pickups format
        const pickups = orders.map(order => {
            const firstItem = order.items[0];
            let pickupDate = "Any date";
            let pickupTime = "Any time";

            if (firstItem && firstItem.pickupSlot) {
                const parts = firstItem.pickupSlot.split(" | ");
                if (parts[0]) pickupDate = parts[0];
                if (parts[1]) pickupTime = parts[1];
            }

            const restaurantName = firstItem?.restaurantName || firstItem?.listing?.restaurant?.businessName || firstItem?.listing?.restaurant?.name || "Unknown Restaurant";
            const address = firstItem?.listing?.restaurant?.address || "Registered Address";
            const itemsList = order.items.map(i => i.name).join(", ");
            const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
            const unit = firstItem?.listing?.unit || "kg";

            return {
                id: String(order.id),
                date: pickupDate,
                time: pickupTime,
                restaurant: restaurantName,
                address: address,
                items: itemsList,
                qty: `${totalQty} ${unit}`,
                status: order.status === "completed" ? "Completed" : (order.status === "cancelled" ? "Cancelled" : "Upcoming"),
                dbStatus: order.status,
                createdAt: order.createdAt
            };
        });

        res.json({ pickups });
    } catch (err) {
        console.error("getNgoPickups error:", err);
        res.status(500).json({ error: "Failed to fetch NGO pickups" });
    }
}

// PATCH /api/ngo/pickups/:id/complete
export async function completeNgoPickup(req, res) {
    try {
        const pickupId = parseInt(req.params.id);
        const ngoId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id: pickupId, consumerId: ngoId }
        });

        if (!order) {
            return res.status(404).json({ error: "Pickup not found" });
        }

        const updated = await prisma.order.update({
            where: { id: pickupId },
            data: { status: "completed" }
        });

        res.json({ order: updated, message: "Pickup completed successfully" });
    } catch (err) {
        console.error("completeNgoPickup error:", err);
        res.status(500).json({ error: "Failed to complete pickup" });
    }
}

// PATCH /api/ngo/pickups/:id/cancel
export async function cancelNgoPickup(req, res) {
    try {
        const pickupId = parseInt(req.params.id);
        const ngoId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id: pickupId, consumerId: ngoId },
            include: {
                items: {
                    include: {
                        listing: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: "Pickup not found" });
        }

        const cancellable = ["pending", "approved", "confirmed", "ready"];
        if (!cancellable.includes(order.status)) {
            return res.status(400).json({ error: `Cannot cancel a ${order.status} pickup` });
        }

        const updated = await prisma.order.update({
            where: { id: pickupId },
            data: { status: "cancelled" },
            include: {
                items: {
                    include: {
                        listing: true
                    }
                }
            }
        });

        // Restore food listings to active if they are not expired yet
        const now = new Date();
        for (const item of updated.items) {
            const listing = item.listing;
            if (!listing) continue;

            const expiryDateTime = new Date(`${listing.expiryDate}T${listing.expiryTime}`);
            const isExpiryValid = isNaN(expiryDateTime.getTime()) || expiryDateTime > now;
            const isAvailable = (!listing.availableFrom || new Date(listing.availableFrom) <= now) &&
                                (!listing.availableUntil || new Date(listing.availableUntil) >= now);

            if (isExpiryValid && isAvailable) {
                await prisma.foodListing.update({
                    where: { id: listing.id },
                    data: { status: "active" }
                });
            }
        }

        res.json({ order: updated, message: "Pickup cancelled successfully" });
    } catch (err) {
        console.error("cancelNgoPickup error:", err);
        res.status(500).json({ error: "Failed to cancel pickup" });
    }
}

// GET /api/ngo/beneficiaries
export async function getBeneficiaries(req, res) {
    try {
        const beneficiaries = await prisma.beneficiary.findMany({
            where: { ngoId: req.user.id },
            orderBy: { createdAt: "desc" }
        });
        res.json({ beneficiaries });
    } catch (err) {
        console.error("getBeneficiaries error:", err);
        res.status(500).json({ error: "Failed to fetch beneficiaries" });
    }
}

// POST /api/ngo/beneficiaries
export async function addBeneficiary(req, res) {
    try {
        const { name, type, location, size, contactPhone, notes } = req.body;
        if (!name || !location || !size) {
            return res.status(400).json({ error: "Name, location and size are required" });
        }

        const beneficiary = await prisma.beneficiary.create({
            data: {
                ngoId: req.user.id,
                name,
                type: type || "Other",
                location,
                size: parseInt(size),
                contactPhone: contactPhone || null,
                notes: notes || null
            }
        });

        res.status(201).json({ beneficiary, message: "Beneficiary registered successfully" });
    } catch (err) {
        console.error("addBeneficiary error:", err);
        res.status(500).json({ error: "Failed to register beneficiary" });
    }
}

// PATCH /api/ngo/beneficiaries/:id
export async function updateBeneficiary(req, res) {
    try {
        const beneficiaryId = parseInt(req.params.id);
        const { name, type, location, size, contactPhone, notes } = req.body;

        const beneficiary = await prisma.beneficiary.findFirst({
            where: { id: beneficiaryId, ngoId: req.user.id }
        });

        if (!beneficiary) {
            return res.status(404).json({ error: "Beneficiary not found" });
        }

        const updated = await prisma.beneficiary.update({
            where: { id: beneficiaryId },
            data: {
                name: name !== undefined ? name : beneficiary.name,
                type: type !== undefined ? type : beneficiary.type,
                location: location !== undefined ? location : beneficiary.location,
                size: size !== undefined ? parseInt(size) : beneficiary.size,
                contactPhone: contactPhone !== undefined ? contactPhone : beneficiary.contactPhone,
                notes: notes !== undefined ? notes : beneficiary.notes
            }
        });

        res.json({ beneficiary: updated, message: "Beneficiary updated successfully" });
    } catch (err) {
        console.error("updateBeneficiary error:", err);
        res.status(500).json({ error: "Failed to update beneficiary" });
    }
}

// DELETE /api/ngo/beneficiaries/:id
export async function deleteBeneficiary(req, res) {
    try {
        const beneficiaryId = parseInt(req.params.id);
        const beneficiary = await prisma.beneficiary.findFirst({
            where: { id: beneficiaryId, ngoId: req.user.id }
        });

        if (!beneficiary) {
            return res.status(404).json({ error: "Beneficiary not found" });
        }

        await prisma.beneficiary.delete({
            where: { id: beneficiaryId }
        });

        res.json({ message: "Beneficiary deleted successfully" });
    } catch (err) {
        console.error("deleteBeneficiary error:", err);
        res.status(500).json({ error: "Failed to delete beneficiary" });
    }
}

// GET /api/ngo/completed-orders
export async function getCompletedNgoOrders(req, res) {
    try {
        const orders = await prisma.order.findMany({
            where: { consumerId: req.user.id, status: "completed" },
            include: { items: true },
            orderBy: { createdAt: "desc" }
        });
        res.json({ orders });
    } catch (err) {
        console.error("getCompletedNgoOrders error:", err);
        res.status(500).json({ error: "Failed to fetch completed orders" });
    }
}

// POST /api/ngo/distributions
export async function addDistribution(req, res) {
    try {
        const { beneficiaryId, orderId, foodItems, quantity, unit } = req.body;
        const ngoId = req.user.id;

        if (!beneficiaryId || !foodItems || !quantity) {
            return res.status(400).json({ error: "Beneficiary, food items, and quantity are required" });
        }

        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: parseInt(orderId) },
                include: { items: true }
            });
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }
            const totalOrderQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
            if (parseFloat(quantity) > totalOrderQty) {
                return res.status(400).json({ error: `Quantity cannot exceed order quantity of ${totalOrderQty} ${unit || "kg"}` });
            }
        }

        const dist = await prisma.distribution.create({
            data: {
                ngoId,
                beneficiaryId: parseInt(beneficiaryId),
                orderId: orderId ? parseInt(orderId) : null,
                foodItems,
                quantity: parseFloat(quantity),
                unit: unit || "kg"
            }
        });

        // Update beneficiary stats
        const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        await prisma.beneficiary.update({
            where: { id: parseInt(beneficiaryId) },
            data: {
                mealsReceived: {
                    increment: Math.round(parseFloat(quantity)) // Store quantity count directly
                },
                lastServed: nowStr
            }
        });

        res.status(201).json({ distribution: dist, message: "Distribution logged successfully" });
    } catch (err) {
        console.error("addDistribution error:", err);
        res.status(500).json({ error: "Failed to log distribution" });
    }
}

// GET /api/ngo/distributions
export async function getDistributions(req, res) {
    try {
        const distributions = await prisma.distribution.findMany({
            where: { ngoId: req.user.id },
            include: { beneficiary: true },
            orderBy: { distributedAt: "desc" }
        });
        res.json({ distributions });
    } catch (err) {
        console.error("getDistributions error:", err);
        res.status(500).json({ error: "Failed to fetch distributions" });
    }
}

// GET /api/ngo/profile
export async function getNgoProfile(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) return res.status(404).json({ error: "NGO profile not found" });
        res.json({ user });
    } catch (err) {
        console.error("getNgoProfile error:", err);
        res.status(500).json({ error: "Failed to fetch NGO profile" });
    }
}

// PATCH /api/ngo/profile
export async function updateNgoProfile(req, res) {
    try {
        const { name, email, phone, website, bio, serviceRadius, address, city, state, pincode } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (phone !== undefined) data.phone = phone;
        if (website !== undefined) data.website = website;
        if (bio !== undefined) data.bio = bio;
        if (serviceRadius !== undefined) data.serviceRadius = parseFloat(serviceRadius);
        if (address !== undefined) data.address = address;
        if (city !== undefined) data.city = city;
        if (state !== undefined) data.state = state;
        if (pincode !== undefined) data.pincode = pincode;

        if (req.file) {
            data.avatar = `/uploads/${req.file.filename}`;
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data
        });

        res.json({ user: updated, message: "NGO profile updated successfully" });
    } catch (err) {
        console.error("updateNgoProfile error:", err);
        res.status(500).json({ error: "Failed to update NGO profile" });
    }
}

// POST /api/ngo/documents/upload
export async function uploadNgoDocument(req, res) {
    try {
        const { docType } = req.body;
        if (!docType || !req.file) {
            return res.status(400).json({ error: "Document type and file are required" });
        }

        const validTypes = ["documentReg", "documentDeed", "document12A", "document80G"];
        if (!validTypes.includes(docType)) {
            return res.status(400).json({ error: "Invalid document type" });
        }

        const data = {};
        data[docType] = `/uploads/${req.file.filename}`;
        data[`${docType}Status`] = "Pending Review";

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data
        });

        res.json({ user: updated, message: "Document uploaded successfully and pending review" });
    } catch (err) {
        console.error("uploadNgoDocument error:", err);
        res.status(500).json({ error: "Failed to upload document" });
    }
}

// PATCH /api/ngo/profile/notifications
export async function updateNgoNotifications(req, res) {
    try {
        const { notifNgoDonations, notifNgoStatus, notifNgoSms, notifNgoDigest } = req.body;
        const data = {};
        if (notifNgoDonations !== undefined) data.notifNgoDonations = !!notifNgoDonations;
        if (notifNgoStatus !== undefined) data.notifNgoStatus = !!notifNgoStatus;
        if (notifNgoSms !== undefined) data.notifNgoSms = !!notifNgoSms;
        if (notifNgoDigest !== undefined) data.notifNgoDigest = !!notifNgoDigest;

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data
        });

        res.json({ user: updated, message: "Notification preferences updated successfully" });
    } catch (err) {
        console.error("updateNgoNotifications error:", err);
        res.status(500).json({ error: "Failed to update notification preferences" });
    }
}

// POST /api/ngo/profile/change-password
export async function changeNgoPassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("changeNgoPassword error:", err);
        res.status(500).json({ error: "Failed to update password" });
    }
}

// ponytail: YAGNI-compliant minimal impact aggregation
export async function getNgoImpactAnalytics(req, res) {
    try {
        const ngoId = req.user.id;

        const completedOrders = await prisma.order.findMany({
            where: { consumerId: ngoId, status: "completed" },
            include: {
                items: {
                    include: {
                        listing: {
                            include: {
                                restaurant: {
                                    select: { id: true, name: true, businessName: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        });

        const beneficiaries = await prisma.beneficiary.findMany({
            where: { ngoId }
        });

        const distributions = await prisma.distribution.findMany({
            where: { ngoId }
        });

        // Lifetime Food Saved is the total food served (sum of distribution quantities)
        const totalFoodServed = distributions.reduce((sum, d) => sum + d.quantity, 0);
        // Beneficiary Reach is the count of beneficiaries
        const beneficiaryReach = beneficiaries.length;

        const partnerIds = new Set();
        completedOrders.forEach(o => {
            o.items.forEach(item => {
                if (item.listing?.restaurantId) partnerIds.add(item.listing.restaurantId);
            });
        });

        // 6 Month Trend
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap = {};
        const monthsList = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mName = monthNames[d.getMonth()];
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyMap[key] = { month: mName, kg: 0, meals: 0 };
            monthsList.push(key);
        }

        // weight (kg) is amount of food served in that month, meals is number of times distributed
        distributions.forEach(d => {
            const date = new Date(d.distributedAt);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyMap[key]) {
                monthlyMap[key].kg += d.quantity;
                monthlyMap[key].meals += 1;
            }
        });

        const monthlyData = monthsList.map(key => {
            const m = monthlyMap[key];
            m.kg = parseFloat(m.kg.toFixed(1));
            m.meals = Math.round(m.meals);
            return m;
        });

        // Category breakdown
        const categoryMap = {};
        completedOrders.forEach(o => {
            o.items.forEach(item => {
                const cat = item.listing?.category || "Other";
                categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
            });
        });
        const totalCatQty = Object.values(categoryMap).reduce((s, v) => s + v, 0);
        const categoryData = Object.entries(categoryMap).map(([name, val]) => ({
            name,
            value: totalCatQty > 0 ? parseFloat(((val / totalCatQty) * 100).toFixed(1)) : 0
        })).filter(c => c.value > 0);

        // Top Partners
        const partnerMap = {};
        completedOrders.forEach(o => {
            o.items.forEach(item => {
                const r = item.listing?.restaurant;
                if (!r) return;
                if (!partnerMap[r.id]) {
                    partnerMap[r.id] = {
                        name: r.businessName || r.name,
                        weight: 0,
                        meals: 0,
                        rating: parseFloat((4.5 + (r.id % 5) * 0.1).toFixed(1))
                    };
                }
                partnerMap[r.id].weight += item.quantity;
                partnerMap[r.id].meals += Math.round(item.quantity * 2.5);
            });
        });
        const topPartners = Object.values(partnerMap)
            .map(p => {
                p.weight = parseFloat(p.weight.toFixed(1));
                return p;
            })
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 5);

        res.json({
            metrics: {
                totalFoodServed: parseFloat(totalFoodServed.toFixed(1)),
                beneficiaryReach,
                partnerEstablishments: partnerIds.size,
                completedPickupsCount: completedOrders.length
            },
            monthlyData,
            categoryData,
            topPartners
        });
    } catch (err) {
        console.error("getNgoImpactAnalytics error:", err);
        res.status(500).json({ error: "Failed to load impact analytics" });
    }
}

// ponytail: minimal & clean dashboard data aggregation
export async function getNgoDashboard(req, res) {
    try {
        const ngoId = req.user.id;

        const ngoUser = await prisma.user.findUnique({
            where: { id: ngoId }
        });
        if (!ngoUser) return res.status(404).json({ error: "NGO user not found" });

        const ngoCoords = await ensureUserCoordinates(ngoUser);

        // 1. Nearby Donations (limit 4)
        const listings = await prisma.foodListing.findMany({
            where: { status: "active" },
            include: {
                restaurant: {
                    select: {
                        id: true, name: true, businessName: true,
                        address: true, city: true, state: true, pincode: true,
                        latitude: true, longitude: true
                    }
                }
            }
        });

        const donationsNearby = [];
        for (const l of listings) {
            const restCoords = await ensureUserCoordinates(l.restaurant);
            const distance = getDistanceKm(
                ngoCoords.latitude,
                ngoCoords.longitude,
                restCoords.latitude,
                restCoords.longitude
            );
            if (distance <= (ngoUser.serviceRadius || 15)) {
                let img = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80";
                try {
                    const imagesArr = JSON.parse(l.images || "[]");
                    if (imagesArr.length) {
                        img = `${API_BASE}${imagesArr[0]}`;
                    }
                } catch {}

                donationsNearby.push({
                    id: String(l.id),
                    restaurant: l.restaurant.businessName || l.restaurant.name,
                    foodType: l.name,
                    quantity: `${l.quantity} ${l.unit}`,
                    distance: `${distance.toFixed(1)} km`,
                    expiry: formatExpiry(l.expiryDate, l.expiryTime),
                    rawDistance: distance
                });
            }
        }
        donationsNearby.sort((a, b) => a.rawDistance - b.rawDistance);
        const topDonations = donationsNearby.slice(0, 4);

        // 2. Active Requests count
        const activeRequestsCount = await prisma.order.count({
            where: {
                consumerId: ngoId,
                status: { in: ["pending", "confirmed", "ready", "approved"] }
            }
        });

        // 3. Requests made today count
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayPickupsCount = await prisma.order.count({
            where: {
                consumerId: ngoId,
                createdAt: { gte: startOfToday }
            }
        });

        // 4. Food saved (distributions) & Beneficiary reach (beneficiary count) this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const distributionsThisMonth = await prisma.distribution.findMany({
            where: {
                ngoId,
                distributedAt: { gte: startOfMonth }
            }
        });
        const foodSavedThisMonth = distributionsThisMonth.reduce((sum, d) => sum + d.quantity, 0);

        const beneficiaryReachThisMonth = await prisma.beneficiary.count({
            where: { ngoId }
        });

        // 5. Recent Active Requests list
        const recentOrders = await prisma.order.findMany({
            where: { consumerId: ngoId },
            include: {
                items: {
                    include: {
                        listing: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const formattedRequests = recentOrders.map(o => {
            const firstItem = o.items[0];
            const restName = firstItem?.restaurantName || "Unknown Restaurant";
            const itemName = firstItem?.name || "Food Items";
            const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
            const unit = firstItem?.listing?.unit || "kg";
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            return {
                id: `REQ-${o.id}`,
                restaurant: restName,
                item: itemName,
                qty: `${totalQty} ${unit}`,
                time: dateStr,
                status: o.status.charAt(0).toUpperCase() + o.status.slice(1)
            };
        });

        // 6. Upcoming Pickups timeline
        const upcomingPickups = await prisma.order.findMany({
            where: {
                consumerId: ngoId,
                status: { in: ["confirmed", "ready", "pending", "approved"] }
            },
            include: {
                items: {
                    include: {
                        listing: {
                            include: {
                                restaurant: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "asc" },
            take: 3
        });

        const formattedPickups = upcomingPickups.map(o => {
            const firstItem = o.items[0];
            const rest = firstItem?.listing?.restaurant;
            let pickupTime = "Anytime";
            if (firstItem?.pickupSlot) {
                const parts = firstItem.pickupSlot.split(" | ");
                pickupTime = parts[1] || parts[0] || "Anytime";
            }

            return {
                id: String(o.id),
                restaurant: rest?.businessName || rest?.name || firstItem?.restaurantName || "Unknown Restaurant",
                address: rest?.address || "Registered Address",
                time: pickupTime,
                items: firstItem?.name || "Food Items",
                qty: `${firstItem?.quantity || 0} ${firstItem?.listing?.unit || "kg"}`,
                status: o.status.charAt(0).toUpperCase() + o.status.slice(1)
            };
        });

        // 7. Alerts
        const alerts = [];
        if (ngoUser.documentRegStatus === "No Document" || !ngoUser.documentReg) {
            alerts.push({
                id: 1,
                type: "warning",
                text: "Registration document is missing. Complete profile verification.",
                link: "/ngo/profile"
            });
        }
        if (ngoUser.document12AStatus === "No Document" || !ngoUser.document12A) {
            alerts.push({
                id: 2,
                type: "warning",
                text: "12A certificate is missing. Complete profile verification.",
                link: "/ngo/profile"
            });
        }
        if (alerts.length === 0) {
            alerts.push({
                id: 3,
                type: "info",
                text: "All documents are verified. You have full platform access.",
                link: "/ngo/profile"
            });
        }

        // 8. 6 Month distribution summary
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap = {};
        const monthsList = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mName = monthNames[d.getMonth()];
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyMap[key] = { name: mName, foodCollected: 0, beneficiaries: 0 };
            monthsList.push(key);
        }

        const distributions = await prisma.distribution.findMany({ where: { ngoId } });
        distributions.forEach(d => {
            const date = new Date(d.distributedAt);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthlyMap[key]) {
                monthlyMap[key].foodCollected += d.quantity;
                monthlyMap[key].beneficiaries += 1;
            }
        });

        const chartData = monthsList.map(key => {
            const m = monthlyMap[key];
            m.foodCollected = parseFloat(m.foodCollected.toFixed(1));
            m.beneficiaries = Math.round(m.beneficiaries);
            return m;
        });

        const { password: _, ...safeUser } = ngoUser;

        res.json({
            user: safeUser,
            activeRequestsCount,
            todayPickupsCount,
            foodSavedThisMonth: parseFloat(foodSavedThisMonth.toFixed(1)),
            beneficiaryReachThisMonth: Math.round(beneficiaryReachThisMonth),
            donationsNearby: topDonations,
            activeRequests: formattedRequests,
            upcomingPickups: formattedPickups,
            alerts,
            monthlyDistributionSummary: chartData
        });
    } catch (err) {
        console.error("getNgoDashboard error:", err);
        res.status(500).json({ error: "Failed to load NGO dashboard" });
    }
}

