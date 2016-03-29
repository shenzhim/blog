module.exports = function(pool) {
	return new function() {
		this.get = function(n) {
			n = n.toLowerCase();
			var error;
			var r = pool(function(conn) {
				var rs = conn.execute('select id from name2id where name = ?', n);
				if (rs.length > 1) return error = new Error("name2Id Error");
				else if (rs.length === 1) return rs[0].id;
				return 0;
			});
			if (error)
				throw error;
			else
				return r;
		}

		this.put = function(id, n) {
			n = n.toLowerCase();
			return pool(function(conn) {
				var rs = conn.execute('select id from name2id where name = ? limit 1', n);
				if (rs.length > 0) return false;
				return conn.execute('Insert Into name2id (name, id) values(?, ?)', n, id).affected === 1;
			});
		}

		this.remove = function(id, n) {
			n = n.toLowerCase();
			return pool(function(conn) {
				return conn.execute('Delete from name2id where name = ? and id = ?', n, id).affected === 1;
			});
		}
	}
}