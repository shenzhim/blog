"use strict";

var fib = require("fib");
var appIdsManage = exports.appIdsManage = require("../modules/appIds");
var appManage = require("./appmanage");
var base = exports.base = require("apps/base");
var util = require('util');
var dbapi = require("modules/dbapi");
var coroutine = require("coroutine");
var apploader = require("apploader");

var isinstall = exports.isinstall = function(id, appname) {
	var appid = appManage.name2id(appname);
	var c = dbapi[id].getJSON();
	if (util.isEmpty(c)) return false;
	return !!c["apps"][appid];
}

var init = function(id, rootAppName, d) {
	if (isinstall(id, "root"))
		return false;

	var cfg = appManage.getconfig("root");
	if (!appIdsManage.put(cfg.id, cfg.version, id))
		return false;

	var appid = appManage.name2id(rootAppName);

	var c = dbapi[id].createObject();
	c["root"] = appid;
	c["names"] = d;
	c["apps"] = {
		"1": 1
	};
	return c.save();
}

var _install = function(id, appname, e, fromid, fromapp) {
	var appnames = getDependapps(appname, e || {});

	appnames = preInstall(id, appnames);

	var nowinstall = [];
	coroutine.parallel(appnames, function(appname) {
		if (!apploader[id][appname].init(e, fromid, fromapp))
			throw new Error("app init fail:" + appname);

		nowinstall.push(appname);
	});
	return finishInstall(id, nowinstall);
}

var preInstall = function(id, appnames) {
	var noinstalled = [],
		c = dbapi[id].getObject(),
		apps = c["apps"];
	if (c["root"] == null) throw new Error("preInstall has't root app:" + id);
	if (!util.isObject(apps)) throw new Error("preInstall has't apps:" + id);

	appnames.forEach(function(appname) {
		var _appid = appManage.name2id(appname);
		if (apps[_appid] !== undefined) return;
		apps[_appid] = 0;
		noinstalled.push(appname);
	});
	c.save();
	return noinstalled;
}

var finishInstall = function(id, appnames) {
	var c = dbapi[id].getObject(),
		apps = c["apps"];
	if (c["root"] == null) throw new Error("finishInstall has't root app:" + id);
	if (!util.isObject(apps)) throw new Error("finishInstall has't apps:" + id);

	coroutine.parallel(appnames, function(appname) {
		var cfg = appManage.getconfig(appname),
			_appid = cfg.id;
		if (apps[_appid] !== 0) throw new Error("finishInstall appids is install:" + id + " appid:" + _appid);;

		apps[_appid] = 1;
		if (!appIdsManage.put(_appid, cfg.version, id)) throw new Error("finishInstall put appids fail:" + id + " appid:" + _appid);
	});
	return c.save();
}

var getDependapps = function(appname, e) {
	var r = [],
		appnames = util.isArray(appname) ? appname : [appname];
	appnames.forEach(function(appname) {
		var c = appManage.getdependapps(appname);
		c.unshift(appname);
		if (appname == "general") {
			var generalConfig = appManage.getconfig(appname);
			if (generalConfig.appTemplate && generalConfig.appTemplate[e["appTemplate"]]) {
				r = r.concat(generalConfig.appTemplate[e["appTemplate"]]);
			}
		}
		r = util.union(c, r);
	});
	return r;
}

exports.rootapp = function(id) {
	var c = dbapi[id].getJSON();
	if (util.isEmpty(c))
		return;
	return appManage.id2name(c["root"]);
}

exports.rename = function(id, newname) {
	var c = dbapi[id].getObject();
	if (c["names"])
		c["names"]["name"] = newname;
	c.save();
}

exports.addAuth = function(id, e) {
	var obj = dbapi[id].getObject();
	var names = obj.names;
	if (!util.isObject(names)) return false;

	if (e["name"] && !obj["name"]) names["name"] = e["name"];
	if (e["phone"] && !obj["phone"]) names["phone"] = e["phone"];

	names["openid"] = e["openid"];

	obj.names = names;
	return obj.save();
}

exports.removeAuth = function(id, e) {
	var obj = dbapi[id].getObject();
	var names = obj.names;
	if (!util.isObject(names)) return false;
	if (e["phone"] && names["phone"]) {
		delete names["phone"];
		obj.save({
			names: names
		});
	}
	return true;
}

var appids = exports.appids = function(id) {
	var c = dbapi[id].getJSON();
	return c["apps"];
}

exports.checkAppInstalled = function(id, container) {
	if (!id || !container) return;
	return appids(id)[appManage.name2id(container)];
}

exports.getPower = function(id, type) {
	return true;
}

exports.get = function(id, type) {
	switch (type || "") {
		case "app":
			var appArr = appids(id);
			var reData = {
				install: [],
				noinstall: []
			};
			for (var appid in appArr) {
				var name = appManage.id2name(appid);
				reData.install.push({
					id: appid,
					name: name
				});
			}
			return reData;
		default:
			return undefined
	}
}

exports.getIds = function() {}

exports.fill = function(id, type, d, ds) {
	return d;
}

var check = exports.check = function(appname, e, callername) {
	// 参数属性设置只读
	for (var k in e) {
		Object.defineProperty(e, k, {
			writable: false
		});
	}

	var appnames = getDependapps(appname, e);

	for (var i in appnames) {
		var appname = appnames[i];
		var appcfg = appManage.getconfig(appname);
		if (!!appcfg.install && appcfg.install.indexOf(callername) === -1)
			throw new Error("appname install appstack error: appname:" + appname + " caller:" + callername);

		var check = apploader[-1][appname].check;
		if (check && util.isFunction(check)) {
			var r = check(e);
			if (r) return r;
		}
	}
}

exports.create = function(id, fromid, rootAppName, e, d, fromapp, installs) {
	init(id, rootAppName, d);
	var r = _install(id, rootAppName, e, fromid, fromapp);
	if (!r) return false;

	for (var appname in installs) {
		r = _install(id, appname, installs[appname] || {});
		if (!r) return false;
	}
	return true;
}

exports.install = function(id, appname, e, fromid, fromapp) {
	var caller = fib.appstack.caller;
	if (!caller) return false;

	var r = check(appname, e, caller.name);
	if (r) {
		console.error("install check is error: %j", r);
		return false;
	}
	return _install(id, appname, e, fromid, fromapp);
}

exports.getAppIdsManage = function(id) {
	return appIdsManage;
}

exports.getAppManage = function(id) {
	return appManage;
}