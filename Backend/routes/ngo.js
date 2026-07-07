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

/**
 * @swagger
 * tags:
 *   name: NGO
 *   description: Endpoints for NGOs to claim donations, manage pickups, track beneficiaries and distributions, and upload registration documents.
 */

/**
 * @swagger
 * /ngo/dashboard:
 *   get:
 *     summary: Retrieve NGO dashboard metrics
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: NGO dashboard data retrieved successfully
 */
router.get("/dashboard", getNgoDashboard);

/**
 * @swagger
 * /ngo/donations:
 *   get:
 *     summary: Get available active food donations near the NGO service area
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: dietary
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: string
 *           default: "15"
 *         description: Maximum search radius in km
 *     responses:
 *       200:
 *         description: Available donations lists retrieved successfully
 */
router.get("/donations", checkExpiryMiddleware, getAvailableDonations);

/**
 * @swagger
 * /ngo/donations/claim:
 *   post:
 *     summary: Claim one or more available active food listings
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingIds
 *             properties:
 *               listingIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               notes:
 *                 type: string
 *                 example: "Claimed for Brooklyn food kitchen distribution"
 *               pickupSlot:
 *                 type: string
 *                 example: "04:00 PM - 06:00 PM"
 *     responses:
 *       201:
 *         description: Donations claimed successfully
 *       400:
 *         description: Invalid selection or some items already claimed
 */
router.post("/donations/claim", claimDonations);

/**
 * @swagger
 * /ngo/pickups:
 *   get:
 *     summary: Retrieve scheduled pickups for the NGO
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled pickups retrieved successfully
 */
router.get("/pickups", getNgoPickups);

/**
 * @swagger
 * /ngo/pickups/{id}/complete:
 *   patch:
 *     summary: Mark a pickup as completed
 *     tags: [NGO]
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
 *         description: Pickup marked as completed
 */
router.patch("/pickups/:id/complete", completeNgoPickup);

/**
 * @swagger
 * /ngo/pickups/{id}/cancel:
 *   patch:
 *     summary: Cancel a scheduled pickup
 *     tags: [NGO]
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
 *         description: Pickup cancelled successfully
 */
router.patch("/pickups/:id/cancel", cancelNgoPickup);

/**
 * @swagger
 * /ngo/beneficiaries:
 *   get:
 *     summary: Get all NGO beneficiaries
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Beneficiaries list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Beneficiary'
 */
router.get("/beneficiaries", getBeneficiaries);

/**
 * @swagger
 * /ngo/beneficiaries:
 *   post:
 *     summary: Add a new beneficiary
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - location
 *               - size
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hope Shelter
 *               type:
 *                 type: string
 *                 example: Shelter
 *               location:
 *                 type: string
 *                 example: Brooklyn
 *               size:
 *                 type: integer
 *                 example: 50
 *               contactPhone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Beneficiary added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Beneficiary'
 */
router.post("/beneficiaries", addBeneficiary);

/**
 * @swagger
 * /ngo/beneficiaries/{id}:
 *   patch:
 *     summary: Update an existing beneficiary's details
 *     tags: [NGO]
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
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               location:
 *                 type: string
 *               size:
 *                 type: integer
 *               contactPhone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Beneficiary updated successfully
 */
router.patch("/beneficiaries/:id", updateBeneficiary);

/**
 * @swagger
 * /ngo/beneficiaries/{id}:
 *   delete:
 *     summary: Delete a beneficiary
 *     tags: [NGO]
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
 *         description: Beneficiary deleted successfully
 */
router.delete("/beneficiaries/:id", deleteBeneficiary);

/**
 * @swagger
 * /ngo/completed-orders:
 *   get:
 *     summary: Get completed claim orders for the current NGO
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed orders retrieved successfully
 */
router.get("/completed-orders", getCompletedNgoOrders);

/**
 * @swagger
 * /ngo/distributions:
 *   post:
 *     summary: Record a new food distribution event
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - beneficiaryId
 *               - foodItems
 *               - quantity
 *             properties:
 *               beneficiaryId:
 *                 type: integer
 *               orderId:
 *                 type: integer
 *               foodItems:
 *                 type: string
 *                 example: Pizza and Salad
 *               quantity:
 *                 type: number
 *                 example: 10
 *               unit:
 *                 type: string
 *                 example: kg
 *     responses:
 *       201:
 *         description: Distribution added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Distribution'
 */
router.post("/distributions", addDistribution);

/**
 * @swagger
 * /ngo/distributions:
 *   get:
 *     summary: Retrieve list of distribution events
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Distributions list retrieved successfully
 */
router.get("/distributions", getDistributions);

/**
 * @swagger
 * /ngo/impact:
 *   get:
 *     summary: Get NGO impact analytics data
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Impact analytics data retrieved successfully
 */
router.get("/impact", getNgoImpactAnalytics);

/**
 * @swagger
 * /ngo/profile:
 *   get:
 *     summary: Get NGO profile details
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/profile", getNgoProfile);

/**
 * @swagger
 * /ngo/profile:
 *   patch:
 *     summary: Update NGO profile details (supports logo upload)
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
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
 *               contactPerson:
 *                 type: string
 *               website:
 *                 type: string
 *               serviceRadius:
 *                 type: number
 *     responses:
 *       200:
 *         description: NGO Profile updated successfully
 */
router.patch("/profile", logoUpload.single("logo"), updateNgoProfile);

/**
 * @swagger
 * /ngo/documents/upload:
 *   post:
 *     summary: Upload NGO registration document (PDF up to 5MB)
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - docType
 *               - file
 *             properties:
 *               docType:
 *                 type: string
 *                 enum: [documentReg, documentDeed, document12A, document80G]
 *                 description: Type of the registration document
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF document file
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post("/documents/upload", docUpload.single("file"), uploadNgoDocument);

/**
 * @swagger
 * /ngo/profile/notifications:
 *   patch:
 *     summary: Update NGO notification preferences
 *     tags: [NGO]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifNgoDonations:
 *                 type: boolean
 *               notifNgoStatus:
 *                 type: boolean
 *               notifNgoSms:
 *                 type: boolean
 *               notifNgoDigest:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 */
router.patch("/profile/notifications", updateNgoNotifications);

/**
 * @swagger
 * /ngo/profile/change-password:
 *   post:
 *     summary: Change NGO password
 *     tags: [NGO]
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
 *         description: Password changed successfully
 */
router.post("/profile/change-password", changeNgoPassword);

export default router;
