import { Router } from "express";
import { getPublicListings, getPublicListing, getCategories } from "../controllers/publicController.js";
import { geocodeAddress, reverseGeocode } from "../controllers/geocodeController.js";

const router = Router();

// No auth required — public browse
router.get("/listings", getPublicListings);
router.get("/listings/:id", getPublicListing);
router.get("/categories", getCategories);

// Nominatim proxy — no auth required (rate limited by Nominatim on server IP)
router.get("/geocode", geocodeAddress);
router.get("/reverse-geocode", reverseGeocode);

export default router;
