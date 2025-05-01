const mysql = require('mysql2/promise');

exports.pool = mysql.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        timezone: '+03:00',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0
    }
);

exports.pool.query = async (queryString, params) => {
    const [results] = await this.pool.execute(queryString, params);
    return results;
};