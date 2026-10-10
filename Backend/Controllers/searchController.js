const Book = require("../Models/Book");

// Search books
const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            });
        }

        const books = await Book.searchBooks(query.trim());

        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });

    } catch (error) {
        console.error("Search books error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to search books.",
            error: error.message
        });
    }
};

module.exports = {
    searchBooks
};