var util = require("util");

module.exports = function(pool) {
	return function(table, inter) {
		return new function() {
			function get(k) {
				return pool(function(conn) {
					var v = {};
					if (util.isObject(k) && !util.isArray(k)) k = util.keys(k);

					var sql = "SELECT * FROM cache WHERE `list`=? and k " + (util.isArray(k) ? "in" : "=") + " ?";
					var rs = conn.execute(sql, table, k);

					rs.map(function(r) {
						v[r.k] = r.v.toString(); //mysql is buffer
						if (inter && new Date() - new Date(r["changed"]) > inter) conn.execute("UPDATE cache Set changed=? WHERE `list`=? And k =?", new Date(), table, r.k);
					});

					if (util.isArray(k)) return v;
					else return v[k];
				});
			}

			this.put = function(k, v) {
				return pool(function(conn) {
					var sql = "REPLACE INTO cache (`list`,k,v,changed) VALUES(?,?,?,?);";

					function _p(k, v) {
						if (util.isObject(v)) v = JSON.stringify(v);

						conn.execute(sql, table, k, v, new Date());
					}

					if (k && v) {
						_p(k, v);
					} else if (util.isObject(k) && !v) {
						v = k;
						for (k in v)
							_p(k, v[k]);
					}
					return true;
				});
			};

			this.get = get;

			this.getJSON = function(k) {
				var v = get(k);
				if (!v) return;

				if (util.isObject(v)) {
					for (var k in v) {
						if (v[k]) v[k] = JSON.parse(v[k]);
					}
				} else {
					v = JSON.parse(v);
				}
				return v;
			}
			this.remove = function(k) {
				return pool(function(conn) {
					var sql = "DELETE FROM cache WHERE `list`=? And k=?";
					return conn.execute(sql, table, k).affected === 1;
				});
			}

			this.count = function() {
				return pool(function(conn) {
					return conn.execute("select count(*) from cache where `list`=?", table)[0][0];
				});
			}

			this.clear = function(t) {
				return pool(function(conn) {
					conn.execute("DELETE FROM cache WHERE `list`=? And changed < ?", table, new Date(new Date().getTime() - t));
					return true;
				});
			}

			this.batchRemove = function(l) {
				return pool(function(conn) {
					conn.execute("DELETE FROM cache WHERE `list`=? And k IN ?", table, l);
					return true;
				});
			}
		}
	}
}