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

// Connect Database
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`BookSwap server running on port ${PORT}`);
});