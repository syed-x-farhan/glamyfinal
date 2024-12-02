require('dotenv').config();
const mysql = require('mysql2/promise');

// Create a connection to the database
async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: false,
            dateStrings: true,
        });
        console.log('Connected to MySQL database.');
        return connection;
    } catch (err) {
        console.error('Database connection failed: ', err.stack);
        throw err;
    }
}

module.exports = initializeDatabase();