import prisma from "../lib/prisma.js";

// GET /api/restaurant/orders  – list all orders that contain this restaurant's listings
export async function getRestaurantOrders(req, res) {
    try {
        const restaurantId = req.user.id;

        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        listing: { restaurantId }
                    }
                }
            },
            include: {
                consumer: {
                    select: { id: true, name: true, phone: true, email: true }
                },
                items: {
                    where: {
                        listing: { restaurantId }
                    },
                    include: {
                        listing: {
                            select: { id: true, name: true, restaurantId: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({ orders });
    } catch (err) {
        console.error("getRestaurantOrders error:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

// PATCH /api/restaurant/orders/:id/status  – update an order status
export async function updateOrderStatus(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const restaurantId = req.user.id;
        const { status } = req.body;

        const allowedStatuses = ["confirmed", "ready", "completed", "cancelled", "approved"];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` });
        }

        // Ensure the order has at least one item belonging to this restaurant
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                items: { some: { listing: { restaurantId } } }
            }
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Guard against moving a cancelled/completed order backward
        if (["completed", "cancelled"].includes(order.status)) {
            return res.status(400).json({ error: `Cannot update a ${order.status} order` });
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                consumer: {
                    select: { id: true, name: true, phone: true, email: true }
                },
                items: {
                    include: {
                        listing: {
                            select: {
                                id: true, name: true, restaurantId: true, expiryDate: true,
                                expiryTime: true,
                                availableFrom: true,
                                availableUntil: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });
        if (status === "cancelled") {
            const now = new Date();

            for (const item of updated.items) {
                const listing = item.listing;

                if (!listing) continue;

                // Combine expiryDate + expiryTime into a single Date object
                const expiryDateTime = new Date(
                    `${listing.expiryDate}T${listing.expiryTime}`
                );

                const isExpiryValid = expiryDateTime > now;

                const isAvailable =
                    (!listing.availableFrom || listing.availableFrom <= now) &&
                    (!listing.availableUntil || listing.availableUntil >= now);

                if (isExpiryValid && isAvailable) {
                    await prisma.foodListing.update({
                        where: { id: listing.id },
                        data: {
                            status: "active"
                        }
                    });
                }
            }
        }

        res.json({ order: updated });
    } catch (err) {
        console.error("updateOrderStatus error:", err);
        res.status(500).json({ error: "Failed to update order status" });
    }
}

// POST /api/consumer/orders  – place an order from cart items
export async function placeOrder(req, res) {
    const { items, notes } = req.body;
    // items: [{ listingId, quantity, pickupSlot }]
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    // Fetch listings to snapshot name/image/restaurantName
    const ids = items.map(i => parseInt(i.listingId));
    const listings = await prisma.foodListing.findMany({
        where: { id: { in: ids }, status: "active" },
        include: { restaurant: { select: { businessName: true, name: true } } }
    });

    if (listings.length !== ids.length) {
        return res.status(400).json({ error: "Some items are no longer available" });
    }

    const foodSaved = items.reduce((sum, i) => sum + 0.4 * parseFloat(i.quantity), 0);

    const order = await prisma.order.create({
        data: {
            consumerId: req.user.id,
            notes: notes || null,
            foodSaved: parseFloat(foodSaved.toFixed(2)),
            co2Saved: parseFloat((foodSaved * 0.4).toFixed(2)),
            items: {
                create: items.map(i => {
                    const l = listings.find(l => l.id === parseInt(i.listingId));
                    const imgs = JSON.parse(l.images || "[]");
                    return {
                        listingId: l.id,
                        quantity: parseFloat(i.quantity),
                        pickupSlot: i.pickupSlot || null,
                        name: l.name,
                        image: imgs[0] || null,
                        restaurantName: l.restaurant.businessName || l.restaurant.name,
                    };
                })
            }
        },
        include: { items: true }
    });

    res.status(201).json({ order });
}

// GET /api/consumer/orders  – list all orders for this consumer
export async function getOrders(req, res) {
    const orders = await prisma.order.findMany({
        where: { consumerId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
}

// GET /api/consumer/orders/:id  – get a single order
export async function getOrder(req, res) {
    const order = await prisma.order.findFirst({
        where: { id: parseInt(req.params.id), consumerId: req.user.id },
        include: { items: true }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
}

// PATCH /api/consumer/orders/:id/cancel  – cancel a pending/confirmed order
export async function cancelOrder(req, res) {
    try {
        const order = await prisma.order.findFirst({
            where: { id: parseInt(req.params.id), consumerId: req.user.id },
            include: {
                items: {
                    include: {
                        listing: true
                    }
                }
            }
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        
        const allowedToCancel = ["pending", "confirmed", "approved", "ready"];
        if (!allowedToCancel.includes(order.status)) {
            return res.status(400).json({ error: "Cannot cancel this order" });
        }
        
        const updated = await prisma.order.update({
            where: { id: order.id },
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

        res.json({ order: updated });
    } catch (err) {
        console.error("cancelOrder error:", err);
        res.status(500).json({ error: "Failed to cancel order" });
    }
}

// PATCH /api/consumer/orders/:id/complete
export async function completeOrder(req, res) {
    try {
        const orderId = parseInt(req.params.id);
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id: orderId, consumerId: userId }
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status: "completed" }
        });

        res.json({ order: updated, message: "Order completed successfully" });
    } catch (err) {
        console.error("completeOrder error:", err);
        res.status(500).json({ error: "Failed to complete order" });
    }
}
