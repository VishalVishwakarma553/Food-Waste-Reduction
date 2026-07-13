import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { checkExpiryMiddleware } from "../middleware/checkExpiry.js";
import {
    getProfile,
    updateSettings,
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing,
    getStats,
    exportListingsCSV,
    getRestaurantDashboard,
    getRestaurantAnalytics
} from "../controllers/restaurantController.js";
import {
    getRestaurantOrders,
    updateOrderStatus
} from "../controllers/orderController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const router = Router();

// All routes require authentication and restaurant role
router.use(requireAuth, requireRole("restaurant"));

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Endpoints for restaurant partners to manage profile settings, create and update food listings, export listings, and fulfill customer orders.
 */

/**
 * @swagger
 * /restaurant/me:
 *   get:
 *     summary: Get current restaurant profile information
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/me", getProfile);

/**
 * @swagger
 * /restaurant/dashboard:
 *   get:
 *     summary: Retrieve restaurant dashboard statistics
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get("/dashboard", checkExpiryMiddleware, getRestaurantDashboard);

/**
 * @swagger
 * /restaurant/analytics:
 *   get:
 *     summary: Retrieve restaurant sales and food saving analytics
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant analytics retrieved successfully
 */
router.get("/analytics", getRestaurantAnalytics);

/**
 * @swagger
 * /restaurant/settings:
 *   patch:
 *     summary: Update restaurant profile settings (supports logo image upload)
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               businessImage:
 *                 type: string
 *                 format: binary
 *                 description: Business logo/banner image (JPEG, PNG, WEBP up to 5MB)
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               businessName:
 *                 type: string
 *               cuisineType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile settings updated successfully
 */
router.patch("/settings", upload.single("businessImage"), updateSettings);

/**
 * @swagger
 * /restaurant/stats:
 *   get:
 *     summary: Get restaurant summary stats (e.g. active listings count, pending orders)
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /restaurant/listings:
 *   get:
 *     summary: Get all listings created by this restaurant
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodListing'
 */
router.get("/listings", checkExpiryMiddleware, getListings);

/**
 * @swagger
 * /restaurant/listings/export:
 *   get:
 *     summary: Export restaurant listings to CSV format
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download containing listings data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/listings/export", checkExpiryMiddleware, exportListingsCSV); // must be before :id

/**
 * @swagger
 * /restaurant/listings:
 *   post:
 *     summary: Create a new surplus food listing (supports up to 5 images)
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - originalPrice
 *               - discountedPrice
 *               - quantity
 *               - expiryDate
 *               - expiryTime
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Food listing images (up to 5 files)
 *               name:
 *                 type: string
 *                 example: Surplus Veg Thali
 *               category:
 *                 type: string
 *                 example: Meals
 *               subCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *                 example: 120
 *               discountedPrice:
 *                 type: number
 *                 example: 40
 *               quantity:
 *                 type: number
 *                 example: 5
 *               unit:
 *                 type: string
 *                 default: kg
 *               minOrder:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *                 example: "2026-07-08"
 *               expiryTime:
 *                 type: string
 *                 example: "23:00"
 *               pickup:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 default: "true"
 *               delivery:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 default: "false"
 *               deliveryRadius:
 *                 type: number
 *               packaging:
 *                 type: string
 *               instructions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft]
 *                 default: active
 *               ingredients:
 *                 type: string
 *               allergens:
 *                 type: string
 *                 description: JSON string array of allergens (e.g. '["nuts", "dairy"]')
 *               dietary:
 *                 type: string
 *                 description: JSON string array of dietary flags (e.g. '["veg", "vegan"]')
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodListing'
 */
router.post("/listings", upload.array("images", 5), createListing);

/**
 * @swagger
 * /restaurant/listings/{id}:
 *   patch:
 *     summary: Update an existing food listing by ID (supports image files)
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               discountedPrice:
 *                 type: number
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               minOrder:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *               expiryTime:
 *                 type: string
 *               pickup:
 *                 type: string
 *                 enum: ["true", "false"]
 *               delivery:
 *                 type: string
 *                 enum: ["true", "false"]
 *               deliveryRadius:
 *                 type: number
 *               packaging:
 *                 type: string
 *               instructions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, expired]
 *               ingredients:
 *                 type: string
 *               allergens:
 *                 type: string
 *               dietary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Listing updated successfully
 */
router.get("/listings/:id", getListingById);
router.patch("/listings/:id", upload.array("images", 5), updateListing);

/**
 * @swagger
 * /restaurant/listings/{id}:
 *   delete:
 *     summary: Delete a food listing
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 */
router.delete("/listings/:id", deleteListing);

/**
 * @swagger
 * /restaurant/orders:
 *   get:
 *     summary: Get all orders placed at this restaurant
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list retrieved successfully
 */
router.get("/orders", getRestaurantOrders);

/**
 * @swagger
 * /restaurant/orders/{id}/status:
 *   patch:
 *     summary: Update status of an order (e.g. confirm, complete, cancel)
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, ready, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
