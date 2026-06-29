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

// Normalize a flat raw-SQL row (from PostGIS proximity query) into the same FoodCard shape
function normalizeRaw(row) {
    const images = (() => {
        try { const arr = JSON.parse(row.images || "[]"); return arr.map(p => `${API_BASE}${p}`); }
        catch { return []; }
    })();

    const dietaryArr = (() => {
        try { return JSON.parse(row.dietary || "[]"); } catch { return []; }
    })();

    const allergens = (() => {
        try { return JSON.parse(row.allergens || "[]"); } catch { return []; }
    })();

    const dietary = {
        veg: dietaryArr.some(d => /veg/i.test(d) && !/vegan/i.test(d)),
        vegan: dietaryArr.some(d => /vegan/i.test(d)),
        glutenFree: dietaryArr.some(d => /gluten/i.test(d)),
        dairyFree: dietaryArr.some(d => /dairy/i.test(d)),
    };

    const expiresAt = row.expiryDate && row.expiryTime
        ? new Date(`${row.expiryDate}T${row.expiryTime}:00`).toISOString()
        : null;

    const pickupSlots = row.availableFrom && row.availableUntil
        ? [`${fmt(row.availableFrom)} – ${fmt(row.availableUntil)}`]
        : ["Available for pickup"];

    const discount = parseFloat(row.originalPrice) > 0
        ? Math.round(((parseFloat(row.originalPrice) - parseFloat(row.discountedPrice)) / parseFloat(row.originalPrice)) * 100)
        : 0;

    return {
        id: String(row.id),
        name: row.name,
        category: row.category,
        subCategory: row.subCategory,
        description: row.description || "",
        tags: row.tags || "",
        ingredients: row.ingredients ? row.ingredients.split(",").map(s => s.trim()) : [],
        allergens,
        storage: row.storage || "",
        originalPrice: parseFloat(row.originalPrice),
        discountedPrice: parseFloat(row.discountedPrice),
        discount,
        quantity: parseFloat(row.quantity),
        unit: row.unit,
        minOrder: row.minOrder ? parseFloat(row.minOrder) : null,
        expiryDate: row.expiryDate,
        expiryTime: row.expiryTime,
        expiresAt,
        pickupSlots,
        pickup: row.pickup,
        delivery: row.delivery,
        deliveryRadius: row.deliveryRadius ? parseFloat(row.deliveryRadius) : null,
        packaging: row.packaging,
        instructions: row.instructions,
        status: row.status,
        images: images.length ? images : ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"],
        dietary,
        dietaryArr,
        restaurantId: String(row.restaurantId),
        restaurantName: row.restaurantBusinessName || row.restaurantPersonName || "Restaurant",
        restaurantLogo: row.restaurantBusinessImage ? `${API_BASE}${row.restaurantBusinessImage}` : null,
        restaurantCity: row.restaurantCity || null,
        restaurantAddress: row.restaurantAddress || null,
        // Real distance from PostGIS ST_Distance, in km, rounded to 1 decimal
        distance: row.distance != null ? Math.round(parseFloat(row.distance) * 10) / 10 : null,
        rating: 0,
        totalReviews: 0,
        isFeatured: false,
        createdAt: row.createdAt,
    };
}

function fmt(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// GET /api/public/listings
// Supports: ?search=&category=&dietary=veg,vegan&sort=expiry|price-asc|price-desc|discount|distance
//           &maxPrice=&pickup=&delivery=&page=&limit=
//           &lat=&lng=&radius= (km, default 20) — activates PostGIS proximity query
export async function getPublicListings(req, res) {
    const {
        search, category, dietary, sort = "expiry",
        maxPrice, pickup, delivery,
        page = "1", limit = "20",
        lat, lng, radius = "20",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const dietaryFilters = dietary ? dietary.split(",").map(d => d.trim().toLowerCase()).filter(Boolean) : [];

    // ── PostGIS path: when caller provides coordinates ───────────────────────
    if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusMeters = parseFloat(radius) * 1000;

        // Build optional WHERE fragments for search/category/price/logistics
        const extraClauses = [];
        if (search) {
            extraClauses.push(`(
                l.name ILIKE '%' || ${JSON.stringify(search)} || '%' OR
                l.description ILIKE '%' || ${JSON.stringify(search)} || '%' OR
                l.tags ILIKE '%' || ${JSON.stringify(search)} || '%' OR
                r."businessName" ILIKE '%' || ${JSON.stringify(search)} || '%'
            )`);
        }
        if (category && category !== "All") {
            const catMap = { "Fresh Produce": "Produce" };
            const dbCat = catMap[category] || category;
            extraClauses.push(`l.category = ${JSON.stringify(dbCat)}`);
        }
        if (maxPrice) extraClauses.push(`l."discountedPrice" <= ${parseFloat(maxPrice)}`);
        if (pickup === "true") extraClauses.push(`l.pickup = true`);
        if (delivery === "true") extraClauses.push(`l.delivery = true`);

        const extraWhere = extraClauses.length ? `AND ${extraClauses.join(" AND ")}` : "";

        // ORDER BY: distance when sort=distance or default, otherwise price/expiry
        const orderClause = (() => {
            switch (sort) {
                case "price-asc":  return `l."discountedPrice" ASC`;
                case "price-desc": return `l."discountedPrice" DESC`;
                case "discount":   return `l."originalPrice" DESC`;
                default:           return `distance ASC`; // distance & expiry both default to proximity
            }
        })();

        try {
            const rows = await prisma.$queryRawUnsafe(`
                SELECT
                    l.id::int,
                    l."restaurantId"::int,
                    l.name,
                    l.category,
                    l."subCategory",
                    l.description,
                    l.tags,
                    l.images,
                    l.city,
                    l.quantity::float,
                    l.unit,
                    l."originalPrice"::float,
                    l."discountedPrice"::float,
                    l."minOrder"::float,
                    l."expiryDate",
                    l."expiryTime",
                    l."availableFrom",
                    l."availableUntil",
                    l.ingredients,
                    l.allergens,
                    l.dietary,
                    l.storage,
                    l.pickup,
                    l.delivery,
                    l."deliveryRadius"::float,
                    l.packaging,
                    l.instructions,
                    l.status,
                    l."createdAt",
                    r."businessName"  AS "restaurantBusinessName",
                    r."name"          AS "restaurantPersonName",
                    r."businessImage" AS "restaurantBusinessImage",
                    r.address         AS "restaurantAddress",
                    r.city            AS "restaurantCity",
                    ROUND(
                        (ST_Distance(
                            r.coords,
                            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                        ) / 1000.0)::numeric, 2
                    )::float AS distance
                FROM "FoodListing" l
                JOIN "User" r ON l."restaurantId" = r.id
                WHERE l.status = 'active'
                  AND r.coords IS NOT NULL
                  AND ST_DWithin(
                        r.coords,
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                        $3
                  )
                ${extraWhere}
                ORDER BY ${orderClause}
                LIMIT $4 OFFSET $5
            `, longitude, latitude, radiusMeters, take, skip);

            // Count total matches (same WHERE, no pagination)
            const countRows = await prisma.$queryRawUnsafe(`
                SELECT COUNT(l.id)::int AS total
                FROM "FoodListing" l
                JOIN "User" r ON l."restaurantId" = r.id
                WHERE l.status = 'active'
                  AND r.coords IS NOT NULL
                  AND ST_DWithin(
                        r.coords,
                        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                        $3
                  )
                ${extraWhere}
            `, longitude, latitude, radiusMeters);

            let items = rows.map(normalizeRaw);

            // Post-query dietary filter (dietary stored as JSON string)
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

            const total = countRows[0]?.total ?? 0;
            return res.json({ listings: items, total, page: parseInt(page), limit: take, proximityEnabled: true });
        } catch (err) {
            console.error("PostGIS proximity query failed, falling back to standard query:", err);
            // Fall through to standard Prisma query below
        }
    }

    // ── Standard Prisma path (no coordinates or PostGIS fallback) ────────────
    const where = { status: "active" };

    if (search) {
        where.AND = [{
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { contains: search, mode: "insensitive" } },
                { restaurant: { businessName: { contains: search, mode: "insensitive" } } },
            ]
        }];
    }

    if (category && category !== "All") {
        const catMap = { "Fresh Produce": "Produce", "Prepared Meals": "Prepared Meals", "Bakery": "Bakery", "Dairy": "Dairy" };
        where.category = catMap[category] || category;
    }

    if (maxPrice) where.discountedPrice = { lte: parseFloat(maxPrice) };
    if (pickup === "true") where.pickup = true;
    if (delivery === "true") where.delivery = true;

    // Ordering
    const orderBy = (() => {
        switch (sort) {
            case "price-asc": return { discountedPrice: "asc" };
            case "price-desc": return { discountedPrice: "desc" };
            case "discount": return { originalPrice: "desc" };
            default: return { expiryDate: "asc" }; // expiry soon first
        }
    })();

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

    res.json({ listings: items, total, page: parseInt(page), limit: take, proximityEnabled: false });
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
