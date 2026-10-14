require("dotenv").config();

let sql;
let config;

if (process.env.DB_SERVER) {
    // Cloud database (Render / Production / SmarterASP)
    sql = require("mssql");
    config = {
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    };
} else {
    // Local Windows SQLEXPRESS fallback
    sql = require("mssql/msnodesqlv8");
    config = {
        server: "DESKTOP-1NHQSUD\\SQLEXPRESS01",
        database: "BookSwap",
        options: {
            trustedConnection: true,
            trustServerCertificate: true
        }
    };
}

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