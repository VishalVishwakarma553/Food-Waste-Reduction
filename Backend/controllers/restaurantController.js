import prisma from "../lib/prisma.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GET /api/restaurant/me  - Get current restaurant profile
export async function getProfile(req, res) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, businessName: true, cuisineType: true,
            businessImage: true, address: true, city: true,
            state: true, pincode: true, createdAt: true,
        }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
}

// PATCH /api/restaurant/settings  - Update restaurant settings
export async function updateSettings(req, res) {
    const { name, phone, address, city, state, pincode, businessName, cuisineType, description,
            latitude, longitude } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (cuisineType !== undefined) updateData.cuisineType = cuisineType;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    // description stored as cuisineType for now (can be added as a field later)

    // If a file was uploaded, set its URL
    if (req.file) {
        updateData.businessImage = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, businessName: true, cuisineType: true,
            businessImage: true, address: true, city: true,
            state: true, pincode: true, latitude: true, longitude: true, createdAt: true,
        }
    });

    res.json({ user: updated, message: "Settings updated successfully" });
}

// POST /api/restaurant/listings  - Create a new food listing
export async function createListing(req, res) {
    const {
        name, category, subCategory, description, tags,
        quantity, unit, originalPrice, discountedPrice, minOrder,
        expiryDate, expiryTime, availableFrom, availableUntil,
        ingredients, allergens, dietary, storage,
        pickup, delivery, deliveryRadius, packaging, instructions,
        status
    } = req.body;

    if (!name || !category || !quantity || !originalPrice || !discountedPrice || !expiryDate || !expiryTime) {
        return res.status(400).json({ error: "Missing required fields: name, category, quantity, prices, expiryDate, expiryTime" });
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
        images = req.files.map(f => `/uploads/${f.filename}`);
    }

    const allowedStatuses = ["active", "draft", "expired"];
    const finalStatus = (status && typeof status === 'string' && allowedStatuses.includes(status)) ? status : "active";

    const listing = await prisma.foodListing.create({
        data: {
            restaurantId: req.user.id,
            name,
            category,
            subCategory: subCategory || null,
            description: description || null,
            tags: tags || null,
            images: JSON.stringify(images),
            quantity: parseFloat(quantity),
            unit: unit || "kg",
            originalPrice: parseFloat(originalPrice),
            discountedPrice: parseFloat(discountedPrice),
            minOrder: minOrder ? parseFloat(minOrder) : null,
            expiryDate,
            expiryTime,
            availableFrom: availableFrom ? new Date(availableFrom) : null,
            availableUntil: availableUntil ? new Date(availableUntil) : null,
            ingredients: ingredients || null,
            allergens: JSON.stringify(allergens ? (Array.isArray(allergens) ? allergens : JSON.parse(allergens)) : []),
            dietary: JSON.stringify(dietary ? (Array.isArray(dietary) ? dietary : JSON.parse(dietary)) : []),
            storage: storage || null,
            pickup: pickup === "true" || pickup === true,
            delivery: delivery === "true" || delivery === true,
            deliveryRadius: deliveryRadius ? parseFloat(deliveryRadius) : null,
            packaging: packaging || null,
            instructions: instructions || null,
            status: finalStatus,
        }
    });

    res.status(201).json({ listing, message: "Listing created successfully" });
}

// GET /api/restaurant/listings  - Get all listings for current restaurant (supports ?search=&status= query params)
export async function getListings(req, res) {
    const { search, status } = req.query;
    const where = { restaurantId: req.user.id };
    if (status && status !== 'All') {
        where.status = status.toLowerCase();
    } else {
        where.status = { not: 'deleted' };
    }
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const listings = await prisma.foodListing.findMany({
        where,
        orderBy: { createdAt: "desc" }
    });
    res.json({ listings });
}

// GET /api/restaurant/listings/:id  - Get a single listing by ID (owned by current restaurant)
export async function getListingById(req, res) {
    const listingId = parseInt(req.params.id);
    if (isNaN(listingId)) return res.status(400).json({ error: "Invalid listing ID" });

    const listing = await prisma.foodListing.findFirst({
        where: { id: listingId, restaurantId: req.user.id }
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ listing });
}

// GET /api/restaurant/stats  - Listing counts by status for dashboard
export async function getStats(req, res) {
    const [total, active, draft] = await Promise.all([
        prisma.foodListing.count({ where: { restaurantId: req.user.id, status: { not: 'deleted' } } }),
        prisma.foodListing.count({ where: { restaurantId: req.user.id, status: 'active' } }),
        prisma.foodListing.count({ where: { restaurantId: req.user.id, status: 'draft' } }),
    ]);
    res.json({ total, active, draft, expired: total - active - draft });
}

// GET /api/restaurant/listings/export  - Download listings as CSV
export async function exportListingsCSV(req, res) {
    const listings = await prisma.foodListing.findMany({
        where: { restaurantId: req.user.id, status: { not: 'deleted' } },
        orderBy: { createdAt: 'desc' }
    });

    const headers = ['ID','Name','Category','Sub-Category','Status','Quantity','Unit','Original Price','Discounted Price','Expiry Date','Expiry Time','Pickup','Delivery','Created At'];
    const rows = listings.map(l => [
        l.id, l.name, l.category, l.subCategory || '',
        l.status, l.quantity, l.unit, l.originalPrice, l.discountedPrice,
        l.expiryDate, l.expiryTime, l.pickup, l.delivery,
        l.createdAt.toISOString()
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="listings.csv"');
    res.send(csv);
}

// PATCH /api/restaurant/listings/:id  - Update a listing
export async function updateListing(req, res) {
    const listingId = parseInt(req.params.id);
    const existing = await prisma.foodListing.findFirst({
        where: { id: listingId, restaurantId: req.user.id }
    });
    if (!existing) return res.status(404).json({ error: "Listing not found" });

    const {
        name, category, subCategory, description, tags,
        quantity, unit, originalPrice, discountedPrice, minOrder,
        expiryDate, expiryTime, availableFrom, availableUntil,
        ingredients, allergens, dietary, storage,
        pickup, delivery, deliveryRadius, packaging, instructions,
        status, existingImages
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (subCategory !== undefined) data.subCategory = subCategory;
    if (description !== undefined) data.description = description;
    if (tags !== undefined) data.tags = tags;
    if (quantity !== undefined) data.quantity = parseFloat(quantity);
    if (unit !== undefined) data.unit = unit;
    if (originalPrice !== undefined) data.originalPrice = parseFloat(originalPrice);
    if (discountedPrice !== undefined) data.discountedPrice = parseFloat(discountedPrice);
    if (minOrder !== undefined) data.minOrder = minOrder ? parseFloat(minOrder) : null;
    if (expiryDate !== undefined) data.expiryDate = expiryDate;
    if (expiryTime !== undefined) data.expiryTime = expiryTime;
    if (availableFrom !== undefined) data.availableFrom = availableFrom ? new Date(availableFrom) : null;
    if (availableUntil !== undefined) data.availableUntil = availableUntil ? new Date(availableUntil) : null;
    if (ingredients !== undefined) data.ingredients = ingredients;
    if (allergens !== undefined) data.allergens = JSON.stringify(Array.isArray(allergens) ? allergens : JSON.parse(allergens));
    if (dietary !== undefined) data.dietary = JSON.stringify(Array.isArray(dietary) ? dietary : JSON.parse(dietary));
    if (storage !== undefined) data.storage = storage;
    if (pickup !== undefined) data.pickup = pickup === "true" || pickup === true;
    if (delivery !== undefined) data.delivery = delivery === "true" || delivery === true;
    if (deliveryRadius !== undefined) data.deliveryRadius = deliveryRadius ? parseFloat(deliveryRadius) : null;
    if (packaging !== undefined) data.packaging = packaging;
    if (instructions !== undefined) data.instructions = instructions;
    if (status !== undefined) {
        const allowedStatuses = ["active", "draft", "expired"];
        if (typeof status === 'string' && allowedStatuses.includes(status)) {
            data.status = status;
        }
    }

    // Build final image array: kept existing paths + newly uploaded files
    const keptImages = existingImages
        ? (typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages)
        : [];
    const newImagePaths = (req.files && req.files.length > 0)
        ? req.files.map(f => `/uploads/${f.filename}`)
        : [];
    if (existingImages !== undefined || (req.files && req.files.length > 0)) {
        data.images = JSON.stringify([...keptImages, ...newImagePaths]);
    }

    const updated = await prisma.foodListing.update({ where: { id: listingId }, data });
    res.json({ listing: updated, message: "Listing updated successfully" });
}

// DELETE /api/restaurant/listings/:id  - Delete a listing
export async function deleteListing(req, res) {
    try {
        const listingId = parseInt(req.params.id);
        if (isNaN(listingId)) return res.status(400).json({ error: "Invalid listing ID" });

        const existing = await prisma.foodListing.findFirst({
            where: { id: listingId, restaurantId: req.user.id }
        });
        if (!existing) return res.status(404).json({ error: "Listing not found" });

        // Update status to "deleted" (soft delete) instead of deleting from database
        // to preserve foreign key references in OrderItem and keep stats/history intact.
        await prisma.foodListing.update({
            where: { id: listingId },
            data: { status: "deleted" }
        });

        // Also clean up favorites for this listing, since it is no longer available
        await prisma.favorite.deleteMany({
            where: { listingId }
        });

        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        console.error("deleteListing error:", err);
        res.status(500).json({ error: "Failed to delete listing" });
    }
}

// GET /api/restaurant/dashboard - get dynamic dashboard stats, recent orders, weekly impact, and alerts
export async function getRestaurantDashboard(req, res) {
    try {
        const restaurantId = req.user.id;

        // 1. Get Listings Stats (Active, Draft, Expired, Total)
        const [totalListings, activeListings, draftListings] = await Promise.all([
            prisma.foodListing.count({ where: { restaurantId, status: { not: 'deleted' } } }),
            prisma.foodListing.count({ where: { restaurantId, status: 'active' } }),
            prisma.foodListing.count({ where: { restaurantId, status: 'draft' } }),
        ]);
        const stats = {
            total: totalListings,
            active: activeListings,
            draft: draftListings,
            expired: totalListings - activeListings - draftListings
        };

        // 2. Fetch recent orders (latest 5)
        const dbOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            },
            include: {
                consumer: {
                    select: { name: true }
                },
                items: {
                    where: {
                        listing: { restaurantId }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        const recentOrders = dbOrders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalWeight = order.items.reduce((sum, item) => sum + 0.4 * item.quantity, 0);
            
            // Format time
            const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Format pickup
            const pickupStr = order.items[0]?.pickupSlot || "Anytime";

            // Capitalize status
            const capitalizedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);

            return {
                id: `ORD-${order.id}`,
                dbId: order.id, // Keep the actual database integer ID for API calls
                customer: order.consumer?.name || "Guest User",
                items: itemCount,
                time: timeStr,
                pickup: pickupStr,
                status: capitalizedStatus,
                weight: `${totalWeight.toFixed(1)} kg`
            };
        });

        // 3. Generate Chart Data
        const now = new Date();
        const startOfThisWeek = new Date();
        startOfThisWeek.setDate(now.getDate() - 6);
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfLastWeek = new Date();
        startOfLastWeek.setDate(now.getDate() - 13);
        startOfLastWeek.setHours(0, 0, 0, 0);

        const startOfThisMonth = new Date();
        startOfThisMonth.setDate(now.getDate() - 29);
        startOfThisMonth.setHours(0, 0, 0, 0);

        // Fetch all orders of the last 30 days for this restaurant
        const monthlyOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startOfThisMonth },
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            },
            include: {
                items: {
                    where: {
                        listing: { restaurantId }
                    }
                }
            }
        });

        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        // This Week dataset (last 7 days)
        const thisWeekChart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            thisWeekChart.push({
                name: dayNames[d.getDay()],
                mealsProvided: 0,
                orders: 0,
                dateStr: d.toDateString()
            });
        }

        // Last Week dataset (7-13 days ago)
        const lastWeekChart = [];
        for (let i = 13; i >= 7; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            lastWeekChart.push({
                name: dayNames[d.getDay()],
                mealsProvided: 0,
                orders: 0,
                dateStr: d.toDateString()
            });
        }

        // This Month dataset (last 30 days)
        const thisMonthChart = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            thisMonthChart.push({
                name: d.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
                mealsProvided: 0,
                orders: 0,
                dateStr: d.toDateString()
            });
        }

        monthlyOrders.forEach(order => {
            const orderDateStr = new Date(order.createdAt).toDateString();
            const orderMeals = order.items.reduce((sum, item) => sum + item.quantity, 0);

            // Populate this week
            const thisWeekMatch = thisWeekChart.find(day => day.dateStr === orderDateStr);
            if (thisWeekMatch) {
                thisWeekMatch.orders += 1;
                thisWeekMatch.mealsProvided += orderMeals;
            }

            // Populate last week
            const lastWeekMatch = lastWeekChart.find(day => day.dateStr === orderDateStr);
            if (lastWeekMatch) {
                lastWeekMatch.orders += 1;
                lastWeekMatch.mealsProvided += orderMeals;
            }

            // Populate this month
            const thisMonthMatch = thisMonthChart.find(day => day.dateStr === orderDateStr);
            if (thisMonthMatch) {
                thisMonthMatch.orders += 1;
                thisMonthMatch.mealsProvided += orderMeals;
            }
        });

        // Cleanup temp dateStr
        thisWeekChart.forEach(d => delete d.dateStr);
        lastWeekChart.forEach(d => delete d.dateStr);
        thisMonthChart.forEach(d => delete d.dateStr);

        // 4. Generate Alerts
        const alerts = [];
        
        // Warning: active listings expiring in the next 24 hours
        const activeListingsForExpiry = await prisma.foodListing.findMany({
            where: { restaurantId, status: 'active' }
        });

        let expiringSoonCount = 0;
        const currentTimestamp = new Date();
        activeListingsForExpiry.forEach(l => {
            if (l.expiryDate && l.expiryTime) {
                const expDate = new Date(`${l.expiryDate}T${l.expiryTime}:00`);
                const hoursLeft = (expDate - currentTimestamp) / (1000 * 60 * 60);
                if (hoursLeft > 0 && hoursLeft <= 24) {
                    expiringSoonCount++;
                }
            }
        });

        if (expiringSoonCount > 0) {
            alerts.push({
                id: 1,
                type: 'warning',
                text: `${expiringSoonCount} item${expiringSoonCount > 1 ? 's' : ''} expiring in less than 24 hours`,
                link: '/restaurant/listings'
            });
        }

        // Info: pending orders requiring confirmation
        const pendingOrdersCount = await prisma.order.count({
            where: {
                status: 'pending',
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            }
        });

        if (pendingOrdersCount > 0) {
            alerts.push({
                id: 2,
                type: 'info',
                text: `${pendingOrdersCount} pending order${pendingOrdersCount > 1 ? 's' : ''} need${pendingOrdersCount === 1 ? 's' : ''} action`,
                link: '/restaurant/orders'
            });
        }

        // Success: Milestone alert
        const completedOrdersMeals = await prisma.order.findMany({
            where: {
                status: 'completed',
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            },
            include: {
                items: {
                    where: { listing: { restaurantId } }
                }
            }
        });

        const totalMealsProvided = completedOrdersMeals.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        if (totalMealsProvided >= 500) {
            alerts.push({
                id: 3,
                type: 'success',
                text: `You hit a new milestone: ${Math.round(totalMealsProvided)} meals provided!`,
                link: '#'
            });
        } else if (totalMealsProvided >= 100) {
            alerts.push({
                id: 3,
                type: 'success',
                text: `You hit a milestone: ${Math.round(totalMealsProvided)} meals provided!`,
                link: '#'
            });
        } else {
            alerts.push({
                id: 3,
                type: 'success',
                text: `Great job! Rescued ${Math.round(totalMealsProvided)} meals so far.`,
                link: '#'
            });
        }

        res.json({
            stats,
            recentOrders,
            chartData: {
                thisWeek: thisWeekChart,
                lastWeek: lastWeekChart,
                thisMonth: thisMonthChart
            },
            alerts
        });

    } catch (err) {
        console.error("getRestaurantDashboard error:", err);
        res.status(500).json({ error: "Failed to load restaurant dashboard" });
    }
}

// GET /api/restaurant/analytics - get dynamic analytics metrics, weekly meals, monthly food saved, and category pie chart
export async function getRestaurantAnalytics(req, res) {
    try {
        const restaurantId = req.user.id;

        // 1. Calculate overall metrics for completed orders
        const completedOrders = await prisma.order.findMany({
            where: {
                status: 'completed',
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            },
            include: {
                items: {
                    where: {
                        listing: { restaurantId }
                    },
                    include: {
                        listing: { select: { category: true } }
                    }
                }
            }
        });

        const totalMealsProvided = completedOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        const totalPickups = completedOrders.length;
        const totalFoodSavedKg = completedOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + 0.4 * item.quantity, 0);
        }, 0);

        // 2. Trend Calculations (This week vs last week)
        const now = new Date();
        const startOfThisWeek = new Date();
        startOfThisWeek.setDate(now.getDate() - 6);
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfLastWeek = new Date();
        startOfLastWeek.setDate(now.getDate() - 13);
        startOfLastWeek.setHours(0, 0, 0, 0);

        const thisWeekCompleted = completedOrders.filter(o => new Date(o.createdAt) >= startOfThisWeek);
        const lastWeekCompleted = completedOrders.filter(o => {
            const date = new Date(o.createdAt);
            return date >= startOfLastWeek && date < startOfThisWeek;
        });

        // W1 = this week meals, W2 = last week meals
        const thisWeekMeals = thisWeekCompleted.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const lastWeekMeals = lastWeekCompleted.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const mealsTrend = lastWeekMeals > 0 
            ? `${thisWeekMeals >= lastWeekMeals ? '+' : ''}${Math.round((thisWeekMeals - lastWeekMeals) / lastWeekMeals * 100)}%`
            : (thisWeekMeals > 0 ? '+100%' : 'Stable');

        // Pickups Trend
        const thisWeekPickups = thisWeekCompleted.length;
        const lastWeekPickups = lastWeekCompleted.length;
        const pickupsTrend = lastWeekPickups > 0
            ? `${thisWeekPickups >= lastWeekPickups ? '+' : ''}${Math.round((thisWeekPickups - lastWeekPickups) / lastWeekPickups * 100)}%`
            : (thisWeekPickups > 0 ? '+100%' : 'Stable');

        // Kg Saved Trend
        const thisWeekKg = thisWeekCompleted.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + 0.4 * item.quantity, 0), 0);
        const lastWeekKg = lastWeekCompleted.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + 0.4 * item.quantity, 0), 0);
        const kgTrend = lastWeekKg > 0
            ? `${thisWeekKg >= lastWeekKg ? '+' : ''}${Math.round((thisWeekKg - lastWeekKg) / lastWeekKg * 100)}%`
            : (thisWeekKg > 0 ? '+100%' : 'Stable');

        // 3. Weekly impact data for Chart: Meals Provided & Pickups (This Week)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyImpact = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            weeklyImpact.push({
                name: dayNames[d.getDay()],
                mealsProvided: 0,
                orders: 0,
                kgSaved: 0,
                dateStr: d.toDateString()
            });
        }

        completedOrders.forEach(order => {
            const orderDateStr = new Date(order.createdAt).toDateString();
            const match = weeklyImpact.find(day => day.dateStr === orderDateStr);
            if (match) {
                const meals = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const kg = order.items.reduce((sum, item) => sum + 0.4 * item.quantity, 0);
                match.orders += 1;
                match.mealsProvided += meals;
                match.kgSaved += parseFloat(kg.toFixed(1));
            }
        });
        weeklyImpact.forEach(d => delete d.dateStr);

        // 4. Food Saved Monthly: Weeks 1 to 4 (last 28 days)
        const weeklyBuckets = [
            { name: 'Week 1', kg: 0, start: 27, end: 21 },
            { name: 'Week 2', kg: 0, start: 20, end: 14 },
            { name: 'Week 3', kg: 0, start: 13, end: 7 },
            { name: 'Week 4', kg: 0, start: 6, end: 0 }
        ];

        completedOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const daysAgo = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
            
            const matchBucket = weeklyBuckets.find(b => daysAgo >= b.end && daysAgo <= b.start);
            if (matchBucket) {
                const kg = order.items.reduce((sum, item) => sum + 0.4 * item.quantity, 0);
                matchBucket.kg += kg;
            }
        });

        const foodSavedData = weeklyBuckets.map(b => ({
            name: b.name,
            kg: parseFloat(b.kg.toFixed(1))
        }));

        // 5. Category Breakdown Pie Chart
        const categoryMap = {};
        completedOrders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.listing?.category || "Other";
                if (!categoryMap[cat]) categoryMap[cat] = 0;
                categoryMap[cat] += item.quantity;
            });
        });

        const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(1))
        }));

        // Fallback for category breakdown if no sales yet
        if (categoryData.length === 0) {
            categoryData.push({ name: "No Sales", value: 0 });
        }

        res.json({
            metrics: {
                totalMealsProvided: Math.round(totalMealsProvided),
                mealsTrend,
                totalPickups,
                pickupsTrend,
                totalFoodSavedKg: parseFloat(totalFoodSavedKg.toFixed(1)),
                kgTrend,
                avgRating: "4.8",
                ratingTrend: "Stable"
            },
            weeklyImpact,
            foodSavedData,
            categoryData
        });

    } catch (err) {
        console.error("getRestaurantAnalytics error:", err);
        res.status(500).json({ error: "Failed to load restaurant analytics" });
    }
}

