const { sql, connectDB } = require("../config/db");

const Book = {

    // Get all books
    getAllBooks: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT b.*, u.FullName AS SellerName, u.Email AS SellerEmail
            FROM Books b
            LEFT JOIN Users u ON b.SellerID = u.UserID
        `);

        return result.recordset;
    },

    // Get book by ID
    getBookById: async (bookId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, bookId);

        const result = await request.query(`
            SELECT b.*, u.FullName AS SellerName, u.Email AS SellerEmail
            FROM Books b
            LEFT JOIN Users u ON b.SellerID = u.UserID
            WHERE b.BookID = @BookID
        `);

        return result.recordset[0];
    },

    // Get books by seller
    getBooksBySeller: async (sellerId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("SellerID", sql.Int, sellerId);

        const result = await request.query(`
            SELECT b.*, u.FullName AS SellerName, u.Email AS SellerEmail
            FROM Books b
            LEFT JOIN Users u ON b.SellerID = u.UserID
            WHERE b.SellerID = @SellerID AND (b.Status != 'Removed' OR b.Status IS NULL)
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
        request.input("Status", sql.NVarChar(20), book.Status || 'Pending');
        request.input("ImageUrl", sql.NVarChar(sql.MAX), book.ImageUrl || null);
        request.input("CourseName", sql.NVarChar(100), book.CourseName || null);

        try {
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
                    ListingType,
                    Status,
                    ImageUrl,
                    CourseName
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
                    @ListingType,
                    @Status,
                    @ImageUrl,
                    @CourseName
                )
            `);
            return result.recordset[0];
        } catch (colErr) {
            const fallbackResult = await request.query(`
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
                    ListingType,
                    Status
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
                    @ListingType,
                    @Status
                )
            `);
            return fallbackResult.recordset[0];
        }
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
        request.input("Status", sql.NVarChar(20), book.Status || null);
        request.input("ImageUrl", sql.NVarChar(sql.MAX), book.ImageUrl || null);
        request.input("CourseName", sql.NVarChar(100), book.CourseName || null);

        try {
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
                    Status = COALESCE(@Status, Status),
                    ImageUrl = COALESCE(@ImageUrl, ImageUrl),
                    CourseName = COALESCE(@CourseName, CourseName)
                OUTPUT INSERTED.*
                WHERE BookID = @BookID
            `);
            return result.recordset[0];
        } catch (colErr) {
            const fallbackResult = await request.query(`
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
                    Status = COALESCE(@Status, Status)
                OUTPUT INSERTED.*
                WHERE BookID = @BookID
            `);
            return fallbackResult.recordset[0];
        }
    },

    // Delete book
    deleteBook: async (bookId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("BookID", sql.Int, bookId);

        try {
            await request.query(`
                DELETE FROM Cart WHERE BookID = @BookID;
                DELETE FROM Messages WHERE BookID = @BookID;
                DELETE FROM Transactions WHERE OrderID IN (SELECT OrderID FROM Orders WHERE BookID = @BookID);
                DELETE FROM Orders WHERE BookID = @BookID;
                DELETE FROM Books WHERE BookID = @BookID;
            `);
            return 1;
        } catch (fkErr) {
            const res = await request.query(`
                UPDATE Books SET Status = 'Removed' WHERE BookID = @BookID;
            `);
            return res.rowsAffected[0];
        }
    },

    // Search books
    searchBooks: async (searchTerm) => {
        await connectDB();

        const request = new sql.Request();

        request.input(
            "SearchTerm",
            sql.NVarChar(200),
            `%${searchTerm}%`
        );

        const result = await request.query(`
            SELECT
                b.BookID,
                b.SellerID,
                u.FullName AS SellerName,
                u.Email AS SellerEmail,
                b.CategoryID,
                b.CourseID,
                b.Title,
                b.Author,
                b.Description,
                b.Price,
                b.BookCondition,
                b.ListingType,
                b.Status,
                b.CreatedAt,
                c.CategoryName,
                co.CourseName,
                co.CourseCode
            FROM Books b
            LEFT JOIN Users u
                ON b.SellerID = u.UserID
            INNER JOIN Categories c
                ON b.CategoryID = c.CategoryID
            LEFT JOIN Courses co
                ON b.CourseID = co.CourseID
            WHERE
                b.Title LIKE @SearchTerm
                OR b.Author LIKE @SearchTerm
                OR b.Description LIKE @SearchTerm
                OR c.CategoryName LIKE @SearchTerm
                OR co.CourseName LIKE @SearchTerm
                OR co.CourseCode LIKE @SearchTerm
            ORDER BY b.CreatedAt DESC
        `);

        return result.recordset;
    }
};

module.exports = Book;