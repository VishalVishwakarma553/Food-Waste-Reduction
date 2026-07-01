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

// Profile
router.get("/me", getProfile);

// Dashboard
router.get("/dashboard", checkExpiryMiddleware, getRestaurantDashboard);

// Analytics
router.get("/analytics", getRestaurantAnalytics);

// Settings (with optional single image upload for business logo)
router.patch("/settings", upload.single("businessImage"), updateSettings);

// Listings
router.get("/stats", getStats);
router.get("/listings", checkExpiryMiddleware, getListings);
router.get("/listings/export", checkExpiryMiddleware, exportListingsCSV); // must be before :id
router.post("/listings", upload.array("images", 5), createListing);
router.patch("/listings/:id", upload.array("images", 5), updateListing);
router.delete("/listings/:id", deleteListing);

// Orders
router.get("/orders", getRestaurantOrders);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
