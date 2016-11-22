var co = require('co');

module.exports = function(pool) {
	return new function() {
		this.list = function(id, list, bindid, tag, sort) {
			return co(function*() {
				var db = yield pool.getConnection();

				// var sql = "SELECT * FROM data WHERE id " + (util.isArray(id) ? "in" : "=") + " ? And `list`=? And bindid = ?";
				// if (tag != null) sql += " And tag " + (util.isArray(tag) ? "in" : "=") + " ?";
				// if (sort != null) {
				// 	sql += " And sort = ?";
				// 	if (tag == null) tag = sort;
				// }
				var sql = "SELECT * FROM DATA WHERE id = ?";
				id = 1;
				//var data = yield db.execute(sql, [id, list, bindid, tag, sort]);
				var data = yield db.execute(sql, [id]);
				console.log("data: ", data);
				db.release();
				return data;
			});
		}

		// this.count = function(id, list, tag, bindid) {
		// 	return pool(function(conn) {
		// 		var sql = "SELECT COUNT(*) FROM data WHERE id=? And `list`=? And tag=?";
		// 		if (bindid != null)
		// 			sql += " And bindid=?";
		// 		var rs = conn.execute(sql, id, list, tag, bindid);
		// 		return rs[0][0];
		// 	});
		// }

		// this.insert = function(id, list, tag, bindid, sort, value, created) {
		// 	return pool(function(conn) {
		// 		var sql = "REPLACE INTO data (id, `list`, tag, bindid, sort, created, changed, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
		// 		var r = conn.execute(sql, id, list, tag, bindid, sort, created, created, value);
		// 		return r.affected === 1 || r.affected === 2;
		// 	});
		// }
	}
}