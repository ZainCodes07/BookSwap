const Message = require("../Models/Message");

// Get all messages
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.getAllMessages();

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Get all messages error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get messages"
        });
    }
};

// Get message by ID
const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.getMessageById(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            message
        });
    } catch (error) {
        console.error("Get message error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get message"
        });
    }
};

// Get messages between two users
const getMessagesBetweenUsers = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        const messages = await Message.getMessagesBetweenUsers(
            senderId,
            receiverId
        );

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Get conversation error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get conversation"
        });
    }
};

// Create a new message
const createMessage = async (req, res) => {
    try {
        const {
            SenderID,
            ReceiverID,
            BookID,
            MessageText
        } = req.body;

        if (!SenderID || !ReceiverID || !MessageText) {
            return res.status(400).json({
                success: false,
                message: "SenderID, ReceiverID and MessageText are required"
            });
        }

        const newMessage = await Message.createMessage({
            SenderID,
            ReceiverID,
            BookID: BookID || null,
            MessageText
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.error("Create message error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
};

// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedMessage = await Message.markAsRead(id);

        if (!updatedMessage) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Message marked as read",
            data: updatedMessage
        });
    } catch (error) {
        console.error("Mark message as read error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to mark message as read"
        });
    }
};

// Delete message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Message.deleteMessage(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Message deleted successfully"
        });
    } catch (error) {
        console.error("Delete message error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete message"
        });
    }
};

module.exports = {
    getAllMessages,
    getMessageById,
    getMessagesBetweenUsers,
    createMessage,
    markAsRead,
    deleteMessage
};