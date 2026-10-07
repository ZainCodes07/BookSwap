const express = require("express");

const {
    getAllCartItems,
    getCartByUser,
    getCartItemById,
    addToCart,
    removeFromCart,
    removeBookFromCart
} = require("../Controllers/cartController");

const router = express.Router();

router.get("/", getAllCartItems);
router.get("/user/:userId", getCartByUser);
router.get("/:id", getCartItemById);

router.post("/", addToCart);

router.delete("/user/:userId/book/:bookId", removeBookFromCart);
router.delete("/:id", removeFromCart);

module.exports = router;