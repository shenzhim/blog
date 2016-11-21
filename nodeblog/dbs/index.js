const mysql = require('mysql');
const pool = mysql.createPool({
	connectionLimit: 20,
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'blog_prod'
});

module.exports = function(table) {
	return function() {
		return require("./" + table)(pool);
	}
}