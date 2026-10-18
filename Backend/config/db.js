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
    try {
        sql = require("mssql/msnodesqlv8");
    } catch (e) {
        sql = require("mssql");
    }
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

        // Auto-migrate schema for ImageUrl and CourseName if missing
        try {
            await sql.query(`
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'ImageUrl')
                    ALTER TABLE Books ADD ImageUrl NVARCHAR(MAX) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Books') AND name = 'CourseName')
                    ALTER TABLE Books ADD CourseName NVARCHAR(100) NULL;
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'PayoutAccount')
                    ALTER TABLE Users ADD PayoutAccount NVARCHAR(MAX) NULL;
            `);
        } catch (migErr) {
            console.warn("Schema migration notice:", migErr.message);
        }
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