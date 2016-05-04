"use strict";

var coroutine = require("coroutine");
var LOCKERS = {};

module.exports = function(pool) {
	return new function() {
		function maxId(conn, n) {
			n = n.toLowerCase();
			var rs = conn.execute('select nowId from ids where IdName = ?', n);
			return rs.length === 0 ? null : rs[0].nowId;
		}

		this.maxId = function(n) {
			var error;
			var r = pool(function(conn) {
				var id = maxId(conn, n);
				if (id === null) return error = new Error("IdName maxId Error:" + n);
				return id;
			});
			if (error)
				throw error;
			else
				return r;
		}

		this.genId = function(n) {
			var r;
			var _locker = LOCKERS[n];
			if (!_locker) {
				_locker = LOCKERS[n] = {
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
						var rs, id, m;
						do {
							id = maxId(conn, n);
							if (id === null) throw new Error("IdName genId Error:" + n);
							m = _locker.waits;
							rs = conn.execute('update ids set nowId = nowId  + ' + m + ' where IdName = ? and nowId = ?', n, id);
						} while (rs.affected !== 1)
						_locker.pools = m;
						return id;
					});
				}
			} finally {
				_locker.locker.release();
				_locker.waits--;
				_locker.pools--;
				_locker.nowId++;
				r = _locker.nowId;
				if (_locker.waits === 0) delete LOCKERS[n];
			}
			return r;
		}
	}
}