module.exports = function(pool) {
	return new function() {
		this.hasKey = function(k) {
			return pool(function(conn) {
				var rs = conn.execute("select k from attachment where k = ?", k);
				return rs.length > 0;
			});
		}

		this.getValue = function(k) {
			return pool(function(conn) {
				var rs = conn.execute("select v from attachment where k = ?", k);
				if (rs.length > 0) return rs[0]['v'];
				else return;
			});
		}

		this.addValue = function(k, v) {
			if (k == null || v == null) throw new TypeError("addValue params is null");
			return pool(function(conn) {
				var rs = conn.execute("select 1 from attachment where k = ?", k);
				if (rs.length > 0) return true;
				return conn.execute("insert into attachment (k,v) values(?,?);", k, v).affected === 1;
			});
		}
	}
}