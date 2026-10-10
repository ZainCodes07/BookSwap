const express = require("express");

const {
    searchBooks
} = require("../Controllers/searchController");

const router = express.Router();

router.get("/", searchBooks);

module.exports = router;