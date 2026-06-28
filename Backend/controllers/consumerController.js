import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fields we safely return to client (no password/OTP)
const SAFE_SELECT = {
    id: true, name: true, email: true, phone: true, role: true,
    avatar: true, bio: true, address: true, city: true, state: true, pincode: true,
    notifEmailOrders: true, notifEmailListings: true, notifEmailDigest: true,
    notifSmsOrders: true, notifSmsListings: true,
    privacyShowLeaderboard: true, privacyPublicProfile: true,
    createdAt: true,
};

// GET /api/consumer/profile
export async function getProfile(req, res) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: SAFE_SELECT,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
}

// PATCH /api/consumer/profile  – update name/phone/bio/address fields
export async function updateProfile(req, res) {
    const { name, phone, bio, address, city, state, pincode } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (bio !== undefined) data.bio = bio;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (pincode !== undefined) data.pincode = pincode;

    // If avatar image was uploaded
    if (req.file) {
        data.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: SAFE_SELECT,
    });
    res.json({ user, message: "Profile updated" });
}

// PATCH /api/consumer/profile/notifications  – toggle notification prefs
export async function updateNotifications(req, res) {
    const { notifEmailOrders, notifEmailListings, notifEmailDigest, notifSmsOrders, notifSmsListings } = req.body;
    const data = {};
    if (notifEmailOrders !== undefined) data.notifEmailOrders = !!notifEmailOrders;
    if (notifEmailListings !== undefined) data.notifEmailListings = !!notifEmailListings;
    if (notifEmailDigest !== undefined) data.notifEmailDigest = !!notifEmailDigest;
    if (notifSmsOrders !== undefined) data.notifSmsOrders = !!notifSmsOrders;
    if (notifSmsListings !== undefined) data.notifSmsListings = !!notifSmsListings;

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: SAFE_SELECT,
    });
    res.json({ user, message: "Notification preferences saved" });
}

// PATCH /api/consumer/profile/privacy  – toggle privacy prefs
export async function updatePrivacy(req, res) {
    const { privacyShowLeaderboard, privacyPublicProfile } = req.body;
    const data = {};
    if (privacyShowLeaderboard !== undefined) data.privacyShowLeaderboard = !!privacyShowLeaderboard;
    if (privacyPublicProfile !== undefined) data.privacyPublicProfile = !!privacyPublicProfile;

    const user = await prisma.user.update({
        where: { id: req.user.id },
        data,
        select: SAFE_SELECT,
    });
    res.json({ user, message: "Privacy settings saved" });
}

// POST /api/consumer/profile/change-password
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both passwords required" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password changed successfully" });
}
