var util = require("util");

module.exports = function(pool) {
	return new function() {
		this.addInfo = function(k, size, height, width, type, userid, exif) {
			exif = exif || ""; //fibjs暂时未开放exif接口
			if (k == null || size == null || height == null || width == null || type == null || userid == null || exif == null)
				throw new TypeError("addInfo params is null");
			return pool(function(conn) {
				var rs = conn.execute("select 1 from attachinfo where k = ?", k);
				if (rs.length > 0) return true;
				return conn.execute("insert into attachinfo (k, size, height, width, type, isdelete, userid, exif,created) values(?,?,?,?,?,?,?,?,?);", k, size, height, width, type, 0, userid, exif, new Date()).affected === 1;
			});
		}

		this.getInfo = function(k) {
			return pool(function(conn) {
				var rs = conn.execute("select k,type,height,width,size,userid,exif,isdelete,created from attachinfo where k " + (util.isArray(k) ? "in" : "=") + " ?;", k);

				if (util.isArray(k)) {
					return rs.toJSON().map(function(r) {
						return r.toJSON();
					});
				} else {
					return rs.length === 1 ? rs[0].toJSON() : undefined;
				}
			});
		}
	}
}