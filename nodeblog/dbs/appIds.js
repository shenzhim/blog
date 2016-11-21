module.exports = function(pool) {
	return new function() {
		this.put = function(appid, version, id) {
			if (appid == null || !version || id == null) throw new TypeError("put:appid or version or id undefined");
			return pool.getConnection(function(err, conn) {
				if (err) throw err;

				var sql = "INSERT INTO appIds (appid,version,id) VALUES(?,?,?);";

				return conn.query(sql, [appid, version, id], function(err, result) {
					if (err) {
						console.log("query sql error", err);
					}
					conn.release();
				});
			});
		}

		this.get = function(appid, version, limit, range, order) {
			if (appid == null || !version) throw new TypeError("get:appid or version undefined");
			return pool(function(conn) {
				var t = [],
					sql = "Select id from appIds where appid = ? and version = ?";

				if (range) {
					if (range[0]) {
						sql += " And id>?";
						t.push(range[0]);
					}
					if (range[1]) {
						sql += " And id<?";
						t.push(range[1]);
					}
				}

				sql = sql + " order by id " + ((order === "desc") ? "desc" : "asc");
				if (limit) {
					sql = sql + " limit ?;"
					t.push(limit);
				}
				return conn.execute(sql, appid, version, t[0], t[1], t[2]);
			});
		}

		this.count = function(appid, version, id) {
			if (appid == null || !version) throw new TypeError("count:appid or version undefined");
			return pool(function(conn) {
				var sql = "Select COUNT(*) from appIds where appid = ? and version = ?";
				if (id != null) sql = sql + " and id = ?;"

				return conn.execute(sql, appid, version, id)[0][0];
			});
		}

		this.update = function(appid, id, version, nversion) {
			if (appid == null || id == null || !version || !nversion) throw new TypeError("update:appid or id or version or nversion undefined");
			return pool(function(conn) {
				var sql = "UPDATE appIds set version = ? where appid = ? and version = ? and id = ?";
				return conn.execute(sql, nversion, appid, version, id).affected === 1;
			});
		}

		this.remove = function(appid, version, id) {
			if (id == null || !version || appid == null) throw new TypeError("remove: appid or id or version is error!");
			return pool(function(conn) {
				return conn.execute('Delete from appIds where appid = ? and version = ? and id = ?', appid, version, id).affected === 1;
			});
		}
	}
}