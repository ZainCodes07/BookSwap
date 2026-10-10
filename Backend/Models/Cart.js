const { sql, connectDB } = require("../config/db");

const Cart = {

    // Get all cart items
    getAllCartItems: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Cart
        `);

        return result.recordset;
    },


    // Get cart items by user
    getCartByUser: async (userId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);

        const result = await request.query(`
            SELECT *
            FROM Cart
            WHERE UserID = @UserID
            ORDER BY AddedAt DESC
        `);

        return result.recordset;
    },


    // Get cart item by ID
    getCartItemById: async (cartId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CartID", sql.Int, cartId);

        const result = await request.query(`
            SELECT *
            FROM Cart
            WHERE CartID = @CartID
        `);

        return result.recordset[0];
    },


    // Add book to cart
    addToCart: async (cart) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, cart.UserID);
        request.input("BookID", sql.Int, cart.BookID);

        const result = await request.query(`
            INSERT INTO Cart
            (
                UserID,
                BookID
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @UserID,
                @BookID
            )
        `);

        return result.recordset[0];
    },


    // Remove item from cart
    removeFromCart: async (cartId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CartID", sql.Int, cartId);

        const result = await request.query(`
            DELETE FROM Cart
            WHERE CartID = @CartID
        `);

        return result.rowsAffected[0];
    },


    // Remove a specific book from user's cart
    removeBookFromCart: async (userId, bookId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);
        request.input("BookID", sql.Int, bookId);

        const result = await request.query(`
            DELETE FROM Cart
            WHERE UserID = @UserID
            AND BookID = @BookID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Cart;