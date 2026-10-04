const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({
        message: "BookSwap Backend is running!"
    });
});

connectDB();

app.listen(PORT, () => {
    console.log(`BookSwap server running on port ${PORT}`);
});