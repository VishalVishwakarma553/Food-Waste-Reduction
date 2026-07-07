import { Router } from "express";
import { checkExpiryMiddleware } from "../middleware/checkExpiry.js";
import { getPublicListings, getPublicListing, getCategories } from "../controllers/publicController.js";
import { geocodeAddress, reverseGeocode } from "../controllers/geocodeController.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Publicly accessible endpoints for browsing food listings, geocoding, and fetching categories.
 */

/**
 * @swagger
 * /public/listings:
 *   get:
 *     summary: Browse food listings with advanced filtering and proximity search
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by listing name, description, tags, or restaurant business name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter listings by category (e.g. "Meals", "Bakery", "Groceries")
 *       - in: query
 *         name: dietary
 *         schema:
 *           type: string
 *         description: Comma-separated list of dietary requirements (e.g. "veg", "vegan", "gluten-free", "dairy-free")
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [expiry, price-asc, price-desc, discount, distance]
 *           default: expiry
 *         description: Sorting criteria
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter listings by maximum discounted price
 *       - in: query
 *         name: pickup
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter listings that support pickup
 *       - in: query
 *         name: delivery
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter listings that support delivery
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude coordinates for proximity-based search (requires lng and activates PostGIS spatial queries)
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude coordinates for proximity-based search (requires lat and activates PostGIS spatial queries)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 20
 *         description: Search radius in kilometers (only relevant if lat and lng are provided)
 *     responses:
 *       200:
 *         description: List of listings matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Normalized food listing structure suited for frontend cards.
 *                 totalPages:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 */
router.get("/listings", checkExpiryMiddleware, getPublicListings);

/**
 * @swagger
 * /public/listings/{id}:
 *   get:
 *     summary: Retrieve a single public listing by ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the food listing
 *     responses:
 *       200:
 *         description: Detailed information about the food listing
 *       404:
 *         description: Listing not found
 */
router.get("/listings/:id", checkExpiryMiddleware, getPublicListing);

/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: Retrieve all available food categories and subcategories
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: A structured list of categories with their nested subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   subcategories:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get("/categories", getCategories);

/**
 * @swagger
 * /public/geocode:
 *   get:
 *     summary: Geocode a text address to GPS coordinates using Nominatim API proxy
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Free text address query (e.g. "1600 Amphitheatre Pkwy, Mountain View, CA")
 *     responses:
 *       200:
 *         description: Geocoded coordinates and full address properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 37.422
 *                 lon:
 *                   type: number
 *                   example: -122.084
 *                 display_name:
 *                   type: string
 *                 address:
 *                   type: object
 *       400:
 *         description: Query string parameter is missing
 *       500:
 *         description: Nominatim request failed
 */
router.get("/geocode", geocodeAddress);

/**
 * @swagger
 * /public/reverse-geocode:
 *   get:
 *     summary: Reverse geocode GPS coordinates to a human-readable address
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Address properties mapping to coordinates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing lat or lng parameters
 *       500:
 *         description: Reverse geocode failed
 */
router.get("/reverse-geocode", reverseGeocode);

export default router;

