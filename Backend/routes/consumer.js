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

// Profile
router.get("/profile", getProfile);
router.patch("/profile", avatarUpload.single("avatar"), updateProfile);
router.patch("/profile/notifications", updateNotifications);
router.patch("/profile/privacy", updatePrivacy);
router.post("/profile/change-password", changePassword);

// Orders
router.post("/orders", placeOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/cancel", cancelOrder);
router.patch("/orders/:id/complete", completeOrder);

// Favorites
router.get("/favorites", checkExpiryMiddleware, getFavorites);
router.post("/favorites/:listingId", toggleFavorite);

// Dashboard
router.get("/dashboard", checkExpiryMiddleware, getDashboard);
router.get("/impact", getImpact);

export default router;
