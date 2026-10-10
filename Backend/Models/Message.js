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
    }

};

module.exports = Message;