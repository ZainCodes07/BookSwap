const { sql, connectDB } = require("../config/db");

const Transaction = {

    // Get all transactions
    getAllTransactions: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Transactions
        `);

        return result.recordset;
    },


    // Get transaction by ID
    getTransactionById: async (transactionId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("TransactionID", sql.Int, transactionId);

        const result = await request.query(`
            SELECT *
            FROM Transactions
            WHERE TransactionID = @TransactionID
        `);

        return result.recordset[0];
    },


    // Get transaction by Order ID
    getTransactionByOrderId: async (orderId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("OrderID", sql.Int, orderId);

        const result = await request.query(`
            SELECT *
            FROM Transactions
            WHERE OrderID = @OrderID
        `);

        return result.recordset[0];
    },


    // Create new transaction
    createTransaction: async (transaction) => {
        await connectDB();

        const request = new sql.Request();

        request.input("OrderID", sql.Int, transaction.OrderID);
        request.input(
            "TransactionType",
            sql.NVarChar(20),
            transaction.TransactionType
        );
        request.input(
            "Amount",
            sql.Decimal(10, 2),
            transaction.Amount || null
        );
        request.input(
            "TransactionStatus",
            sql.NVarChar(30),
            transaction.TransactionStatus || "Pending"
        );

        const result = await request.query(`
            INSERT INTO Transactions
            (
                OrderID,
                TransactionType,
                Amount,
                TransactionStatus
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @OrderID,
                @TransactionType,
                @Amount,
                @TransactionStatus
            )
        `);

        return result.recordset[0];
    },


    // Update transaction status
    updateTransactionStatus: async (transactionId, transactionStatus) => {
        await connectDB();

        const request = new sql.Request();

        request.input("TransactionID", sql.Int, transactionId);
        request.input(
            "TransactionStatus",
            sql.NVarChar(30),
            transactionStatus
        );

        const result = await request.query(`
            UPDATE Transactions
            SET TransactionStatus = @TransactionStatus
            OUTPUT INSERTED.*
            WHERE TransactionID = @TransactionID
        `);

        return result.recordset[0];
    },


    // Delete transaction
    deleteTransaction: async (transactionId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("TransactionID", sql.Int, transactionId);

        const result = await request.query(`
            DELETE FROM Transactions
            WHERE TransactionID = @TransactionID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Transaction;