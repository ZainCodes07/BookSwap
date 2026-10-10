const Cart = require("../Models/Cart");

// Get all cart items
const getAllCartItems = async (req, res) => {
    try {
        const cartItems = await Cart.getAllCartItems();

        res.status(200).json({
            success: true,
            cartItems
        });
    } catch (error) {
        console.error("Get all cart items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get cart items"
        });
    }
};

// Get cart items for a specific user
const getCartByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await Cart.getCartByUser(userId);

        res.status(200).json({
            success: true,
            cartItems
        });
    } catch (error) {
        console.error("Get user cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get user cart"
        });
    }
};

// Get cart item by ID
const getCartItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.getCartItemById(id);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            success: true,
            cartItem
        });
    } catch (error) {
        console.error("Get cart item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get cart item"
        });
    }
};

// Add book to cart
const addToCart = async (req, res) => {
    try {
        const { UserID, BookID } = req.body;

        if (!UserID || !BookID) {
            return res.status(400).json({
                success: false,
                message: "UserID and BookID are required"
            });
        }

        const cartItem = await Cart.addToCart({
            UserID,
            BookID
        });

        res.status(201).json({
            success: true,
            message: "Book added to cart successfully",
            data: cartItem
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add book to cart"
        });
    }
};

// Remove cart item by CartID
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Cart.removeFromCart(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully"
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart"
        });
    }
};

// Remove specific book from user's cart
const removeBookFromCart = async (req, res) => {
    try {
        const { userId, bookId } = req.params;

        const deleted = await Cart.removeBookFromCart(
            userId,
            bookId
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Book not found in cart"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book removed from cart successfully"
        });
    } catch (error) {
        console.error("Remove book from cart error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove book from cart"
        });
    }
};

module.exports = {
    getAllCartItems,
    getCartByUser,
    getCartItemById,
    addToCart,
    removeFromCart,
    removeBookFromCart
};