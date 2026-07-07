import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { checkExpiryMiddleware } from "../middleware/checkExpiry.js";
import { placeOrder, getOrders, getOrder, cancelOrder, completeOrder } from "../controllers/orderController.js";
import { getProfile, updateProfile, updateNotifications, updatePrivacy, changePassword } from "../controllers/consumerController.js";
import { getFavorites, toggleFavorite } from "../controllers/favoriteController.js";
import { getDashboard, getImpact } from "../controllers/dashboardController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Avatar upload – disk storage, images only, 2MB max
const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
        filename: (req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`),
    }),
    fileFilter: (req, file, cb) => {
        const ok = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype);
        cb(ok ? null : new Error("Images only"), ok);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
});

const router = Router();
router.use(requireAuth, requireRole("consumer"));

/**
 * @swagger
 * tags:
 *   name: Consumer
 *   description: Endpoints for consumers to manage profiles, place/view orders, toggle favorites, and view impact dashboard.
 */

/**
 * @swagger
 * /consumer/profile:
 *   get:
 *     summary: Retrieve consumer profile details
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Consumer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Requires consumer role)
 */
router.get("/profile", getProfile);

/**
 * @swagger
 * /consumer/profile:
 *   patch:
 *     summary: Update consumer profile info including avatar image upload
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPEG, PNG, WEBP up to 2MB)
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
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
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch("/profile", avatarUpload.single("avatar"), updateProfile);

/**
 * @swagger
 * /consumer/profile/notifications:
 *   patch:
 *     summary: Update consumer notification preferences
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifEmailOrders:
 *                 type: boolean
 *               notifEmailListings:
 *                 type: boolean
 *               notifEmailDigest:
 *                 type: boolean
 *               notifSmsOrders:
 *                 type: boolean
 *               notifSmsListings:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch("/profile/notifications", updateNotifications);

/**
 * @swagger
 * /consumer/profile/privacy:
 *   patch:
 *     summary: Update consumer privacy preferences
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacyShowLeaderboard:
 *                 type: boolean
 *               privacyPublicProfile:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.patch("/profile/privacy", updatePrivacy);

/**
 * @swagger
 * /consumer/profile/change-password:
 *   post:
 *     summary: Change consumer password
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Incorrect password or validation error
 */
router.post("/profile/change-password", changePassword);

/**
 * @swagger
 * /consumer/orders:
 *   post:
 *     summary: Place a new food order
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Please leave at front desk
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - listingId
 *                     - quantity
 *                   properties:
 *                     listingId:
 *                       type: integer
 *                       example: 12
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     pickupSlot:
 *                       type: string
 *                       example: "12:00 PM - 02:00 PM"
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid parameters, listing expired or insufficient quantity
 */
router.post("/orders", placeOrder);

/**
 * @swagger
 * /consumer/orders:
 *   get:
 *     summary: Get all orders placed by the current consumer
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/orders", getOrders);

/**
 * @swagger
 * /consumer/orders/{id}:
 *   get:
 *     summary: Get detailed info about a specific order by ID
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get("/orders/:id", getOrder);

/**
 * @swagger
 * /consumer/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel a pending order
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be cancelled in its current state
 */
router.patch("/orders/:id/cancel", cancelOrder);

/**
 * @swagger
 * /consumer/orders/{id}/complete:
 *   patch:
 *     summary: Complete an order
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.patch("/orders/:id/complete", completeOrder);

/**
 * @swagger
 * /consumer/favorites:
 *   get:
 *     summary: Retrieve current consumer's favorite listings
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodListing'
 */
router.get("/favorites", checkExpiryMiddleware, getFavorites);

/**
 * @swagger
 * /consumer/favorites/{listingId}:
 *   post:
 *     summary: Toggle a listing as favorite/unfavorite
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food Listing ID
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite:
 *                   type: boolean
 *                   description: True if listing is now favorited, false if unfavorited
 *                   example: true
 */
router.post("/favorites/:listingId", toggleFavorite);

/**
 * @swagger
 * /consumer/dashboard:
 *   get:
 *     summary: Retrieve consumer dashboard metrics and leaderboard data
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 foodSaved:
 *                   type: number
 *                 co2Saved:
 *                   type: number
 *                 moneySaved:
 *                   type: number
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: string
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/dashboard", checkExpiryMiddleware, getDashboard);

/**
 * @swagger
 * /consumer/impact:
 *   get:
 *     summary: Retrieve consumer impact analytics details
 *     tags: [Consumer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Impact analytics retrieved successfully
 */
router.get("/impact", getImpact);

export default router;

