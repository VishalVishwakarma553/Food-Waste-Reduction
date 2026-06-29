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
            status: status || "active",
        }
    });

    res.status(201).json({ listing, message: "Listing created successfully" });
}

// GET /api/restaurant/listings  - Get all listings for current restaurant (supports ?search=&status= query params)
export async function getListings(req, res) {
    const { search, status } = req.query;
    const where = { restaurantId: req.user.id };
    if (status && status !== 'All') where.status = status.toLowerCase();
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const listings = await prisma.foodListing.findMany({
        where,
        orderBy: { createdAt: "desc" }
    });
    res.json({ listings });
}

// GET /api/restaurant/stats  - Listing counts by status for dashboard
export async function getStats(req, res) {
    const [total, active, draft] = await Promise.all([
        prisma.foodListing.count({ where: { restaurantId: req.user.id } }),
        prisma.foodListing.count({ where: { restaurantId: req.user.id, status: 'active' } }),
        prisma.foodListing.count({ where: { restaurantId: req.user.id, status: 'draft' } }),
    ]);
    res.json({ total, active, draft, expired: total - active - draft });
}

// GET /api/restaurant/listings/export  - Download listings as CSV
export async function exportListingsCSV(req, res) {
    const listings = await prisma.foodListing.findMany({
        where: { restaurantId: req.user.id },
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
        status
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
    if (status !== undefined) data.status = status;

    const updated = await prisma.foodListing.update({ where: { id: listingId }, data });
    res.json({ listing: updated, message: "Listing updated successfully" });
}

// DELETE /api/restaurant/listings/:id  - Delete a listing
export async function deleteListing(req, res) {
    const listingId = parseInt(req.params.id);
    const existing = await prisma.foodListing.findFirst({
        where: { id: listingId, restaurantId: req.user.id }
    });
    if (!existing) return res.status(404).json({ error: "Listing not found" });

    await prisma.foodListing.delete({ where: { id: listingId } });
    res.json({ message: "Listing deleted successfully" });
}
