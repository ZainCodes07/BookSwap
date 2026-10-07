const express = require("express");

const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../Controllers/userController");

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;