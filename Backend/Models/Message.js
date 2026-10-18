const { sql, connectDB } = require("../config/db");

const Message = {

    // Get all messages
    getAllMessages: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Messages
        `);

        return result.recordset;
    },


    // Get message by ID
    getMessageById: async (messageId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("MessageID", sql.Int, messageId);

        const result = await request.query(`
            SELECT *
            FROM Messages
            WHERE MessageID = @MessageID
        `);

        return result.recordset[0];
    },


    // Get messages between two users
    getMessagesBetweenUsers: async (senderId, receiverId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("SenderID", sql.Int, senderId);
        request.input("ReceiverID", sql.Int, receiverId);

        const result = await request.query(`
            SELECT *
            FROM Messages
            WHERE
                (SenderID = @SenderID AND ReceiverID = @ReceiverID)
                OR
                (SenderID = @ReceiverID AND ReceiverID = @SenderID)
            ORDER BY SentAt ASC
        `);

        return result.recordset;
    },

    // Count previous messages between two users (for conversation/inquiry detection)
    getPreviousMessageCount: async (senderId, receiverId, bookId) => {
        await connectDB();

        const request = new sql.Request();
        request.input("SenderID", sql.Int, senderId);
        request.input("ReceiverID", sql.Int, receiverId);

        let query = `
            SELECT COUNT(*) AS total
            FROM Messages
            WHERE (
                (SenderID = @SenderID AND ReceiverID = @ReceiverID)
                OR
                (SenderID = @ReceiverID AND ReceiverID = @SenderID)
            )
        `;

        if (bookId) {
            request.input("BookID", sql.Int, bookId);
            query += ` AND BookID = @BookID`;
        }

        const result = await request.query(query);
        return (result.recordset[0] && result.recordset[0].total) || 0;
    },

    // Create new message
    createMessage: async (message) => {
        await connectDB();

        const request = new sql.Request();

        request.input("SenderID", sql.Int, message.SenderID);
        request.input("ReceiverID", sql.Int, message.ReceiverID);
        request.input("BookID", sql.Int, message.BookID || null);
        request.input("MessageText", sql.NVarChar(1000), message.MessageText);

        const result = await request.query(`
            INSERT INTO Messages
            (
                SenderID,
                ReceiverID,
                BookID,
                MessageText
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @SenderID,
                @ReceiverID,
                @BookID,
                @MessageText
            )
        `);

        return result.recordset[0];
    },


    // Mark message as read
    markAsRead: async (messageId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("MessageID", sql.Int, messageId);

        const result = await request.query(`
            UPDATE Messages
            SET IsRead = 1
            OUTPUT INSERTED.*
            WHERE MessageID = @MessageID
        `);

        return result.recordset[0];
    },


    // Delete message
    deleteMessage: async (messageId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("MessageID", sql.Int, messageId);

        const result = await request.query(`
            DELETE FROM Messages
            WHERE MessageID = @MessageID
        `);

        return result.rowsAffected[0];
    },

    // Get all messages for a user with names and book info (no personal contact info)
    getMessagesForUser: async (userId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);

        const result = await request.query(`
            SELECT 
                m.MessageID,
                m.SenderID,
                m.ReceiverID,
                m.BookID,
                m.MessageText,
                m.SentAt,
                m.IsRead,
                sender.FullName AS SenderName,
                receiver.FullName AS ReceiverName,
                b.Title AS BookTitle,
                b.ImageUrl AS BookImage,
                b.Price AS BookPrice,
                b.SellerID AS BookSellerID
            FROM Messages m
            LEFT JOIN Users sender ON m.SenderID = sender.UserID
            LEFT JOIN Users receiver ON m.ReceiverID = receiver.UserID
            LEFT JOIN Books b ON m.BookID = b.BookID
            WHERE m.SenderID = @UserID OR m.ReceiverID = @UserID
            ORDER BY m.SentAt DESC
        `);

        return result.recordset;
    }

};

module.exports = Message;