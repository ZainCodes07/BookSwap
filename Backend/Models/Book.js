const { sql, connectDB } = require("../config/db");

const Book = {

    // Get all books
    getAllBooks: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Books
        `);

        return result.recordset;
    },


    // Get book by ID
    getBookById: async (bookId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, bookId);

        const result = await request.query(`
            SELECT *
            FROM Books
            WHERE BookID = @BookID
        `);

        return result.recordset[0];
    },


    // Get books by seller
    getBooksBySeller: async (sellerId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("SellerID", sql.Int, sellerId);

        const result = await request.query(`
            SELECT *
            FROM Books
            WHERE SellerID = @SellerID
        `);

        return result.recordset;
    },


    // Create new book
    createBook: async (book) => {
        await connectDB();

        const request = new sql.Request();

        request.input("SellerID", sql.Int, book.SellerID);
        request.input("CategoryID", sql.Int, book.CategoryID);
        request.input("CourseID", sql.Int, book.CourseID || null);
        request.input("Title", sql.NVarChar(200), book.Title);
        request.input("Author", sql.NVarChar(150), book.Author);
        request.input("Description", sql.NVarChar(500), book.Description || null);
        request.input("Price", sql.Decimal(10, 2), book.Price || null);
        request.input("BookCondition", sql.NVarChar(50), book.BookCondition);
        request.input("ListingType", sql.NVarChar(20), book.ListingType);

        const result = await request.query(`
            INSERT INTO Books
            (
                SellerID,
                CategoryID,
                CourseID,
                Title,
                Author,
                Description,
                Price,
                BookCondition,
                ListingType
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @SellerID,
                @CategoryID,
                @CourseID,
                @Title,
                @Author,
                @Description,
                @Price,
                @BookCondition,
                @ListingType
            )
        `);

        return result.recordset[0];
    },


    // Update book
    updateBook: async (bookId, book) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, bookId);
        request.input("CategoryID", sql.Int, book.CategoryID);
        request.input("CourseID", sql.Int, book.CourseID || null);
        request.input("Title", sql.NVarChar(200), book.Title);
        request.input("Author", sql.NVarChar(150), book.Author);
        request.input("Description", sql.NVarChar(500), book.Description || null);
        request.input("Price", sql.Decimal(10, 2), book.Price || null);
        request.input("BookCondition", sql.NVarChar(50), book.BookCondition);
        request.input("ListingType", sql.NVarChar(20), book.ListingType);
        request.input("Status", sql.NVarChar(20), book.Status);

        const result = await request.query(`
            UPDATE Books
            SET
                CategoryID = @CategoryID,
                CourseID = @CourseID,
                Title = @Title,
                Author = @Author,
                Description = @Description,
                Price = @Price,
                BookCondition = @BookCondition,
                ListingType = @ListingType,
                Status = @Status
            OUTPUT INSERTED.*
            WHERE BookID = @BookID
        `);

        return result.recordset[0];
    },


    // Delete book
    deleteBook: async (bookId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, bookId);

        const result = await request.query(`
            DELETE FROM Books
            WHERE BookID = @BookID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Book;