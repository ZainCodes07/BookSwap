const express = require("express");

const {
    getAllOrders,
    getOrderById,
    getOrdersByBuyer,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getAllTransactions,
    getTransactionById,
    getTransactionByOrderId,
    createTransaction,
    updateTransactionStatus,
    deleteTransaction
} = require("../Controllers/paymentController");

const router = express.Router();

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/buyer/:buyerId", getOrdersByBuyer);
router.get("/orders/:id", getOrderById);

router.post("/orders", createOrder);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// Transactions
router.get("/transactions", getAllTransactions);
router.get("/transactions/order/:orderId", getTransactionByOrderId);
router.get("/transactions/:id", getTransactionById);

router.post("/transactions", createTransaction);
router.put("/transactions/:id/status", updateTransactionStatus);
router.delete("/transactions/:id", deleteTransaction);

module.exports = router;