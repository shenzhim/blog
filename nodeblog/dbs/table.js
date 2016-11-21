"use strict";

module.exports = function(pool) {
	return new function() {
		this.list = function(id, appid, table, bindid, tag, sort) {
			if (id == null || appid == null || table == null || bindid == null) throw new TypeError("list:appid or id or table or bindid undefined");
			return pool(function(conn) {
				var sql = "SELECT * FROM data WHERE id " + (util.isArray(id) ? "in" : "=") + " ? And appid=? And `list`=? And bindid = ?";
				if (tag != null) sql += " And tag " + (util.isArray(tag) ? "in" : "=") + " ?";
				if (sort != null) {
					sql += " And sort = ?";
					if (tag == null) tag = sort;
				}
				return conn.execute(sql, id, appid, table, bindid, tag, sort);
			});
		}

		this.count = function(id, appid, table, tag, bindid) {
			if (id == null || appid == null || table == null || tag == null) throw new TypeError("count:appid or id or table or tag undefined");
			return pool(function(conn) {
				var sql = "SELECT COUNT(*) FROM data WHERE id=? And appid=? And `list`=? And tag=?";
				if (bindid != null)
					sql += " And bindid=?";
				var rs = conn.execute(sql, id, appid, table, tag, bindid);
				return rs[0][0];
			});
		}

		this.insert = function(id, appid, table, tag, bindid, sort, value, created) {
			if (id == null || appid == null || table == null || tag == null || bindid == null || sort == null || value == null || created == null)
				throw new TypeError("insert:params error.");
			return pool(function(conn) {
				var sql = "REPLACE INTO data (id, appid, `list`, tag, bindid, sort, created, changed, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);"
				var r = conn.execute(sql, id, appid, table, tag, bindid, sort, created, created, value);
				return r.affected === 1 || r.affected === 2;
			});
		}
	}
}