const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

// Routes
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");
const listingRoutes = require("./Routes/listingRoutes");
const searchRoutes = require("./Routes/searchRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const cartRoutes = require("./Routes/cartRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const adminRoutes = require("./Routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "BookSwap Backend is running!"
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// App Version endpoint for Mobile In-App Updater
app.get("/api/app-version", (req, res) => {
    res.json({
        latestVersion: "1.2.2",
        versionCode: 5,
        minVersion: "1.0.0",
        downloadUrl: "https://github.com/ZainCodes07/BookSwap/releases/latest/download/BookSwap.apk",
        releaseNotes: "• Studio clean book cover presentation (removed purple glare)\n• Daraz-style Verified Student Seller card on book details\n• Seller Shop with verified student reviews & trust scores\n• Direct navigation from book details to seller's shelf",
        mandatory: false,
        releasedAt: "2026-10-25"
    });
});

// Connect Database
connectDB();

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`BookSwap server running on port ${PORT}`);
    });
}

module.exports = app;