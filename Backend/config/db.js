const sql = require("mssql/msnodesqlv8");

const config = {
    server: "DESKTOP-1NHQSUD\\SQLEXPRESS01",
    database: "BookSwap",
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log("SQL Server connected successfully!");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

module.exports = {
    sql,
    connectDB
};