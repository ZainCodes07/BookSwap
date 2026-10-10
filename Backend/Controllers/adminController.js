const User = require("../Models/User");
const Book = require("../Models/Book");
const Order = require("../Models/Order");
const Transaction = require("../Models/Transaction");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();

        const safeUsers = users.map(({ PasswordHash, ...user }) => user);

        res.status(200).json({
            success: true,
            users: safeUsers
        });
    } catch (error) {
        console.error("Admin get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get users"
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.deleteUser(id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Admin delete user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};

// Get all listings
const getAllListings = async (req, res) => {
    try {
        const listings = await Book.getAllBooks();

        res.status(200).json({
            success: true,
            listings
        });
    } catch (error) {
        console.error("Admin get listings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get listings"
        });
    }
};

// Delete listing
const deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Book.getBookById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        await Book.deleteBook(id);

        res.status(200).json({
            success: true,
            message: "Listing deleted successfully"
        });
    } catch (error) {
        console.error("Admin delete listing error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete listing"
        });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Admin get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getAllTransactions();

        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error("Admin get transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get transactions"
        });
    }
};

module.exports = {
    getAllUsers,
    deleteUser,
    getAllListings,
    deleteListing,
    getAllOrders,
    getAllTransactions
};