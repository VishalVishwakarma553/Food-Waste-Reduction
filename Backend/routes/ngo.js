import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { checkExpiryMiddleware } from "../middleware/checkExpiry.js";
import { 
    getAvailableDonations, 
    claimDonations, 
    getNgoPickups, 
    completeNgoPickup, 
    cancelNgoPickup,
    getBeneficiaries,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getCompletedNgoOrders,
    addDistribution,
    getDistributions,
    getNgoProfile,
    updateNgoProfile,
    uploadNgoDocument,
    updateNgoNotifications,
    changeNgoPassword,
    getNgoImpactAnalytics,
    getNgoDashboard
} from "../controllers/ngoController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
    filename: (req, file, cb) => cb(null, `ngo-${Date.now()}${path.extname(file.originalname)}`),
});

const logoUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ok = ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.mimetype);
        cb(ok ? null : new Error("Images only"), ok);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
});

const docUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ok = ["application/pdf"].includes(file.mimetype);
        cb(ok ? null : new Error("PDFs only"), ok);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();
router.use(requireAuth, requireRole("ngo"));

router.get("/dashboard", getNgoDashboard);
router.get("/donations", checkExpiryMiddleware, getAvailableDonations);
router.post("/donations/claim", claimDonations);
router.get("/pickups", getNgoPickups);
router.patch("/pickups/:id/complete", completeNgoPickup);
router.patch("/pickups/:id/cancel", cancelNgoPickup);

// Beneficiaries CRUD
router.get("/beneficiaries", getBeneficiaries);
router.post("/beneficiaries", addBeneficiary);
router.patch("/beneficiaries/:id", updateBeneficiary);
router.delete("/beneficiaries/:id", deleteBeneficiary);

// Distributions & Analytics
router.get("/completed-orders", getCompletedNgoOrders);
router.post("/distributions", addDistribution);
router.get("/distributions", getDistributions);
router.get("/impact", getNgoImpactAnalytics);

// Profile & Documents
router.get("/profile", getNgoProfile);
router.patch("/profile", logoUpload.single("logo"), updateNgoProfile);
router.post("/documents/upload", docUpload.single("file"), uploadNgoDocument);
router.patch("/profile/notifications", updateNgoNotifications);
router.post("/profile/change-password", changeNgoPassword);

export default router;
