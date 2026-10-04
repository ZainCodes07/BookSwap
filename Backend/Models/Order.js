const { sql, connectDB } = require("../config/db");

const Order = {

    // Get all orders
    getAllOrders: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Orders
        `);

        return result.recordset;
    },


    // Get order by ID
    getOrderById: async (orderId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("OrderID", sql.Int, orderId);

        const result = await request.query(`
            SELECT *
            FROM Orders
            WHERE OrderID = @OrderID
        `);

        return result.recordset[0];
    },


    // Get orders by buyer
    getOrdersByBuyer: async (buyerId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BuyerID", sql.Int, buyerId);

        const result = await request.query(`
            SELECT *
            FROM Orders
            WHERE BuyerID = @BuyerID
            ORDER BY OrderDate DESC
        `);

        return result.recordset;
    },


    // Create new order
    createOrder: async (order) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, order.BookID);
        request.input("BuyerID", sql.Int, order.BuyerID);
        request.input("OrderType", sql.NVarChar(20), order.OrderType);

        const result = await request.query(`
            INSERT INTO Orders
            (
                BookID,
                BuyerID,
                OrderType
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @BookID,
                @BuyerID,
                @OrderType
            )
        `);

        return result.recordset[0];
    },


    // Update order status
    updateOrderStatus: async (orderId, orderStatus) => {
        await connectDB();

        const request = new sql.Request();

        request.input("OrderID", sql.Int, orderId);
        request.input("OrderStatus", sql.NVarChar(30), orderStatus);

        const result = await request.query(`
            UPDATE Orders
            SET OrderStatus = @OrderStatus
            OUTPUT INSERTED.*
            WHERE OrderID = @OrderID
        `);

        return result.recordset[0];
    },


    // Delete order
    deleteOrder: async (orderId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("OrderID", sql.Int, orderId);

        const result = await request.query(`
            DELETE FROM Orders
            WHERE OrderID = @OrderID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Order;