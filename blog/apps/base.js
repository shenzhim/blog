"use strict";

var util = require('util');
var fib = require("fib");
var apploader = require("apploader");
var dbapi = require("modules/dbapi");
var currentapp = fib.appstack.callee.name;
var currentconfig = require("config");
var form = require("utils/form");

var appClass = {
	init: function(id) {},
	proxyInstall: function(id, appname, e) {
		return apploader[id].root.install(appname, e);
	},
	requireinapp: function(script) {
		if (!script) throw new Error("require scriptname is undefined");
		return require("upgrade/" + (currentapp) + "/" + script);
	},
	requireinutils: function(script) {
		if (!script) throw new Error("require scriptname is undefined");
		return require("upgrade/utils/" + script);
	}
};

var fieldsFn = {
	string: function(v) {
		return util.isString(v);
	},
	number: function(v) {
		return util.isNumber(v);
	},
	array: function(v) {
		return util.isArray(v);
	},
	icon: function(v) {
		var pickey = ["x", "y", "size", "source"];
		if (!util.isObject(v) || pickey.length !== util.keys(v).length) return false;

		return pickey.every(function(k) {
			return !util.isUndefined(v[k]);
		});
	},
	json: function(v) {
		return util.isObject(v) && !util.isArray(v) && !util.isFunction(v);
	},
	attachment: function(v) {
		if (!util.isArray(v) || !v.length) return false;

		var bkey = ["height", "width", "source", "type"],
			len = bkey.length;

		return v.every(function(d) {
			return util.isString(d) && d.length === 32;
		});
	},
	password: function(v) {
		return util.isString(v) && v.length === 32;
	},
	numberOrArray: function(v) {
		return util.isNumber(v) || util.isArray(v);
	},
	level: function(v) {
		return ["admin", "deputy", ""].indexOf(v) !== -1;
	},
	entry: function(v) {
		var _entry = currentconfig.entry;
		if (!util.isObject(v) || !_entry) return false;

		for (var k in v) {
			var _v = _entry[k];
			if (!_v || _v.icon && _v.icon.length !== 32) return false;
		}
		return true;
	},
	phone: function(v) {
		return new RegExp(form.rePhone, "i").test(v);
	}
}

var propertysFn = {
	checkbind: function(data, v) {
		if (v === "bind" && !apploader[data.bindid].bind.checkbind(data.id)) return false;

		return apploader[data.bindid].link.checkbind(data.id, data.list, data.tag);
	},
	checkapps: function(data) {
		var appManage = apploader[0].root.getAppManage();
		var rootname = appManage.id2name(Number(data.root)),
			dependapps = appManage.getdependapps(rootname),
			appkeys = util.keys(data.apps).map(function(k) {
				return appManage.id2name(k);
			});
		dependapps.push(rootname);
		if (util.difference(dependapps, appkeys).length) return false;

		return !util.difference(util.difference(appkeys, dependapps), appManage.getoptionalapps(rootname)).length;
	}
}

function appcheck(appconfig, id, callback, p) {
	if (!util.isObject(appconfig) || isNaN(Number(id)) || (p && !util.isArray(p))) throw new Error("config or id or p is error!");

	var errorCount = 0;
	return errorCount ? false : true;
}

function _getEntry(p, id, userid) {
	var myroles = apploader[id].bind.allRoles(userid, true);
	var d = {},
		entry = currentconfig[p];
	if (!entry) return d;

	for (var k in entry) {
		var v = entry[k],
			role = v.role;
		if (!util.isArray(role) || !role.length) continue;
		role.some(function(_role) {
			if (myroles.indexOf(_role) !== -1) {
				d[k] = {
					name: v.name,
					icon: v.icon
				};
				return true;
			}
		});
	}
	return d;
}

module.exports = {
	init: appClass.init,
	Entry: function(id) {
		var entry = currentconfig.entry;
		if (!entry) return;

		var d = {};
		var obj = dbapi[id].getObject(),
			_entry = obj.entry || {};

		for (var k in entry) {
			d[k] = {
				setted: _entry[k] || {},
				raw: {
					name: entry[k].name,
					icon: entry[k].icon
				}
			};
		}
		return d;
	},
	AdminEntry: function() {
		return currentconfig.adminentry;
	},
	powerview: function() {
		return currentconfig.powerview ? currentconfig.powerview : {};
	},
	saveEntry: function(id, e) {
		if (!e || !util.isObject(e) || util.isEmpty(e)) return false;

		var entry = currentconfig.entry;
		if (!entry) return false;

		var v,
			name,
			icon,
			flag = false,
			obj = dbapi[id].getObject(),
			_entry = obj.entry || {};
		for (var k in e) {
			if (k === "home") continue;
			v = e[k];
			name = v.name;
			icon = v.icon;

			if (!entry[k] || (!name && !icon) || (icon && icon.length !== 32)) return false;

			_entry[k] = _entry[k] || {};

			if (name && name === entry[k].name) {
				delete _entry[k].name;
			} else {
				_entry[k].name = name;
			}

			if (icon && icon === entry[k].icon) {
				delete _entry[k].icon;
			} else {
				_entry[k].icon = icon;
			}
		}
		return obj.save({
			entry: _entry
		});;
	},
	getEntry: _getEntry.bind(null, "entry"),
	getAdminEntry: _getEntry.bind(null, "adminentry"),
	private: {
		require: appClass.requireinapp,
		requireinutils: appClass.requireinutils,
		proxyInstall: appClass.proxyInstall,
		config: currentconfig,
		clearCache: function(id, type) {
			require("modules/object").clearCache(id, type); // 仅用于通过反射清理cache
		},
		getappid: function() {
			return currentapp;
		},
		appcheck: appcheck
	},
	expire: function(id, t, type) {
		type = type.split("_")[0];
		var types = currentconfig["types"];
		if (!types || types[type] === undefined) return;
		var _d = types[type];
		if (util.isNumber(_d)) return _d > 0 ? _d * 1000 : 0;

		if (_d[t] === undefined) throw new Error("expire time is undefined");
		return _d[t] > 0 ? _d[t] * 1000 : 0;
	}
}