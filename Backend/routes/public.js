import { Router } from "express";
import { getPublicListings, getPublicListing, getCategories } from "../controllers/publicController.js";

const router = Router();

// No auth required — public browse
router.get("/listings", getPublicListings);
router.get("/listings/:id", getPublicListing);
router.get("/categories", getCategories);

export default router;
