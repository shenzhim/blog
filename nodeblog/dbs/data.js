const co = require('co');

module.exports = function(pool) {
	return new function() {
		this.list = function(id, list, bindid, tag, sort) {
			return co(function*() {
				let db = yield pool.getConnection();
				let sql = "SELECT * FROM data WHERE id " + (Array.isArray(id) ? "in" : "=") + " ?";
				let params = [id];

				if (list != null) {
					sql += " And `list`=? ";
					params.push(list);
				}
				if (bindid != null) {
					sql += " And bindid = ?";
					params.push(bindid);
				}
				if (tag != null) {
					sql += " And tag " + (Array.isArray(tag) ? "in" : "=") + " ?";
					params.push(tag);
				}
				if (sort != null) {
					sql += " And sort = ?";
					params.push(sort);
				}

				const [result, fields] = yield db.execute(sql, params);
				db.release();
				return result;
			});
		}
	}
}