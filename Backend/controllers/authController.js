import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_prod";
const sign = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
export async function register(req, res) {
    const { name, email, phone, password, role,
            address, city, state, pincode,
            businessName, cuisineType, ngoRegNumber, contactPerson } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "Missing required fields" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, phone, password: hashed, role,
                address, city, state, pincode,
                businessName, cuisineType, ngoRegNumber, contactPerson },
    });

    const { password: _, ...safe } = user;
    res.status(201).json({ token: sign(user), user: safe });
}

// POST /api/auth/login
export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...safe } = user;
    res.json({ token: sign(user), user: safe });
}

// POST /api/auth/forgot-password ->  generates & returns OTP (store in DB)
export async function forgotPassword(req, res) {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "No account with that email" });

    // ponytail: skipping email service, returning OTP in response for dev
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await prisma.user.update({ where: { email }, data: { resetOtp: otp, otpExpiry } });

    res.json({ message: "OTP generated", otp }); // TODO: send via email in production
}

// POST /api/auth/verify-otp
export async function verifyOtp(req, res) {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetOtp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    res.json({ message: "OTP verified" });
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetOtp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed, resetOtp: null, otpExpiry: null } });
    res.json({ message: "Password reset successfully" });
}
