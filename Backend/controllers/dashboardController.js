import prisma from "../lib/prisma.js";

// GET /api/consumer/dashboard --- live stats, recent orders, nearby listings, badges, chart
export async function getDashboard(req, res) {
    try {
        const userId = req.user.id;

        const [orders, , listRows] = await Promise.all([
            prisma.order.findMany({
                where: { consumerId: userId },
                include: {
                    items: {
                        include: {
                            listing: {
                                select: {
                                    id: true, name: true,
                                    originalPrice: true,
                                    discountedPrice: true, images: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { city: true },
            }),
            prisma.foodListing.findMany({
                where: { status: "active" },
                select: {
                    id: true, name: true, category: true,
                    originalPrice: true, discountedPrice: true,
                    images: true, status: true, restaurantId: true,
                    createdAt: true,
                    restaurant: {
                        select: {
                            businessName: true, name: true, city: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
        ]);

        // Stats
        const totalOrders = orders.length;
        const totalFoodSaved = orders.reduce((s, o) => s + (o.foodSaved || 0), 0);
        const totalMoneySaved = orders.reduce((s, o) => {
            const itemVal = o.items.reduce(
                (a, i) => a + (i.listing
                    ? (i.listing.originalPrice - i.listing.discountedPrice) * i.quantity
                    : 0),
                0
            );
            return s + itemVal;
        }, 0);

        // Recent orders (3)
        const recentOrders = orders.slice(0, 3).map((o) => ({
            id: o.id,
            status: o.status,
            createdAt: o.createdAt,
            totalAmount: o.items.reduce(
                (a, i) => a + (i.listing ? i.listing.discountedPrice * i.quantity : 0),
                0
            ),
            restaurantLogo: o.items[0]?.listing?.images
                ? JSON.parse(o.items[0].listing.images)[0]
                : null,
            restaurantName: o.items[0]?.listing?.name || "Restaurant",
        }));

        // Nearby listings - complete with all FoodCard fields
        const API_BASE = process.env.API_BASE || "http://localhost:8080";

        const nearbyListings = listRows.map((l) => {
            const imgs = (() => {
                try { return JSON.parse(l.images || "[]"); }
                catch { return []; }
            })();
            const safeImgs = imgs.length ? imgs.map(p => `${API_BASE}${p}`) : ["https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"];

            const discount = l.originalPrice > 0
                ? Math.round(((l.originalPrice - l.discountedPrice) / l.originalPrice) * 100)
                : 0;

            const expiresAt = l.expiryDate && l.expiryTime
                ? new Date(`${l.expiryDate}T${l.expiryTime}:00`).toISOString()
                : null;

            return {
                ...l, // carry all DB fields through
                id: String(l.id),
                restaurantId: String(l.restaurantId),
                images: safeImgs,
                discount,
                expiresAt,
                expiryDate: l.expiryDate,
                expiryTime: l.expiryTime,
                restaurantName: l.restaurant.businessName || l.restaurant.name || "Restaurant",
                restaurantLogo: l.restaurant.businessImage ? `${API_BASE}${l.restaurant.businessImage}` : null,
                restaurantCity: l.restaurant.city || null,
                restaurantAddress: l.restaurant.address || null,
                pickupSlots: ["Available for pickup"],
                pickup: true,
                delivery: false,
                dietary: { veg: true, vegan: false, glutenFree: true, dairyFree: false },
                distance: null,
                rating: 0,
                totalReviews: 0,
                isFeatured: false,
            };
        });

        // Functional badges
        const badges = [
            { id: "b1", name: "First Order",  icon: "🌱", earned: totalOrders >= 1      },
            { id: "b2", name: "Food Saver",   icon: "⭐", earned: totalOrders >= 5      },
            { id: "b3", name: "Eco Warrior",  icon: "🌿", earned: totalFoodSaved >= 10  },
            { id: "b4", name: "Regular",      icon: "🌅", earned: totalOrders >= 10     },
            { id: "b5", name: "Champion",     icon: "🏆", earned: totalFoodSaved >= 25  },
            { id: "b6", name: "Zero Waste Hero", icon: "♻️", earned: totalOrders >= 20 },
            { id: "b7", name: "Foodie",       icon: "🍽", earned: totalOrders >= 5     },
            { id: "b8", name: "Legend",       icon: "👑", earned: totalFoodSaved >= 50  },
        ];

        // Last 6 months dynamic chart data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = monthNames[d.getMonth()];
            monthlyData.push({
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                monthName,
                foodSaved: 0,
                moneySaved: 0,
                orders: 0
            });
        }

        orders.forEach(o => {
            const orderDate = new Date(o.createdAt);
            const match = monthlyData.find(m => m.year === orderDate.getFullYear() && m.monthIndex === orderDate.getMonth());
            if (match) {
                match.foodSaved += o.foodSaved || 0;
                match.orders += 1;
                const itemVal = o.items.reduce((a, i) => a + (i.listing ? (i.listing.originalPrice - i.listing.discountedPrice) * i.quantity : 0), 0);
                match.moneySaved += itemVal;
            }
        });

        const chartData = monthlyData.map(m => ({
            period: m.monthName,
            foodSaved: parseFloat(m.foodSaved.toFixed(1)),
            moneySaved: Math.round(m.moneySaved),
            orders: m.orders
        }));

        res.json({
            stats: {
                totalOrders,
                totalFoodSaved: +totalFoodSaved.toFixed(2),
                totalMoneySaved: +totalMoneySaved.toFixed(2),
                impactScore: Math.round(totalFoodSaved * 20),
                leaderboardRank: Math.max(1, Math.floor(totalOrders / 3)),
            },
            recentOrders,
            nearbyListings,
            badges,
            chartData,
        });
    } catch (err) {
        console.error("getDashboard error:", err);
        res.status(500).json({ error: "Failed to load dashboard" });
    }
}

// GET /api/consumer/impact --- dynamic stats, leaderboard, badges, charts, categories
export async function getImpact(req, res) {
    try {
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { consumerId: userId },
            include: {
                items: {
                    include: {
                        listing: {
                            select: {
                                id: true, name: true, category: true,
                                originalPrice: true, discountedPrice: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // 1. Stats
        const totalOrders = orders.length;
        const totalFoodSaved = orders.reduce((s, o) => s + (o.foodSaved || 0), 0);
        const totalMoneySaved = orders.reduce((s, o) => {
            const itemVal = o.items.reduce(
                (a, i) => a + (i.listing
                    ? (i.listing.originalPrice - i.listing.discountedPrice) * i.quantity
                    : 0),
                0
            );
            return s + itemVal;
        }, 0);

        const co2Reduced = parseFloat((totalFoodSaved * 0.4).toFixed(2));
        const mealsProvided = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);

        // 2. Leaderboard Rank & Community Leaderboard
        const consumers = await prisma.user.findMany({
            where: { role: "consumer" },
            select: {
                id: true,
                name: true,
                city: true,
                avatar: true,
                privacyShowLeaderboard: true,
                orders: {
                    select: { foodSaved: true }
                }
            }
        });

        const rankedList = consumers.map(c => {
            const foodSaved = c.orders.reduce((sum, o) => sum + (o.foodSaved || 0), 0);
            return {
                id: c.id,
                name: c.name,
                city: c.city || "Unknown",
                avatar: c.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.name}`,
                foodSaved: parseFloat(foodSaved.toFixed(2)),
                privacyShowLeaderboard: c.privacyShowLeaderboard
            };
        });

        rankedList.sort((a, b) => b.foodSaved - a.foodSaved);

        let currentRank = 1;
        for (let i = 0; i < rankedList.length; i++) {
            if (i > 0 && rankedList[i].foodSaved < rankedList[i - 1].foodSaved) {
                currentRank = i + 1;
            }
            rankedList[i].rank = currentRank;
        }

        const userRankEntry = rankedList.find(c => c.id === userId);
        const leaderboardRank = userRankEntry ? userRankEntry.rank : 1;

        const leaderboard = rankedList
            .filter(c => c.privacyShowLeaderboard && c.foodSaved > 0)
            .slice(0, 5)
            .map(c => ({
                rank: c.rank,
                name: c.name,
                city: c.city,
                foodSaved: c.foodSaved,
                avatar: c.avatar
            }));

        // 3. Dynamic Badges
        const userOrdersAsc = [...orders].reverse(); // oldest first
        const getEarnedDateForOrders = (num) => {
            if (userOrdersAsc.length >= num) {
                return new Date(userOrdersAsc[num - 1].createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
            }
            return null;
        };
        const getEarnedDateForFood = (kg) => {
            let sum = 0;
            for (const o of userOrdersAsc) {
                sum += o.foodSaved || 0;
                if (sum >= kg) {
                    return new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    });
                }
            }
            return null;
        };

        const badges = [
            {
                id: "b1",
                name: "First Order",
                icon: "🌱",
                description: "Rescue your very first surplus meal.",
                progress: totalOrders,
                target: 1,
                earned: totalOrders >= 1,
                earnedDate: getEarnedDateForOrders(1),
            },
            {
                id: "b7",
                name: "Foodie",
                icon: "🍽️",
                description: "Rescue 5 surplus meals from going to waste.",
                progress: totalOrders,
                target: 5,
                earned: totalOrders >= 5,
                earnedDate: getEarnedDateForOrders(5),
            },
            {
                id: "b2",
                name: "Food Saver",
                icon: "⭐",
                description: "Become a regular saver by rescuing 10 meals.",
                progress: totalOrders,
                target: 10,
                earned: totalOrders >= 10,
                earnedDate: getEarnedDateForOrders(10),
            },
            {
                id: "b6",
                name: "Zero Waste Hero",
                icon: "♻️",
                description: "Rescue 20 surplus meals.",
                progress: totalOrders,
                target: 20,
                earned: totalOrders >= 20,
                earnedDate: getEarnedDateForOrders(20),
            },
            {
                id: "b3",
                name: "Eco Warrior",
                icon: "🌿",
                description: "Save 10kg of food from being wasted.",
                progress: parseFloat(totalFoodSaved.toFixed(1)),
                target: 10,
                earned: totalFoodSaved >= 10,
                earnedDate: getEarnedDateForFood(10),
            },
            {
                id: "b5",
                name: "Champion",
                icon: "🏆",
                description: "Save 25kg of food from being wasted.",
                progress: parseFloat(totalFoodSaved.toFixed(1)),
                target: 25,
                earned: totalFoodSaved >= 25,
                earnedDate: getEarnedDateForFood(25),
            },
            {
                id: "b8",
                name: "Legend",
                icon: "👑",
                description: "Save 50kg of food from being wasted.",
                progress: parseFloat(totalFoodSaved.toFixed(1)),
                target: 50,
                earned: totalFoodSaved >= 50,
                earnedDate: getEarnedDateForFood(50),
            },
        ];

        // 4. Dynamic Chart Data
        // Weekly (last 7 days)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = dayNames[d.getDay()];
            weeklyData.push({
                date: d,
                dayName,
                foodSaved: 0,
                moneySaved: 0,
                orders: 0
            });
        }

        orders.forEach(o => {
            const orderDate = new Date(o.createdAt);
            const match = weeklyData.find(w => w.date.toDateString() === orderDate.toDateString());
            if (match) {
                match.foodSaved += o.foodSaved || 0;
                match.orders += 1;
                const itemVal = o.items.reduce((a, i) => a + (i.listing ? (i.listing.originalPrice - i.listing.discountedPrice) * i.quantity : 0), 0);
                match.moneySaved += itemVal;
            }
        });

        const weekly = weeklyData.map(w => ({
            period: w.dayName,
            foodSaved: parseFloat(w.foodSaved.toFixed(1)),
            moneySaved: Math.round(w.moneySaved),
            orders: w.orders
        }));

        // Monthly (last 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = monthNames[d.getMonth()];
            monthlyData.push({
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                monthName,
                foodSaved: 0,
                moneySaved: 0,
                orders: 0
            });
        }

        orders.forEach(o => {
            const orderDate = new Date(o.createdAt);
            const match = monthlyData.find(m => m.year === orderDate.getFullYear() && m.monthIndex === orderDate.getMonth());
            if (match) {
                match.foodSaved += o.foodSaved || 0;
                match.orders += 1;
                const itemVal = o.items.reduce((a, i) => a + (i.listing ? (i.listing.originalPrice - i.listing.discountedPrice) * i.quantity : 0), 0);
                match.moneySaved += itemVal;
            }
        });

        const chartData = {
            weekly,
            monthly: monthlyData.map(m => ({
                period: m.monthName,
                foodSaved: parseFloat(m.foodSaved.toFixed(1)),
                moneySaved: Math.round(m.moneySaved),
                orders: m.orders
            }))
        };

        // 5. Category Data (Saved Food distribution by listing category)
        const categoryMap = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                const category = item.listing?.category || "Other";
                if (!categoryMap[category]) {
                    categoryMap[category] = 0;
                }
                categoryMap[category] += 0.4 * item.quantity;
            });
        });

        const categoryData = Object.entries(categoryMap).map(([name, val]) => ({
            name,
            value: parseFloat(val.toFixed(1))
        }));

        res.json({
            stats: {
                foodSaved: parseFloat(totalFoodSaved.toFixed(1)),
                moneySaved: Math.round(totalMoneySaved),
                co2Reduced,
                mealsProvided,
                leaderboardRank,
            },
            leaderboard,
            badges,
            chartData,
            categoryData
        });
    } catch (err) {
        console.error("getImpact error:", err);
        res.status(500).json({ error: "Failed to load impact metrics" });
    }
}
