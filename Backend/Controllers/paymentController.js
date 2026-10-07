const Order = require("../Models/Order");
const Transaction = require("../Models/Transaction");

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get all orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get orders"
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.getOrderById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get order"
        });
    }
};

// Get orders by buyer
const getOrdersByBuyer = async (req, res) => {
    try {
        const { buyerId } = req.params;

        const orders = await Order.getOrdersByBuyer(buyerId);

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get buyer orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get buyer orders"
        });
    }
};

// Create order
const createOrder = async (req, res) => {
    try {
        const {
            BookID,
            BuyerID,
            OrderType
        } = req.body;

        if (!BookID || !BuyerID || !OrderType) {
            return res.status(400).json({
                success: false,
                message: "BookID, BuyerID and OrderType are required"
            });
        }

        const order = await Order.createOrder({
            BookID,
            BuyerID,
            OrderType
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order"
        });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { OrderStatus } = req.body;

        if (!OrderStatus) {
            return res.status(400).json({
                success: false,
                message: "OrderStatus is required"
            });
        }

        const order = await Order.updateOrderStatus(
            id,
            OrderStatus
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        });
    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update order status"
        });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Order.deleteOrder(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error("Delete order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete order"
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
        console.error("Get all transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get transactions"
        });
    }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.getTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error("Get transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get transaction"
        });
    }
};

// Get transaction by order ID
const getTransactionByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        const transaction = await Transaction.getTransactionByOrderId(
            orderId
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error("Get transaction by order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get transaction"
        });
    }
};

// Create transaction
const createTransaction = async (req, res) => {
    try {
        const {
            OrderID,
            TransactionType,
            Amount,
            TransactionStatus
        } = req.body;

        if (!OrderID || !TransactionType) {
            return res.status(400).json({
                success: false,
                message: "OrderID and TransactionType are required"
            });
        }

        const transaction = await Transaction.createTransaction({
            OrderID,
            TransactionType,
            Amount,
            TransactionStatus: TransactionStatus || "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Create transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create transaction"
        });
    }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { TransactionStatus } = req.body;

        if (!TransactionStatus) {
            return res.status(400).json({
                success: false,
                message: "TransactionStatus is required"
            });
        }

        const transaction = await Transaction.updateTransactionStatus(
            id,
            TransactionStatus
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction status updated successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Update transaction status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update transaction status"
        });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Transaction.deleteTransaction(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully"
        });
    } catch (error) {
        console.error("Delete transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete transaction"
        });
    }
};

module.exports = {
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
};