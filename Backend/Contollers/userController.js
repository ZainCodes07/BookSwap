const User = require("../models/User");


// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();

        res.status(200).json({
            users
        });
    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
};


// Get user by ID
const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Don't send password hash
        const { PasswordHash: _, ...userWithoutPassword } = user;

        res.status(200).json({
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Failed to get user",
            error: error.message
        });
    }
};


// Update user
const updateUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const {
            FullName,
            Phone,
            Address
        } = req.body;

        if (!FullName) {
            return res.status(400).json({
                message: "FullName is required"
            });
        }

        const existingUser = await User.getUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const updatedUser = await User.updateUser(userId, {
            FullName,
            Phone,
            Address
        });

        // Don't send password hash
        const { PasswordHash: _, ...userWithoutPassword } = updatedUser;

        res.status(200).json({
            message: "User updated successfully",
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            message: "Failed to update user",
            error: error.message
        });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const existingUser = await User.getUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.deleteUser(userId);

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};