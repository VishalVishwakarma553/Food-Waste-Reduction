import prisma from "../lib/prisma.js";

const API_BASE = process.env.API_BASE || "http://localhost:8080";

// Helper to normalize listing data (same shape as publicController)
function normalize(l) {
    const images = (() => {
        try { const arr = JSON.parse(l.images || "[]"); return arr.map(p => `${API_BASE}${p}`); }
        catch { return []; }
    })();
    const dietaryArr = (() => { try { return JSON.parse(l.dietary || "[]"); } catch { return []; } })();
    const dietary = {
        veg: dietaryArr.some(d => /veg/i.test(d) && !/vegan/i.test(d)),
        vegan: dietaryArr.some(d => /vegan/i.test(d)),
        glutenFree: dietaryArr.some(d => /gluten/i.test(d)),
        dairyFree: dietaryArr.some(d => /dairy/i.test(d)),
    };
    const expiresAt = l.expiryDate && l.expiryTime
        ? new Date(`${l.expiryDate}T${l.expiryTime}:00`).toISOString()
        : null;
    const pickupSlots = l.availableFrom && l.availableUntil
        ? [`${fmt(l.availableFrom)} – ${fmt(l.availableUntil)}`]
        : ["Available for pickup"];
    const discount = l.originalPrice > 0
        ? Math.round(((l.originalPrice - l.discountedPrice) / l.originalPrice) * 100)
        : 0;
    return {
        id: String(l.id),
        name: l.name, category: l.category, subCategory: l.subCategory,
        description: l.description || "", tags: l.tags || "",
        ingredients: l.ingredients ? l.ingredients.split(",").map(s => s.trim()) : [],
        allergens: (() => { try { return JSON.parse(l.allergens || "[]"); } catch { return []; } })(),
        storage: l.storage || "",
        originalPrice: l.originalPrice, discountedPrice: l.discountedPrice, discount,
        quantity: l.quantity, unit: l.unit, minOrder: l.minOrder,
        expiryDate: l.expiryDate, expiryTime: l.expiryTime, expiresAt, pickupSlots,
        pickup: l.pickup, delivery: l.delivery, deliveryRadius: l.deliveryRadius,
        packaging: l.packaging, instructions: l.instructions, status: l.status,
        images: images.length ? images : ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"],
        dietary, dietaryArr,
        restaurantId: String(l.restaurantId),
        restaurantName: l.restaurant?.businessName || l.restaurant?.name || "Restaurant",
        restaurantLogo: l.restaurant?.businessImage ? `${API_BASE}${l.restaurant.businessImage}` : null,
        restaurantCity: l.restaurant?.city || null,
        restaurantAddress: l.restaurant?.address || null,
        distance: null, rating: 0, totalReviews: 0, isFeatured: false,
        createdAt: l.createdAt,
        // Add favorited timestamp
        favoritedAt: l.favoritedAt || null,
    };
}

function fmt(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// GET /api/consumer/favorites - list all favorites for the logged-in consumer
export async function getFavorites(req, res) {
    try {
        const userId = req.user.id;
        const rows = await prisma.favorite.findMany({
            where: { userId },
            include: {
                listing: {
                    include: {
                        restaurant: { select: { name: true, businessName: true, businessImage: true, city: true, address: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        const items = rows.map(r => normalize({ ...r.listing, favoritedAt: r.createdAt }));
        res.json({ favorites: items });
    } catch (err) {
        console.error("getFavorites error:", err);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
}

// POST /api/consumer/favorites/:listingId - toggle favorite on/off
export async function toggleFavorite(req, res) {
    try {
        const userId = req.user.id;
        const listingId = parseInt(req.params.listingId);
        if (isNaN(listingId)) return res.status(400).json({ error: "Invalid listing ID" });

        // Check if listing exists
        const listing = await prisma.foodListing.findUnique({ where: { id: listingId } });
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        const existing = await prisma.favorite.findUnique({
            where: { userId_listingId: { userId, listingId } }
        });

        if (existing) {
            await prisma.favorite.delete({ where: { id: existing.id } });
            return res.json({ favorited: false, message: "Removed from favorites" });
        } else {
            await prisma.favorite.create({ data: { userId, listingId } });
            return res.json({ favorited: true, message: "Added to favorites" });
        }
    } catch (err) {
        console.error("toggleFavorite error:", err);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
}
