"use strict";
var ids = require('modules/ids');
var coroutine = require("coroutine")
var apps = require("apps");
var apploader = apps.apploader;
var encoding = require('encoding');
var util = require('util');
var dbManager = require("dbs/dbManager");
var objectCache = dbManager.objectCache;
var tsCache = dbManager.tsCache;
var pageCache = dbManager.pageCache;
var appCache = dbManager.appCache;
var dataCache = dbManager.dataCache;
var appManage = apploader[0].root.object.getAppManage();
var MergeRunner = {};
var Locker = {};

//app manager

function is_numeric(a) {
	return a - parseFloat(a) >= 0;
}

function apiproxy(fn) {
	return function() {
		return fn.apply(this, Array.prototype.slice.call(arguments, 1));
	}
}

function coroutineAppids(id) {
	var appinfo = coroutine.current().appinfo;

	if (!appinfo)
		coroutine.current().appinfo = {};
	else if (appinfo[id])
		return appinfo[id];

	var appids = apploader[id].root.object.appids();
	coroutine.current().appinfo[id] = appids;
	return appids;
}

function create(fromid, table, tag, rootAppName, e, ns, installs) {
	function genappid(names) {
		var err = {};
		for (var k in names) {
			var v = names[k];
			if (!v) {
				err[k] = "empty";
				return err;
			}
			if (check2(v)) {
				err[k] = "notallowed";
				return err;
			}
		}
		var id = ids.genObjectId(names);
		if (id === 0) {
			for (var k in names) {
				if (ids.check(names[k]))
					err[k] = "exists";
			}
			return err;
		}
		return id;
	}

	var appcfg = appManage.getconfig(rootAppName);
	if (!appcfg.root) throw new Error("not root app");
	var callee = apps.appstack().callee;
	var callee_name = callee.name
	if (!callee || (!!appcfg.install && appcfg.install.indexOf(callee_name) === -1))
		throw new Error("install not allowed rootAppName: " + rootAppName + " callee_name: " + callee_name);

	var r = apploader[-1].root.object.check(rootAppName, e, callee_name);
	if (r) return r;

	installs = installs || {};
	for (var appname in installs) {
		r = apploader[-1].root.object.check(appname, installs[appname] || {}, callee_name);
		if (r) return r;
	}

	var d = {};
	for (var i in ns)
		d[ns[i]] = e[ns[i]];

	var id = genappid(d);
	if (!util.isNumber(id)) return id;

	r = apploader[id].root.object.create(fromid, rootAppName, e, d, callee.id, installs);
	if (!r) return false;

	return id;
}

function installinfo(status, id, appname) {
	if (!appname) {
		var appstack = apps.appstack(),
			appname = appstack.callee.name;
	}
	var appsinfo = apploader[id].root.object.appids()
	return appsinfo != null && appsinfo[appManage.name2id(appname)] === status;
}

var object = {
	base: function obj_base(s) {
		var r = {};
		if (!s) return r;

		r.id = ids.get(s);
		if (!!r.id) {
			r.root = apploader[r.id].root.object.rootapp()
		}
		return r;
	},
	getPower: function obj_getPower(id, type) {
		if (id === 0) return true; //游客首页

		var rootapp = apploader[id].root.object.rootapp();
		if (!rootapp) return false;
		var appids = coroutineAppids(id);
		var keys = util.keys(appids);
		keys = keys.filter(function(appid) {
			var res,
				appName = appManage.id2name(appid),
				fn = apploader[id][appName].object.expire;

			if (fn && util.isFunction(fn)) res = fn("get", type);
			if (res === undefined || isNaN(res)) return false;
			return true;
		});

		if (!keys.length) return false;

		return keys.every(function(appid) {
			var appName = appManage.id2name(appid);
			var app = apploader[id][appName].object;
			if (app.getPower && util.isFunction(app.getPower) && !app.getPower(type)) return false;
			return true;
		})
	},
	set: function obj_set(id, type, e) {
		for (var appid in apploader[id].root.object.appids()) {
			var appName = appManage.id2name(appid);
			var app = apploader[id][appName].object;
			if (app.set && util.isFunction(app.set) && !app.set(type, e))
				return false;
		}
		return true;
	}
}

var admin = {
	rename: function(name, newname) {
		var id = ids.get(encoding.decodeURI(name));
		if (!id) {
			return {
				name: "notexists"
			}
		}

		if (ids.check(newname)) {
			return {
				newname: "exists"
			}
		}

		var r = ids.put(id, newname);
		if (!r) {
			return {
				newname: "puterrro"
			}
		}

		//change app
		var appids = apploader[id].root.object.appids();
		for (var appId in appids) {
			var appName = appManage.id2name(appId);
			var app = apploader[id][appName].object;
			if (app.rename && util.isFunction(app.rename))
				app.rename(newname);
		}

		ids.remove(id, name);
		return true;
	},
	resetpasswd: function(id, passwd) {
		var id = Number(id);
		if (apploader[id].root.object.rootapp() != "user") return {
			error: {
				name: "error"
			}
		}

		var app = apploader[id].user.object
		app.resetpasswd(passwd);
		return true;
	}
}

function _get(news, status) {
	var _this = this,
		objects = {},
		dependIds = {},
		ts = {},
		ts1 = {},
		gets = [],
		r,
		filterNews,
		pageCachetime = {},
		objectCachetime = {};

	/* debugger
	var pageCache = {};
	var tsCache = pageCache;
	var objectCache = pageCache;
	tsCache.get = pageCache.getJSON = pageCache.remove = pageCache.put = function() {
		return {}
	};
	//*/

	status = status || {};
	var object = {
		isExpire: function obj_isExpire(t, d) {
			var id = d.id,
				type = d.base.tmpl,
				mintime;

			if (id === 0 && d.base.root === "user") return 0;

			var appids = coroutineAppids(id);
			for (var appid in appids) {
				var appName = appManage.id2name(appid);

				// 如果 fn 不存在，不允处理；如果 fn 存在且 fn(t, type) 返回值为 0，表示不缓存该视图数据
				var fn = apploader[id][appName].object.expire;
				if (fn && util.isFunction(fn) && fn(t, type) !== undefined) {
					var cachetime = fn(t, type);
					if (cachetime === 0) return 0;

					if (mintime === undefined || mintime > cachetime) mintime = cachetime;
				}
			}
			return mintime;
		},
		get: function obj_get(id, type) {
			function getAppData(id, type, appId, appName) {
				var k = type + "_" + id + "_" + appId,
					key = type + "_" + id,
					o = apploader[id][appName].object,
					cachetime = o.expire("appcache", type);

				if (cachetime > 0) {
					// 获取 appCache 数据，如果存在且未过期，直接返回
					var r = appCache.getJSON(k);
					if (r && r.tc && r.tc > new Date().getTime()) {
						cachetime = r.tc - new Date().getTime();
						if (objectCachetime[key] === undefined || objectCachetime[key] > cachetime)
							objectCachetime[key] = cachetime;
						return r.data;
					}
				}

				// 不存在缓存数据或者缓存数据已过期，调用 app 的 get 方法获取 app 的视图数据
				var appData = o.get(type);

				if (cachetime === 0) {
					// 如果 app.expire 返回值为 0，表示 app 存在该视图数据，但不缓存
					objectCachetime[key] = 0;
					return appData;
				}

				// 如果 app.expire 返回值大于 0，表示 app 存在该视图数据，如果视图数据不为空，缓存
				if (appData) {
					var t = new Date().getTime();
					appCache.put(k, {
						data: appData,
						ts: t,
						tc: t + cachetime
					});
				}

				// 记录最小 appData 的 cachetime
				if (objectCachetime[key] === undefined || objectCachetime[key] > cachetime)
					objectCachetime[key] = cachetime;

				return appData;
			}

			type = type || "";
			if (id === 0) {
				var d = {
					id: 0,
					base: {
						root: "user",
						tmpl: type.split("_")[0]
					}
				};
				var _appnames = appManage.getdependapps("user");
				_appnames.unshift("user");

				coroutine.parallel(_appnames, function(appName) {
					var appId = appManage.name2id(appName);

					var fn = apploader[id][appName].object.expire;
					if (!fn || !util.isFunction(fn) || fn("appcache", type) === undefined) return;

					d[appName] = getAppData(id, type, appId, appName);
					if (d[appName]) {
						d.base.app = appName;
					}
				}, 10);
			} else {
				var d = {
					id: id,
					base: {
						root: apploader[id].root.object.rootapp(),
						tmpl: type.split("_")[0]
					}
				};
				var _appnames = [];
				var appids = coroutineAppids(id);
				util.keys(appids).forEach(function(appId) {
					var appName = appManage.id2name(appId);
					var fn = apploader[id][appName].object.expire;
					if (!fn || !util.isFunction(fn) || fn("appcache", type) === undefined) return;

					_appnames.push({
						appId: appId,
						appName: appName
					});
				})

				if (_appnames.length) {
					coroutine.parallel(_appnames, function(o) {
						d[o.appName] = getAppData(id, type, o.appId, o.appName);
					}, 10);

					var appName = _appnames[_appnames.length - 1].appName;
					if (d[appName]) {
						d.base.app = appName;
					}
				}
			}
			return d;
		},
		getIds: function obj_getIds(id, type, d) {
			var _dependIds = {};
			for (var appName in d) {
				if (appName == "id" || appName == "base") continue;
				if (!d[appName]) continue;
				var app = apploader[id][appName].object;
				var ids = app.getIds(type, d[appName]);
				if (ids) {
					for (var t in ids) {
						if (!_dependIds[t]) _dependIds[t] = [];
						_dependIds[t] = util.union(_dependIds[t], ids[t]);
					}
				}
			}
			return _dependIds;
		},
		fill: function obj_fill(id, type, d, ds) {
			for (var appName in d) {
				if (appName == "id" || appName == "base") continue;
				if (!d[appName]) continue;
				var app = apploader[id][appName].object;
				var r = app.fill(type, d[appName], ds);
				if (r) d[appName] = r;
			}
			return d;
		}
	}

	function checkTS(ids, t) {
		if (!ids || !ids.length) return true;

		var ids2 = [];
		for (var i in ids) {
			var k = ids[i];
			if (!ts[k]) ids2.push(k);
			else if (ts[k] > t) return false;
		}

		if (!ids2.length) return true;

		var result = true;
		var rs = tsCache.get(ids2);
		for (var i in ids2) {
			var k = ids2[i];
			if (!rs[k]) {
				result = false;
			} else {
				ts[k] = rs[k];
				if (result && rs[k] > t) {
					result = false;
				}
			}
		}
		return result;
	}

	news.forEach(function(k) {
		objects[k.join("_")] = {};
	});

	while (news.length > 0) {
		r = pageCache.getJSON(news.map(function(e) {
			return e.join("_");
		}));

		filterNews = [];

		news = news.filter(function(e) {
			var k = e.join("_");
			var d = r[k];
			// pageCache 存在缓存且自身未过期
			if (d && d.tc && d.tc > new Date().getTime()) {
				return true;
			} else {
				filterNews.push(e);
				return false;
			}
		});

		if (news.length > 0) {
			coroutine.parallel(news, function(e) {
				var k = e.join("_");
				var d = r[k];
				// pageCache 依赖的 pageCache 是否过期
				if (stats.call(_this, checkTS, d.ids, d.ts)) {
					objects[k] = d.data;
					dependIds[k] = d.ids;
					pageCachetime[k] = d.tc - new Date().getTime();
					d.ids.forEach(function(id) {
						if (!pageCachetime[id]) pageCachetime[id] = pageCachetime[k]
					})

					status[k] = {
						lastModified: d.ts
					}
					return;
				} else if (!objects[k]) {
					objects[k] = {};
				}
				filterNews.push(e);
			}, 10);
		}

		news = filterNews;

		if (news.length > 0) {
			var objs = [];

			r = objectCache.getJSON(news.map(function(e) {
				return e.join("_");
			}));

			news = news.filter(function(e) {
				var k = e.join("_");
				var d = r[k];
				// objectCache 存在缓存且自身未过期
				if (!d || !d.tc || d.tc <= new Date().getTime()) return true;

				objects[k] = d.data;
				objs.push(e);
				objectCachetime[k] = d.tc - new Date().getTime();
				pageCachetime[k] = objectCachetime[k];
				return false;
			});

			if (news.length > 0) {
				coroutine.parallel(news, function(e) {
					var k = e.join("_");
					objects[k] = stats.call(_this, object.get, e[1], e[0]);
					var t = new Date().getTime();
					objs.push(e);

					// objectCache 的所有 app 的最小 cachetime 大于 0，且自身配置的 cachetime 大于 0，才保存数据
					if (objectCachetime[k] && objectCachetime[k] > 0) {
						var cachetime = stats.call(_this, object.isExpire, "get", objects[k]);
						if (objectCachetime[k] > cachetime) objectCachetime[k] = cachetime;

						var fn5_1 = function fn5_1() {
							if (objectCachetime[k] > 0) {
								objectCache.put(k, {
									data: objects[k],
									ts: t,
									tc: t + objectCachetime[k]
								});
								ts1[k] = t;
							}
							pageCachetime[k] = objectCachetime[k];
						}
						stats.call(_this, fn5_1);
					}
				});
				news = [];
			}

			objs.forEach(function(e) {
				var k = e.join("_");
				var ids = stats.call(_this, object.getIds, e[1], e[0], objects[k]);
				var ids2 = [];
				for (var t in ids) {
					ids[t].forEach(function(e) {
						var d = [t, e];
						var k = d.join("_");
						ids2.push(k);
						if (!objects[k]) {
							objects[k] = {};
							news.push(d);
						}
					});
				}
				dependIds[k] = ids2;
				gets.unshift(e);
			});
		}
	}

	function unionids(depedids) {
		var isDeped = {};

		function depend(k) {
			var d = depedids[k];
			if (isDeped[k]) return d;
			if (!d) {
				isDeped[k] = true;
				return;
			}
			var a,
				r = [];
			d.forEach(function(e) {
				if (e != k) {
					a = depend(e);
					if (a) r = r.concat(a);
				}
			});
			if (d.length && r.length) d = util.union(d, r);
			depedids[k] = d;
			isDeped[k] = true;
			return d;
		}
		for (var k in depedids) {
			depend(k);
		}
		return depedids;
	}

	if (gets.length > 0) {
		coroutine.parallel(util.keys(ts1), function(k) {
			tsCache.put(k, ts1[k]);
		}, 10);

		var deps = [];

		dependIds = unionids(dependIds);

		var filledkeys = [];
		gets = gets.filter(function(e) {
			var k = e.join("_");
			if (filledkeys.indexOf(k) > -1) return false;

			objects[k] = stats.call(_this, object.fill, e[1], e[0], objects[k], objects);

			// pageCache 的 objectCache 的 cachetime 大于 0，且自身配置的 cachetime 大于 0，才可能允许保存数据
			if (pageCachetime[k] && pageCachetime[k] > 0) {
				var cachetime = stats.call(_this, object.isExpire, "fill", objects[k]);
				if (pageCachetime[k] > cachetime) pageCachetime[k] = cachetime;
			}

			filledkeys.push(k);
			return true;
		});

		gets = gets.filter(function(e) {
			var k = e.join("_");
			// 当前 pageCache 及其依赖的 pageCache 允许缓存才保存数据
			if (pageCachetime[k] && pageCachetime[k] > 0 && dependIds[k].every(function(c) {
					if (pageCachetime[c] && pageCachetime[c] > 0) {
						if (pageCachetime[k] > pageCachetime[c])
							pageCachetime[k] = pageCachetime[c];
						return true;
					}
					return false;
				})) return true;
		})

		if (gets.length > 0) {
			coroutine.parallel(gets, function(e) {
				var k = e.join("_");
				var t = new Date().getTime();
				pageCache.put(k, {
					data: objects[k],
					ids: dependIds[k],
					ts: t,
					tc: t + pageCachetime[k]
				});

				status[k] = {
					lastModified: t
				}
			});
		}
	}
	return objects;
}

function get(s, type, v) {
	var r,
		id = 0;
	if (is_numeric(s)) {
		id = Number(s);
		if (id < 0) r = "id is error";
	} else {
		id = ids.get(encoding.decodeURI(s));
		if (!id) r = "id is null";
	}

	if (!util.isString(type)) r = "type is not string";

	if (r) return {
		"result": {
			"error": {
				"msg": r
			}
		}
	};

	type = encoding.decodeURI((type || "").toLowerCase());

	if (!stats.call(this, object.getPower, id, type)) {
		return {
			error: "noPower"
		};
	};

	var k = type + "_" + id,
		locker = Locker[k];
	if (!locker)
		locker = Locker[k] = {
			lock: new coroutine.Lock(),
			waits: 0
		};

	locker.waits++;
	locker.lock.acquire();

	try {
		if (!locker.data) {
			var status = {},
				k = type + "_" + id;

			locker.data = stats.call(this, _get, [
				[type, id]
			], status);

			if (v && status[k] && status[k].lastModified) {
				var ifmod = v.firstHeader('If-Modified-Since');
				if (ifmod && new Date(ifmod).toString() === new Date(status[k].lastModified).toString()) {
					v.response.status = 304;
				}

				v.response.addHeader('Last-Modified', new Date(status[k].lastModified));
				v.response.addHeader('Cache-Control', "max-age=0");
			}
		}

		return locker.data[k];
	} finally {
		locker.lock.release();
		locker.waits--;
		if (locker.waits === 0) delete Locker[k];
	}
}

function set(e) {
	var id = e["id"],
		type = e["type"];
	if (is_numeric(id)) {
		id = Number(id);
	} else {
		id = ids.get(encoding.decodeURI(id));
		if (!id) return {
			"result": {
				"error": {
					"msg": "id is null"
				}
			}
		};
	}
	type = encoding.decodeURI((e["type"] || "").toLowerCase());
	if (!object.getPower(id, type)) {
		return {
			error: "noPower"
		};
	};

	return object.set(id, type, e["e"]);
}

function load(rs, type, fn) {
	type = type || "";
	if (rs.length === 0) return [];
	var uGets = rs.map(function(r) {
		return [type, r["bindid"]];
	});

	var k = uGets.join(""),
		locker = Locker[k];
	if (!locker)
		locker = Locker[k] = {
			lock: new coroutine.Lock(),
			waits: 0
		};

	locker.waits++;
	locker.lock.acquire();

	try {
		if (!locker.data) {
			locker.data = _get(uGets);
		}
		var data = locker.data;
		return rs.map(function(r) {
			var d = {
				data: data[type + "_" + r["bindid"]],
				sort: r["sort"]
			};
			if (fn) {
				return fn(r, d);
			} else {
				return d;
			}
		});
	} finally {
		locker.lock.release();
		locker.waits--;
		if (locker.waits === 0) delete Locker[k];
	}
}

function clearCache(id, type, appid) {
	var mk = ["clearCache", id, type, appid].join("_"),
		callee = apps.appstack().callee;
	if (!appid && callee) appid = callee.id;

	if (MergeRunner[mk] !== undefined) {
		MergeRunner[mk]++;
		return;
	}

	function clearCaches(id, type) {
		id = Number(id) || 0;
		type = type || "";
		var comContent = [],
			appContent = [];
		if (!util.isArray(type)) {
			type = [type];
		}
		type.forEach(function(k) {
			comContent.push(k + "_" + id);
			appContent.push(k + "_" + id + "_" + appid);
		})

		var funs = [

			function() {
				pageCache.batchRemove(comContent);
			},
			function() {
				tsCache.batchRemove(comContent);
			},
			function() {
				objectCache.batchRemove(comContent);
			},
			function() {
				if (appid) appCache.batchRemove(appContent);
			}
		];
		coroutine.parallel(funs);
	}

	do {
		MergeRunner[mk] = 0;
		clearCaches(id, type);
	} while (MergeRunner[mk] !== undefined && MergeRunner[mk] !== 0)
	delete MergeRunner[mk];
}

function check2(v) {
	var ns = ["baoz", "xici", "西祠", "孢子", "发布", "name", "那么"];
	for (var i in ns) {
		if (v.indexOf(ns[i]) > -1) {
			return true;
		}
	}
	return false;
}

function stats() {
	var o = this || {},
		p = Array.prototype.slice.call(arguments),
		fn = p.shift(),
		self = {
			name: fn.name,
			node: []
		},
		t = new Date(),
		v = fn.apply(self, p);

	t = new Date() - t;
	self.runtime = t;

	o.node = o.node || [];
	o.node.push(self);
	return v;
}

module.exports = {
	admin: admin,
	root: {},
	app: {
		create: create,
		isinstall: installinfo.bind(null, 1),
		get: function() {
			var p = Array.prototype.slice.call(arguments);
			return get.apply(null, p);
		},
		load: load,
		clearCache: clearCache,
		getid: ids.get,
		getdataCache: function(k) {
			var v = dataCache.get(k);
			v = v ? JSON.parse(v) : v;
			return v;
		},
		putdataCache: function(k, v) {
			dataCache.put(k, v)
		},
		set: object.set,
		addAuth: function(id, e) {
			if (ids.check(e)) return {
				error: "name or phonenumber exists"
			};

			var appids = apploader[id].root.object.appids();
			for (var appId in appids) {
				var appName = appManage.id2name(appId);
				var app = apploader[id][appName].object;
				if (app.addAuth && util.isFunction(app.addAuth) && !app.addAuth(e)) return {
					error: "auth error"
				};
			}

			var r = ids.put(id, e);
			if (!r) return {
				error: "auth error"
			}
		},
		removeAuth: function(id, e) {
			if (!ids.check(e)) return {
				error: "name or phonenumber not exists"
			}

			var appids = apploader[id].root.object.appids();
			for (var appId in appids) {
				var appName = appManage.id2name(appId);
				var app = apploader[id][appName].object;
				if (app.removeAuth && util.isFunction(app.removeAuth) && !app.removeAuth(e)) return {
					error: "app removeAuth error"
				}
			}

			if (!ids.remove(id, e)) return {
				error: "ids removeAuth error"
			}
		},
		check: ids.check,
		check2: check2
	},
	api: {
		check: apiproxy(ids.check),
		check2: apiproxy(check2),
		getid: apiproxy(ids.get),
		base: apiproxy(object.base),
		get: function(v) {
			var p = {};
			var _s = new Date().getTime();
			var a = Array.prototype.slice.call(arguments, 1);
			a.splice(2, 0, v);
			a.unshift(get);
			var r = stats.apply(p, a);
			return r;
		},
		set: apiproxy(set)
	}
}