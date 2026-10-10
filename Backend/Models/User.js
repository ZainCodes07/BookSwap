const { sql, connectDB } = require("../config/db");

const User = {

    // Get all users
    getAllUsers: async () => {
        await connectDB();

        const result = await sql.query(`
            SELECT *
            FROM Users
        `);

        return result.recordset;
    },


    // Get user by ID
    getUserById: async (userId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);

        const result = await request.query(`
            SELECT *
            FROM Users
            WHERE UserID = @UserID
        `);

        return result.recordset[0];
    },


    // Get user by Email
    getUserByEmail: async (email) => {
        await connectDB();

        const request = new sql.Request();

        request.input("Email", sql.NVarChar(150), email);

        const result = await request.query(`
            SELECT *
            FROM Users
            WHERE Email = @Email
        `);

        return result.recordset[0];
    },


    // Create new user
    createUser: async (user) => {
        await connectDB();

        const request = new sql.Request();

        request.input("FullName", sql.NVarChar(100), user.FullName);
        request.input("Email", sql.NVarChar(150), user.Email);
        request.input("PasswordHash", sql.NVarChar(255), user.PasswordHash);
        request.input("Role", sql.NVarChar(20), user.Role || "Buyer");
        request.input("Phone", sql.NVarChar(20), user.Phone || null);
        request.input("Address", sql.NVarChar(255), user.Address || null);

        const result = await request.query(`
            INSERT INTO Users
            (
                FullName,
                Email,
                PasswordHash,
                Role,
                Phone,
                Address
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @FullName,
                @Email,
                @PasswordHash,
                @Role,
                @Phone,
                @Address
            )
        `);

        return result.recordset[0];
    },


    // Update user
    updateUser: async (userId, user) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);
        request.input("FullName", sql.NVarChar(100), user.FullName);
        request.input("Phone", sql.NVarChar(20), user.Phone || null);
        request.input("Address", sql.NVarChar(255), user.Address || null);

        const result = await request.query(`
            UPDATE Users
            SET
                FullName = @FullName,
                Phone = @Phone,
                Address = @Address
            OUTPUT INSERTED.*
            WHERE UserID = @UserID
        `);

        return result.recordset[0];
    },


    // Delete user
    deleteUser: async (userId) => {
        await connectDB();

        const request = new sql.Request();

        request.input("UserID", sql.Int, userId);

        const result = await request.query(`
            DELETE FROM Users
            WHERE UserID = @UserID
        `);

        return result.rowsAffected[0];
    }

};

module.exports = User;