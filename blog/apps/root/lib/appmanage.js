"use strict";

var dbapi = require("modules/dbapi");
var util = require("util");
var idsNamesLRU = new util.LruCache(1000, 6 * 60 * 60 * 1000);
var configLRU = new util.LruCache(1000, 6 * 60 * 60 * 1000);
var encoding = require("encoding");
var fib = require("fib");

function getCallerid() {
	var caller = fib.appstack.caller,
		callerid = caller.id;
	if (!callerid) throw new Error("getCallerid callerid is null");
	return callerid;
}

var appManage = {
	checkconfig: function(appname, config) {
		if (!appname || !/^[a-z]+$/.test(appname)) return {
			error: "appname error"
		};

		if (!util.isObject(config) || util.isArray(config)) return {
			error: "config is not object"
		};

		var r,
			errorinfo,
			depends = config.depends,
			roots = config.roots;

		//check base
		if (!config.main || config.main !== "index.js") return {
			error: "main is error"
		};

		if (!Number(config.version)) return {
			error: "version is error"
		};

		r = ["depends", "friends", "install"].every(function(n) {
			var v = config[n];
			if (!v) return false;
			if (v && (!v.length || !util.isArray(v))) {
				errorinfo = {
					error: n + " is error"
				};
				return false;
			}
			return v.every(function(m) {
				var cfg = appManage.getconfig(m);
				if (util.isEmpty(cfg)) {
					errorinfo = {
						error: n + " app " + m + " is not exist"
					};
					return false;
				}
				return true;
			});
		});
		if (!r) return errorinfo;

		//check roots
		var _root = false;
		if (roots) {
			if (!util.isArray(roots) || !roots.length)
				return {
					error: "roots is error"
				};

			if (roots.indexOf("object") > -1) {
				if (roots.length > 1)
					return {
						error: "roots length > 1"
					};

				if (!depends || util.difference(["root", "bind", "link"], depends).length)
					return {
						error: "rootapp must have app [root,bind,link]"
					};

				_root = true;
			} else {
				r = roots.every(function(m) {
					var cfg = appManage.getconfig(m);
					if (util.isEmpty(cfg)) {
						errorinfo = {
							error: "roots [" + m + "] app is not exist!"
						};
						return false;
					}

					if (cfg.root !== true) {
						errorinfo = {
							error: "roots [" + m + "] app is not rootapp!"
						};
						return false;
					}
					return true;
				});
				if (!r) return errorinfo;
			}
		}

		//check depends
		if (depends) {
			if (_root) roots = [appname]; //复杂:rootapp的根也是自己,下面递归判断用到
			r = depends.every(function(m) {
				var cfg = appManage.getconfig(m);
				if (cfg.root) {
					errorinfo = {
						error: "depends [" + m + "] app is rootapp!"
					};
					return false;
				}

				if (!cfg.roots || !roots) return true;

				//depends内的app的根app必须和自己的根app有交集
				if (!util.intersection(cfg.roots, roots).length) {
					errorinfo = {
						error: "depends [" + m + "] rootapp is difference!"
					};
					return false;
				};
			});
			if (!r) return errorinfo;
		}
	},
	name2id: function(appname) {
		if (!appname || !util.isString(appname)) return;

		return idsNamesLRU.get("name2id_" + appname, function() {
			var rs = dbapi[0].app.tags(appname);
			if (rs.length === 1) return Number(rs[0].bindid);
		});
	},
	id2name: function(appid) {
		appid = Number(appid);
		if (isNaN(appid)) return;

		return idsNamesLRU.get("id2name_" + appid, function() {
			var rs = dbapi[0].app.list(appid);
			if (rs.length === 1) return rs[0].tag;
		});
	},
	check: function(appname) {
		if (!appname) return false;
		var appid = Number(appname);
		if (isNaN(appid))
			return appManage.name2id(appname) !== undefined;
		else
			return appManage.id2name(appid) !== undefined;
	},
	getconfig: function(appname) {
		var appid = Number(appname);
		if (!isNaN(appid))
			appname = appManage.id2name(appid);
		else
			appid = appManage.name2id(appname);

		if (!appname || !appid) return;

		return configLRU.get("config_" + appname, function() {
			var cfg = require("apps/" + appname + "/package.json");

			return util.extend({
				id: appid,
				name: appname,
				root: cfg.roots && cfg.roots.indexOf("object") !== -1
			}, cfg);
		});
	},
	getdependapps: function(appname) {
		var v = configLRU.get("depends_" + appname, function() {
			var v = [];
			if (appManage.getconfig(appname).root) {
				function finddepends(app) {
					if (v.indexOf(app) > -1) return;
					if (app !== appname) v.push(app);
					var _cfg = appManage.getconfig(app);
					if (_cfg.depends)
						_cfg.depends.forEach(finddepends);
				}
				finddepends(appname);
			}
			return v;
		});
		return !v ? v : v.slice();
	},
	getoptionalapps: function(appname) {
		var v = configLRU["optionals"];
		if (v === undefined) {
			v = {};
			var ownall = [];
			dbapi[0].app.all().forEach(function(o) {
				var _appname = o.tag;
				var _cfg = appManage.getconfig(_appname);
				if (_cfg.root) {
					if (!v[_appname]) v[_appname] = [];
					return;
				}

				var _roots = _cfg.roots;
				if (!_roots) {
					ownall.push(_appname);
					return;
				}
				_roots.forEach(function(app) {
					var ops = v[app];
					if (ops && ops.indexOf(_appname) === -1)
						v[app].push(_appname);
					else
						v[app] = [_appname];
				});
			});

			for (var k in v) {
				var ops = ownall.length ? v[k].concat(ownall) : v[k];
				v[k] = util.difference(ops, appManage.getdependapps(k));
			}
			configLRU["optionals"] = v;
		}
		return (v[appname] || []).slice();
	},
	listApp: function() {
		return dbapi[0].app.all().map(function(o) {
			return {
				appid: o.bindid,
				appname: o.tag
			}
		});
	},
	nextAppid: function() {
		return Number(dbapi[0].app.get("sorts")) + 1;
	},
	addApp: function(appname) {
		if (!appname || appManage.check(appname)) return {
			error: "app is Exist"
		};
		var config;
		try {
			config = require("apps/" + appname + "/package.json");
		} catch (e) {
			return {
				error: "app config is not exist!"
			};
		}
		var r = appManage.checkconfig(appname, config);
		if (r) return r;

		var tb = dbapi[0].app;
		return tb.put({
			bindid: Number(dbapi[0].app.get("sorts")) + 1,
			tag: appname
		}) > 0;
	},
	addTag: function(k, v) {
		return dbapi[0][getCallerid()].getObject(k).save(v);
	},
	getTag: function(k) {
		return dbapi[0][getCallerid()].getJSON(k);
	}
}

module.exports = appManage;