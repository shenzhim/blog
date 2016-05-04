"use strict";
var dataConfig = require('application').database;
var cacheConfig = require('application').cache;
var smsConfig = require('application').sms;
var payConfig = require("application").pay;
var withdrawConfig = require("application").withdraw;
var ubox = require("application").ubox;
var util = require("util");
var Engines = new util.LruCache(32, 0);

function proxy(o, fn) { //o访问器重载：[]或.访问时如果存在该属性则直接返回，否则调用fn返回
	return Proxy.create({
		get: function(receiver, name) {
			if (o && o[name]) return o[name];
			return fn(name);
		}
	});
}

module.exports = proxy(Engines, function(engine) {
	if (dataConfig[engine]) {
		var c = dataConfig[engine];
		return Engines.get(engine, function() {
			return require("./engine/" + c.Engine)(c.name, engine, c.connString, c.limit);
		});
	}

	if (cacheConfig[engine]) {
		var c = cacheConfig[engine];
		var ce = c.engine;
		return Engines.get(engine, function() {
			return require("./engine/" + ce.Engine)(ce.name, "cache", ce.connString, ce.limit)(c.name, c.expire);
		});
	}

	throw new Error("daManager error: " + engine + " not in datebase");
});