"use strict";
var coroutine = require('coroutine');
var util = require('util');
var poolstat = [];

module.exports = function(name, init, nm, timeout) {
	if (util.isFunction(name)) {
		timeout = nm;
		nm = init;
		init = name;
		name = "";
	}

	nm = nm || 10;
	name = name || init.name;
	var sem = new coroutine.Semaphore(nm);
	var pools = [];
	var count = 0;
	var clearTimer = false;
	var waitlen = 0;

	timeout = timeout || 60000;

	function clearPool() {
		var c;
		var d = new Date().getTime();

		while (count) {
			c = pools[0];

			if (d - c.time.getTime() > timeout) {
				pools = pools.slice(1);
				count--;

				try {
					c.o.dispose();
				} catch (e) {
					console.error("pool error: ", e.toString(), c);
				}
			} else
				break;
		}
	}

	var pool = function(func) {
		var r;
		var o;

		clearPool();

		waitlen++;

		sem.acquire();

		waitlen--;
		try {
			o = count ? pools[--count].o : init();
			r = func(o);
			pools[count++] = {
				o: o,
				time: new Date()
			};

		} catch (e) {
			try {
				o.dispose();
			} catch (e) {}

			throw e;
		} finally {
			sem.post();

			if (!clearTimer) {
				clearTimer = true;
				coroutine.start(function() {
					while (count) {
						coroutine.sleep(timeout / 10);
						clearPool();
					}
					clearTimer = false;
				});
			}
		}

		return r;
	}

	pool.connections = function() {
		return count;
	}

	pool.info = function() {
		return {
			name: name,
			maxsize: nm,
			open: pools.length,
			idleopen: count,
			wait: waitlen,
			timeout: timeout
		}
	}

	poolstat.push(pool);
	return pool;
}

module.exports.poolstat = poolstat;