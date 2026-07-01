import { Router } from "express";
import { checkExpiryMiddleware } from "../middleware/checkExpiry.js";
import { getPublicListings, getPublicListing, getCategories } from "../controllers/publicController.js";
import { geocodeAddress, reverseGeocode } from "../controllers/geocodeController.js";

const router = Router();

// No auth required — public browse
router.get("/listings", checkExpiryMiddleware, getPublicListings);
router.get("/listings/:id", checkExpiryMiddleware, getPublicListing);
router.get("/categories", getCategories);

// Nominatim proxy — no auth required (rate limited by Nominatim on server IP)
router.get("/geocode", geocodeAddress);
router.get("/reverse-geocode", reverseGeocode);

export default router;
