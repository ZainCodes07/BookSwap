require("dotenv").config();

let sql;
let config;

if (process.env.DB_SERVER) {
    // Cloud database (SmarterASP / Cloud MSSQL)
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

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await sql.connect(config);
        isConnected = true;
        console.log("SQL Server connected successfully!");
    } catch (error) {
        if (error.code === 'EALREADYCONNECTED' || (error.message && error.message.includes('already connected'))) {
            isConnected = true;
            return;
        }
        console.error("Database connection failed:", error);
    }
}

module.exports = {
    sql,
    connectDB
};