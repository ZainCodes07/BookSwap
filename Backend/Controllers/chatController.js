const Message = require("../Models/Message");
const User = require("../Models/User");
const Book = require("../Models/Book");
const { sendChatMessageNotification, shouldSendEmailNotification } = require("../utils/emailService");

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

        // Asynchronously trigger email notification to the recipient (non-blocking)
        setImmediate(async () => {
            try {
                // Determine if this is the first message in this book inquiry/conversation
                let previousCount = 0;
                try {
                    previousCount = await Message.getPreviousMessageCount(SenderID, ReceiverID, BookID);
                } catch (cErr) {
                    previousCount = 0;
                }
                const isFirstMessage = previousCount <= 1; // 1 because current message was just saved

                // Anti-Spam Frequency Throttling:
                // First message always alerts. Follow-ups within 15 minutes are throttled to prevent spam.
                if (!shouldSendEmailNotification(SenderID, ReceiverID, BookID, isFirstMessage)) {
                    return; // Throttled!
                }

                const receiver = await User.getUserById(ReceiverID);
                const sender = await User.getUserById(SenderID);
                let bookTitle = "Book Listing";

                if (BookID) {
                    try {
                        const book = await Book.getBookById(BookID);
                        if (book && book.Title) bookTitle = book.Title;
                    } catch (e) {}
                }

                if (receiver && receiver.Email) {
                    await sendChatMessageNotification({
                        receiverEmail: receiver.Email,
                        receiverName: receiver.FullName || "Student",
                        senderName: sender ? sender.FullName : "A student",
                        bookTitle: bookTitle,
                        bookId: BookID,
                        senderId: SenderID,
                        messageText: MessageText,
                        isFirstMessage: isFirstMessage
                    });
                }
            } catch (notifyErr) {
                console.warn("[Chat Notification Email Error]", notifyErr.message);
            }
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

// Get all messages for a specific user
const getMessagesForUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const messages = await Message.getMessagesForUser(userId);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Get messages for user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get user messages"
        });
    }
};

module.exports = {
    getAllMessages,
    getMessageById,
    getMessagesBetweenUsers,
    getMessagesForUser,
    createMessage,
    markAsRead,
    deleteMessage
};