const Book = require("../Models/Book");


// Get all book listings
const getAllListings = async (req, res) => {
    try {
        const books = await Book.getAllBooks();

        res.status(200).json({
            books
        });
    } catch (error) {
        console.error("Get all listings error:", error);

        res.status(500).json({
            message: "Failed to get listings",
            error: error.message
        });
    }
};


// Get listing by ID
const getListingById = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);

        if (isNaN(bookId)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await Book.getBookById(bookId);

        if (!book) {
            return res.status(404).json({
                message: "Book listing not found"
            });
        }

        res.status(200).json({
            book
        });
    } catch (error) {
        console.error("Get listing error:", error);

        res.status(500).json({
            message: "Failed to get listing",
            error: error.message
        });
    }
};


// Get listings by seller
const getListingsBySeller = async (req, res) => {
    try {
        const sellerId = parseInt(req.params.sellerId);

        if (isNaN(sellerId)) {
            return res.status(400).json({
                message: "Invalid seller ID"
            });
        }

        const books = await Book.getBooksBySeller(sellerId);

        res.status(200).json({
            books
        });
    } catch (error) {
        console.error("Get seller listings error:", error);

        res.status(500).json({
            message: "Failed to get seller listings",
            error: error.message
        });
    }
};


// Create new listing
const createListing = async (req, res) => {
    try {
        const {
            SellerID,
            CategoryID,
            CourseID,
            Title,
            Author,
            Description,
            Price,
            BookCondition,
            ListingType
        } = req.body;

        if (
            !SellerID ||
            !CategoryID ||
            !Title ||
            !Author ||
            !BookCondition ||
            !ListingType
        ) {
            return res.status(400).json({
                message: "SellerID, CategoryID, Title, Author, BookCondition and ListingType are required"
            });
        }

        const book = await Book.createBook({
            SellerID,
            CategoryID,
            CourseID,
            Title,
            Author,
            Description,
            Price,
            BookCondition,
            ListingType
        });

        res.status(201).json({
            message: "Book listing created successfully",
            book
        });
    } catch (error) {
        console.error("Create listing error:", error);

        res.status(500).json({
            message: "Failed to create listing",
            error: error.message
        });
    }
};


// Update listing
const updateListing = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);

        if (isNaN(bookId)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const existingBook = await Book.getBookById(bookId);

        if (!existingBook) {
            return res.status(404).json({
                message: "Book listing not found"
            });
        }

        const {
            CategoryID,
            CourseID,
            Title,
            Author,
            Description,
            Price,
            BookCondition,
            ListingType,
            Status
        } = req.body;

        if (
            !CategoryID ||
            !Title ||
            !Author ||
            !BookCondition ||
            !ListingType ||
            !Status
        ) {
            return res.status(400).json({
                message: "CategoryID, Title, Author, BookCondition, ListingType and Status are required"
            });
        }

        const updatedBook = await Book.updateBook(
            bookId,
            {
                CategoryID,
                CourseID,
                Title,
                Author,
                Description,
                Price,
                BookCondition,
                ListingType,
                Status
            }
        );

        res.status(200).json({
            message: "Book listing updated successfully",
            book: updatedBook
        });
    } catch (error) {
        console.error("Update listing error:", error);

        res.status(500).json({
            message: "Failed to update listing",
            error: error.message
        });
    }
};


// Delete listing
const deleteListing = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);

        if (isNaN(bookId)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const existingBook = await Book.getBookById(bookId);

        if (!existingBook) {
            return res.status(404).json({
                message: "Book listing not found"
            });
        }

        await Book.deleteBook(bookId);

        res.status(200).json({
            message: "Book listing deleted successfully"
        });
    } catch (error) {
        console.error("Delete listing error:", error);

        res.status(500).json({
            message: "Failed to delete listing",
            error: error.message
        });
    }
};


module.exports = {
    getAllListings,
    getListingById,
    getListingsBySeller,
    createListing,
    updateListing,
    deleteListing
};