const mysql = require('mysql2/promise');
const pool = mysql.createPool({
	connectionLimit: 20,
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'nodeblog'
});

module.exports = {
	data: require("./data")(pool)
}