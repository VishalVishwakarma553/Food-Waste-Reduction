import prisma from "../lib/prisma.js";

const API_BASE = process.env.API_BASE || "http://localhost:8080";

// Normalize a DB FoodListing row into the shape the frontend FoodCard expects
function normalize(l) {
    // Parse JSON fields
    const images = (() => {
        try { const arr = JSON.parse(l.images || "[]"); return arr.map(p => `${API_BASE}${p}`); }
        catch { return []; }
    })();

    const dietaryArr = (() => {
        try { return JSON.parse(l.dietary || "[]"); } catch { return []; }
    })();

    const allergens = (() => {
        try { return JSON.parse(l.allergens || "[]"); } catch { return []; }
    })();

    // Build dietary object matching the mock shape FoodCard uses
    const dietary = {
        veg: dietaryArr.some(d => /veg/i.test(d) && !/vegan/i.test(d)),
        vegan: dietaryArr.some(d => /vegan/i.test(d)),
        glutenFree: dietaryArr.some(d => /gluten/i.test(d)),
        dairyFree: dietaryArr.some(d => /dairy/i.test(d)),
    };

    // Compute expiresAt from expiryDate (YYYY-MM-DD) + expiryTime (HH:MM)
    const expiresAt = l.expiryDate && l.expiryTime
        ? new Date(`${l.expiryDate}T${l.expiryTime}:00`).toISOString()
        : null;

    // Derive pickupSlots from availableFrom/availableUntil or fallback
    const pickupSlots = l.availableFrom && l.availableUntil
        ? [`${fmt(l.availableFrom)} – ${fmt(l.availableUntil)}`]
        : ["Available for pickup"];

    const discount = l.originalPrice > 0
        ? Math.round(((l.originalPrice - l.discountedPrice) / l.originalPrice) * 100)
        : 0;

    return {
        id: String(l.id),
        name: l.name,
        category: l.category,
        subCategory: l.subCategory,
        description: l.description || "",
        tags: l.tags || "",
        ingredients: l.ingredients ? l.ingredients.split(",").map(s => s.trim()) : [],
        allergens,
        storage: l.storage || "",
        originalPrice: l.originalPrice,
        discountedPrice: l.discountedPrice,
        discount,
        quantity: l.quantity,
        unit: l.unit,
        minOrder: l.minOrder,
        expiryDate: l.expiryDate,
        expiryTime: l.expiryTime,
        expiresAt,
        pickupSlots,
        pickup: l.pickup,
        delivery: l.delivery,
        deliveryRadius: l.deliveryRadius,
        packaging: l.packaging,
        instructions: l.instructions,
        status: l.status,
        images: images.length ? images : ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"],
        dietary,
        dietaryArr,
        restaurantId: String(l.restaurantId),
        restaurantName: l.restaurant?.businessName || l.restaurant?.name || "Restaurant",
        restaurantLogo: l.restaurant?.businessImage ? `${API_BASE}${l.restaurant.businessImage}` : null,
        restaurantCity: l.restaurant?.city || null,
        restaurantAddress: l.restaurant?.address || null,
        // distance: not in DB — frontend handles gracefully
        distance: null,
        rating: 0,        // ponytail: no reviews model yet — UI shows 0 gracefully
        totalReviews: 0,
        isFeatured: false,
        createdAt: l.createdAt,
    };
}

function fmt(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// GET /api/public/listings
// Supports: ?search=&category=&dietary=veg,vegan&sort=expiry|price-asc|price-desc|discount&maxPrice=&pickup=&delivery=&page=&limit=
export async function getPublicListings(req, res) {
    const {
        search, category, dietary, sort = "expiry",
        maxPrice, pickup, delivery,
        page = "1", limit = "20"
    } = req.query;

    const where = { status: "active" };

    if (search) {
        // ponytail: explicit AND so status filter isn't overridden by OR
        where.AND = [
            {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { tags: { contains: search, mode: "insensitive" } },
                    { restaurant: { businessName: { contains: search, mode: "insensitive" } } },
                ]
            }
        ];
    }

    if (category && category !== "All") {
        const catMap = { "Fresh Produce": "Produce", "Prepared Meals": "Prepared Meals", "Bakery": "Bakery", "Dairy": "Dairy" };
        where.category = catMap[category] || category;
    }

    if (maxPrice) where.discountedPrice = { lte: parseFloat(maxPrice) };
    if (pickup === "true") where.pickup = true;
    if (delivery === "true") where.delivery = true;

    // Dietary filter: filter on JSON string contents (Prisma string contains)
    // ponytail: dietary is stored as JSON array string — filter post-query since Prisma can't query JSON arrays on SQLite/Postgres without jsonb operators
    const dietaryFilters = dietary ? dietary.split(",").map(d => d.trim().toLowerCase()).filter(Boolean) : [];

    // Ordering
    const orderBy = (() => {
        switch (sort) {
            case "price-asc": return { discountedPrice: "asc" };
            case "price-desc": return { discountedPrice: "desc" };
            case "discount": return { originalPrice: "desc" }; // highest original = highest discount roughly
            default: return { expiryDate: "asc" }; // expiry soon first
        }
    })();

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [rows, total] = await Promise.all([
        prisma.foodListing.findMany({
            where,
            include: {
                restaurant: { select: { name: true, businessName: true, businessImage: true, city: true, address: true } }
            },
            orderBy,
            skip,
            take,
        }),
        prisma.foodListing.count({ where }),
    ]);

    let items = rows.map(normalize);

    // Post-query dietary filter
    if (dietaryFilters.length) {
        items = items.filter(item =>
            dietaryFilters.every(f => {
                if (f === "veg") return item.dietary.veg;
                if (f === "vegan") return item.dietary.vegan;
                if (f === "gluten-free") return item.dietary.glutenFree;
                if (f === "dairy-free") return item.dietary.dairyFree;
                return true;
            })
        );
    }

    res.json({ listings: items, total, page: parseInt(page), limit: take });
}

// GET /api/public/listings/:id
export async function getPublicListing(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const l = await prisma.foodListing.findFirst({
        where: { id, status: "active" },
        include: {
            restaurant: { select: { name: true, businessName: true, businessImage: true, city: true, address: true, phone: true } }
        }
    });
    if (!l) return res.status(404).json({ error: "Listing not found" });
    res.json({ listing: normalize(l) });
}

// GET /api/public/categories - return distinct categories with counts
export async function getCategories(req, res) {
    const rows = await prisma.foodListing.groupBy({
        by: ["category"],
        where: { status: "active" },
        _count: { category: true },
    });
    res.json({ categories: rows.map(r => ({ name: r.category, count: r._count.category })) });
}
