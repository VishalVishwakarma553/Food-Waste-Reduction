import prisma from "../lib/prisma.js";

export async function checkExpiryMiddleware(req, res, next) {
    try {
        const now = new Date();

        // Fetch all active listings' expiration details
        const activeListings = await prisma.foodListing.findMany({
            where: { status: "active" },
            select: { id: true, expiryDate: true, expiryTime: true, availableUntil: true }
        });

        const expiredIds = [];

        for (const listing of activeListings) {
            let isExpired = false;

            // 1. Check availableUntil DateTime
            if (listing.availableUntil && new Date(listing.availableUntil) <= now) {
                isExpired = true;
            }

            // 2. Check expiryDate & expiryTime combined
            if (listing.expiryDate && listing.expiryTime) {
                let timeStr = listing.expiryTime;
                if (timeStr.length === 5) {
                    timeStr = `${timeStr}:00`;
                }
                // Handle cases where expiryDate might have timezone or T in it already
                let dateStr = listing.expiryDate;
                if (dateStr.includes("T")) {
                    dateStr = dateStr.split("T")[0];
                }
                const expiryDateTime = new Date(`${dateStr}T${timeStr}`);
                if (!isNaN(expiryDateTime.getTime()) && expiryDateTime <= now) {
                    isExpired = true;
                }
            }

            if (isExpired) {
                expiredIds.push(listing.id);
            }
        }

        // Batch update expired listings to status = 'expired'
        if (expiredIds.length > 0) {
            await prisma.foodListing.updateMany({
                where: {
                    id: { in: expiredIds }
                },
                data: {
                    status: "expired"
                }
            });
        }

        next();
    } catch (error) {
        console.error("Error in checkExpiryMiddleware:", error);
        next(); // Call next to make sure request doesn't hang in case of DB error
    }
}
