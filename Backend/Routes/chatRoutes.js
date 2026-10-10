const express = require("express");

const {
    getAllMessages,
    getMessageById,
    getMessagesBetweenUsers,
    createMessage,
    markAsRead,
    deleteMessage
} = require("../Controllers/chatController");

const router = express.Router();

router.get("/", getAllMessages);
router.get("/conversation/:senderId/:receiverId", getMessagesBetweenUsers);
router.get("/:id", getMessageById);

router.post("/", createMessage);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteMessage);

module.exports = router;