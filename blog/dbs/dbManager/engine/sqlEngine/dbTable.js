"use strict";

var util = require("util");
var coroutine = require('coroutine');
var LOCKERS = {};
var MergeRunner = {};

module.exports = function(pool) {

	return new function() {
		this.transaction = function(appid, func, lockparams) {
			return pool(function(conn) {
				var dbTable = new module.exports(
					function(fn) {
						return fn(conn);
					});
				conn.begin();
				try {
					dbTable.lock(appid, lockparams);
					var r = func(dbTable);
					conn.commit();
					return r;
				} catch (e) {
					conn.rollback();
				}
				return false;
			});
		}

		this.lock = function(appid, lockparams) {
			return pool(function(conn) {
				if (!util.isArray(lockparams[1]))
					lockparams = [lockparams];
				if (lockparams.length > 2) throw new Error("transaction:lock params length max!"); //目前只支持2条记录锁

				var sql = "Update data set sort=sort WHERE ";
				var it = [];
				var keys = [];

				lockparams.forEach(function(o) {
					var _ids = o[0];
					if (!util.isArray(_ids)) _ids = [_ids];

					var list = o[1] || "",
						tag = o[2] || "",
						sort = o[3] || 0,
						bindid = o[4] || 0;

					_ids.forEach(function(id) {
						var key = [id, appid, list, tag, sort, bindid].join("_");
						if (keys.indexOf(key) !== -1)
							throw new Error("transaction:same lock params!");

						keys.push(key);

						sql += (!it.length ? "" : "or") + " (id = ? and appid = ? and list =? and tag = ? and sort = ? and bindid = ?) ";
						it = it.concat([id, appid, list, tag, sort, bindid]);
						if (it.length > 12) throw new Error("transaction:lock params length max!"); //目前只支持2条记录锁
					});
				});

				return conn.execute(sql, it[0], it[1], it[2], it[3], it[4], it[5], it[6], it[7], it[8], it[9], it[10], it[11], it[11]);
			});
		}

		this.all = function(id, appid, table) {
			if (id == null || appid == null || table == null) throw new TypeError("all:appid or id or table undefined");
			return pool(function(conn) {
				var sql = "SELECT * FROM data WHERE id " + (util.isArray(id) ? "in" : "=") + " ? And appid=? And `list`=? and bindid > 0;";
				return conn.execute(sql, id, appid, table);
			});
		}

		this.distinct = function(field, id, appid) {
			if (id == null || !appid || field !== "list") throw new TypeError("distinct: param error");
			return pool(function(conn) {
				var sql = "SELECT DISTINCT `" + field + "` FROM data WHERE id = ?";
				if (field === "list") sql += " AND appid = ? ";
				return conn.execute(sql, id, appid);
			});
		}

		this.getKV = function(id, appid, table, tag) {
			if (id == null || appid == null || table == null || tag == null) throw new TypeError("getKV:appid or id or table or tag undefined");
			return pool(function(conn) {
				var sql = "SELECT * FROM data WHERE id = ? and appid = ? and `list` = ? And tag " + (util.isArray(tag) ? "in" : "=") + " ? and sort = 0 and bindid = 0;";
				return conn.execute(sql, id, appid, table, tag);
			});
		}

		this.ptags = function(id, appid, table, limit, range, order) {
			if (id == null || appid == null || table == null) throw new TypeError("tags:appid or id or table undefined");
			return pool(function(conn) {
				var t = [];
				var sql = "SELECT * FROM data WHERE id " + (util.isArray(id) ? "in" : "=") + " ? And appid=? And `list`=? and sort > 0 and bindid >0";

				if (range) {
					if (range[0]) {
						sql += " And sort>?";
						t.push(range[0]);
					}
					if (range[1]) {
						sql += " And sort<?";
						t.push(range[1]);
					}
				}
				if (order != "desc") order = "asc";
				sql += " order by sort " + order;

				if (limit) {
					sql += " limit ?"
					t.push(limit);
				}
				return conn.execute(sql, id, appid, table, t[0], t[1], t[2]);
			});
		}

		this.tags = function(id, appid, table, tag, limit, range, order) {
			if (id == null || appid == null || table == null || tag == null) throw new TypeError("tags:appid or id or table or tag undefined");
			return pool(function(conn) {
				var t = [];
				var sql = "SELECT * FROM data WHERE id " + (util.isArray(id) ? "in" : "=") + " ? And appid=? And `list`=? And tag " + (util.isArray(tag) ? "in" : "=") + " ?";

				if (range) {
					if (range[0]) {
						sql += " And sort>?";
						t.push(range[0]);
					}
					if (range[1]) {
						sql += " And sort<?";
						t.push(range[1]);
					}
				}
				if (order != "desc") order = "asc";
				sql += " order by sort " + order;

				if (limit) {
					sql += " limit ?"
					t.push(limit);
				}
				return conn.execute(sql, id, appid, table, tag, t[0], t[1], t[2]);
			});
		}

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

		this.save = function(id, appid, table, tag, bindid, sort, value, changed, oldsort) {
			if (id == null || appid == null || table == null || tag == null || bindid == null || sort == null || value == null || changed == null || oldsort == null) throw new TypeError("save:params error.");
			return pool(function(conn) {
				var sql = "UPDATE data set value = ?, sort = ?, changed = ? where id = ? and appid = ? and `list` = ? and tag = ? and bindid = ? and sort = ?;";
				var r = conn.execute(sql, value, sort, changed, id, appid, table, tag, bindid, oldsort);
				return r.affected === 1;
			});
		}

		this.delete = function(id, appid, table, bindid, tag, sort) {
			if (id == null || appid == null || table == null || bindid == null)
				throw new TypeError("delete: params error.");
			return pool(function(conn) {
				var sql = "DELETE FROM data WHERE id = ? And appid = ? And `list` = ? And bindid = ?";
				if (tag != null && sort != null)
					sql = sql + " And tag = ? And sort = ?;";
				return conn.execute(sql, id, appid, table, bindid, tag, sort).affected >= 1;
			});
		}

		this.batchErase = function(id, appid, table, tag, order, limit) {
			if (id == null || appid == null || table == null)
				throw new TypeError("batchErase: params error.");
			return pool(function(conn) {
				var sql = "DELETE FROM data WHERE id = ? And appid = ? And `list` = ? And tag = ?";
				sql = sql + " order by sort " + order + " limit " + limit;
				return conn.execute(sql, id, appid, table, tag).affected >= 1;
			});
		}

		this.counter = function(id, appid, table, tag, operate, modify, changed) {
			if (id == null || appid == null || tag == null || changed == null) throw new TypeError("inc:appid or id or table undefined");
			if (operate !== "+" && operate !== "-") throw new TypeError("operate error:" + operate);
			var error;

			var r = pool(function(conn) {
				var v = 0;
				do {
					var rs = conn.execute('SELECT value FROM data WHERE id = ? And appid = ? And `list` = ? And tag = ? And bindid = 0 And sort = 0;', id, appid, table, tag);
					if (rs.length === 0) return error = new Error("IdName Error:" + tag);
					v = Number(rs[0].value);
					if (isNaN(v)) return error = new Error("IdName Value Error:" + tag + "=" + rs[0].value);
					rs = conn.execute('UPDATE data set value = value ' + operate + ' ?, changed = ? WHERE id = ? And appid = ? And `list` = ? And tag = ? And bindid = 0 And sort = 0 And value = ?;', modify, changed, id, appid, table, tag, v);
				} while (rs.affected !== 1);
				if (operate === "+")
					return v + modify;
				else
					return v - modify;
			});
			if (error)
				throw error;
			else
				return r;

		}

		this.inc = function(id, appid, table, tag, changed) {
			var r;
			if (id == null || appid == null || tag == null || changed == null) throw new TypeError("inc:appid or id or table undefined");
			var k = [id, appid, table, tag].join("_"),
				_locker = LOCKERS[k];
			if (!_locker) {
				_locker = LOCKERS[k] = {
					locker: new coroutine.Lock(),
					nowId: undefined,
					waits: 0,
					pools: 0
				}
			}

			_locker.waits++;
			_locker.locker.acquire();
			try {
				if (_locker.pools === 0) {
					_locker.nowId = pool(function(conn) {
						var rs, v, m;
						do {
							rs = conn.execute('SELECT value FROM data WHERE id = ? And appid=? And `list`=? And tag = ? And bindid = 0 And sort = 0;', id, appid, table, tag);
							if (rs.length === 0) throw new Error("inc Error:" + k);
							v = Number(rs[0].value);
							m = _locker.waits;
							if (isNaN(v)) throw new Error("inc v is error:" + k);
							rs = conn.execute('UPDATE data set value = value + ' + m + ', changed = ? WHERE id = ? And appid = ? And `list` = ? And tag = ? And bindid = 0 And sort = 0 And value = ?;', changed, id, appid, table, tag, v);
						} while (rs.affected !== 1)
						_locker.pools = m;
						return v;
					});
				}
			} finally {
				_locker.locker.release();
				_locker.waits--;
				_locker.pools--;
				_locker.nowId++;
				r = _locker.nowId;
				if (_locker.waits === 0) delete LOCKERS[k];
			}
			return r;
		}

		this.listTag = function(id, appid, table, tag, limit, range, order) {
			if (id == null || appid == null || table == null || tag == null) throw new TypeError("listTag:appid or id or table or tag undefined");
			return pool(function(conn) {
				var t = [];
				var sql = "SELECT a.id,a.appid,a.list,a.sort,a.tag,a.bindid,a.created,a.changed,b.value FROM data as a left join data as b on a.bindid = b.bindid and a.id = b.id and a.appid = b.appid and a.list = b.list and a.sort = b.sort and b.tag = '' WHERE a.id = ? And a.appid=? And a.list=? And a.tag " + (util.isArray(tag) ? "in" : "=") + " ? ";
				if (range) {
					if (range[0]) {
						sql += " And a.sort>?";
						t.push(range[0]);
					}
					if (range[1]) {
						sql += " And a.sort<?";
						t.push(range[1]);
					}
				}
				if (order != "desc") order = "asc";
				sql += " order by a.sort " + order;

				if (limit) {
					sql += " limit ?"
					t.push(limit);
				}
				return conn.execute(sql, id, appid, table, tag, t[0], t[1], t[2]);
			});
		}

		this.updateTag = function(id, appid, table, tag, bindid, changed) {
			if (id == null || appid == null || table == null || tag == null || bindid == null || changed == null)
				throw new TypeError("updateTag:id or appid or table or tag or bindid  or changed undefined");
			return pool(function(conn) {
				var sql = "update data set tag = ?, changed = ? where id = ? and appid = ? and `list` = ? and bindid = ?;";
				conn.execute(sql, tag, changed, id, appid, table, bindid);
				return true;
			});
		}

		this.updateSort = function(id, appid, table, bindid, sort, changed) {
			if (id == null || appid == null || table == null || bindid == null || sort == null || changed == null)
				throw new TypeError("updateSort:id or appid or table or bindid or sort undefined");
			return pool(function(conn) {
				var mk = ["updateSort", id, appid, table, bindid].join("_");
				if (MergeRunner[mk] !== undefined) {
					if (sort > MergeRunner[mk]) MergeRunner[mk] = sort;
					return true;
				}

				MergeRunner[mk] = sort;
				var ms;
				try {
					do {
						ms = MergeRunner[mk];
						var sql = "update data set sort = ?, changed = ? where id = ? and appid = ? and `list` = ? and bindid = ? and sort < ?;";
						conn.execute(sql, ms, changed, id, appid, table, bindid, ms);
					} while (ms !== MergeRunner[mk])
				} finally {
					delete MergeRunner[mk];
				}
				return true;
			});
		}

		this.addTag = function(id, appid, table, tag, bindid, value, created) {
			if (id == null || appid == null || table == null || tag == null || bindid == null || value == null || created == null)
				throw new TypeError("addTag:params error.");
			return pool(function(conn) {
				while (true) {
					var rs = conn.execute("select sort from data where id = ? and appid = ? and list = ? and tag = '' and bindid = ?;", id, appid, table, bindid);
					if (rs.length !== 1) return false;
					var sql = "INSERT INTO `data` (`id`, `appid`, `list`, `tag`, `sort`, `bindid`, `value`, `created`, `changed`) SELECT id, appid, list, ?, sort, bindid, ?, ?, ? FROM `data` where id = ? and appid = ? and list = ? and tag = '' and bindid = ? and sort = ?;"
					rs = conn.execute(sql, tag, value, created, created, id, appid, table, bindid, rs[0].sort);
					if (rs.affected === 1) return true;
				}
			});
		}
	}
}