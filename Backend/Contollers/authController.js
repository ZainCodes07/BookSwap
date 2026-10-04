const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// Register User
const registerUser = async (req, res) => {
    try {
        const {
            FullName,
            Email,
            Password,
            Role,
            Phone,
            Address
        } = req.body;

        // Basic validation
        if (!FullName || !Email || !Password) {
            return res.status(400).json({
                message: "FullName, Email and Password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.getUserByEmail(Email);

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Hash password
        const PasswordHash = await bcrypt.hash(Password, 10);

        // Create user
        const user = await User.createUser({
            FullName,
            Email,
            PasswordHash,
            Role: Role || "Buyer",
            Phone,
            Address
        });

        // Don't send password hash to frontend
        const { PasswordHash: _, ...userWithoutPassword } = user;

        res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Basic validation
        if (!Email || !Password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

        // Find user by email
        const user = await User.getUserByEmail(Email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
            Password,
            user.PasswordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                UserID: user.UserID,
                Role: user.Role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Don't send password hash to frontend
        const { PasswordHash: _, ...userWithoutPassword } = user;

        res.status(200).json({
            message: "Login successful",
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};