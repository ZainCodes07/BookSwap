const { sql, connectDB } = require("../config/db");

const Category = {

    // Get all categories
    getAllCategories: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Categories
        `);

        return result.recordset;
    },


    // Get category by ID
    getCategoryById: async (categoryId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CategoryID", sql.Int, categoryId);

        const result = await request.query(`
            SELECT *
            FROM Categories
            WHERE CategoryID = @CategoryID
        `);

        return result.recordset[0];
    },


    // Create new category
    createCategory: async (category) => {
        await connectDB();

        const request = new sql.Request();

        request.input(
            "CategoryName",
            sql.NVarChar(100),
            category.CategoryName
        );

        request.input(
            "Description",
            sql.NVarChar(255),
            category.Description || null
        );

        const result = await request.query(`
            INSERT INTO Categories
            (
                CategoryName,
                Description
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @CategoryName,
                @Description
            )
        `);

        return result.recordset[0];
    },


    // Update category
    updateCategory: async (categoryId, category) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CategoryID", sql.Int, categoryId);

        request.input(
            "CategoryName",
            sql.NVarChar(100),
            category.CategoryName
        );

        request.input(
            "Description",
            sql.NVarChar(255),
            category.Description || null
        );

        const result = await request.query(`
            UPDATE Categories
            SET
                CategoryName = @CategoryName,
                Description = @Description
            OUTPUT INSERTED.*
            WHERE CategoryID = @CategoryID
        `);

        return result.recordset[0];
    },


    // Delete category
    deleteCategory: async (categoryId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("CategoryID", sql.Int, categoryId);

        const result = await request.query(`
            DELETE FROM Categories
            WHERE CategoryID = @CategoryID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = Category;