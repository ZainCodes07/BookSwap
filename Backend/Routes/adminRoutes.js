const express = require("express");

const {
    getAllUsers,
    deleteUser,
    getAllListings,
    deleteListing,
    getAllOrders,
    getAllTransactions
} = require("../Controllers/adminController");

const router = express.Router();

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/listings", getAllListings);
router.delete("/listings/:id", deleteListing);

router.get("/orders", getAllOrders);
router.get("/transactions", getAllTransactions);

module.exports = router;