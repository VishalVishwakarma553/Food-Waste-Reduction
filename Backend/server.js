import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";
import authRoutes from "./routes/auth.js";
import restaurantRoutes from "./routes/restaurant.js";
import publicRoutes from "./routes/public.js";
import consumerRoutes from "./routes/consumer.js";
import ngoRoutes from "./routes/ngo.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/consumer", consumerRoutes);
app.use("/api/ngo", ngoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error handler:", err);
    if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: `File upload error: ${err.message || 'File too large'}` });
    }
    res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));