const co = require('co');

module.exports = function(pool) {
	return new function() {
		this.genId = function() {
			return co(function*() {
				let db = yield pool.getConnection();
				let sql = "SELECT * FROM ids WHERE idName='object'";
				let [result, fields] = yield db.execute(sql);
				let id = result[0].nowId;
				let newId = id + 1;

				sql = "update ids set nowId = " + newId + " where idName = 'object'";

				let [result2] = yield db.execute(sql);
				db.release();
				return result2.affectedRows === 1 ? newId : false;
			});
		}

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

		this.addBlog = function(id, tag, value) {
			return co(function*() {
				let db = yield pool.getConnection();
				let sql = "INSERT INTO DATA VALUE (?,?,?,?,?,?,?,?)";
				let params = [1, 'blog', tag, id, id, new Date(), new Date(), value];

				const [result] = yield db.execute(sql, params);

				db.release();
				return result.affectedRows === 1;
			});
		}

		this.insertMsg = function(id, value) {
			return co(function*() {
				let db = yield pool.getConnection();
				let sql = "INSERT INTO DATA VALUE (?,?,?,?,?,?,?,?)";
				let params = [id, '', '', 0, 0, new Date(), new Date(), value];

				const [result] = yield db.execute(sql, params);

				db.release();
				return result.affectedRows === 1;
			});
		}
	}
}