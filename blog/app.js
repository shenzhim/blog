"use strict";
var vm = require('vm');
var path = require("path")
var util = require('util');
var coroutine = require('coroutine');
var processroot = require("process").cwd();

var sboxs = new util.LruCache(1000, 0);
var modules = {
	http: require("http"),
	ssl: require("ssl"),
	assert: require("assert"),
	encoding: require("encoding"),
	hash: require("hash"),
	uuid: require("uuid"),
	coroutine: coroutine,
	util: util,
	fib: {
		request: function() {
			return coroutine.current().request;
		},
		userid: function() {
			return coroutine.current().userid;
		}
	}
};

function apps(appname) {
	return sboxs.get(appname, function() {
		var sb = new vm.SandBox(modules, function(name) {
			name = name.replace(processroot + '/', '');
			var mod,
				ns = name.split(path.sep);
			if (ns.length === 1 || ns.indexOf(".modules") > -1) return;
			switch (ns[0]) {
				case "apps":
					if (ns.length === 2) return;
					else {
						if (ns[1] !== appname) throw new Error("app can not require other app dir!");
						if (ns[2] === "modules") {
							mod = require(name).app;
							if (!mod) throw new Error("require apps fail name:" + name);
							return mod;
						}
						return;
					}
				case "modules":
					mod = require(name);
					if (!mod) throw new Error("require modules fail name:" + name);
					return mod.app;
				case "utils":
					mod = require(name);
					if (!mod) throw new Error("require utils fail name:" + name);
					return mod;
				default:
					return;
			}
		}, appname);
		sb.add("config", require("apps/" + appname + "/package.json"));
		return sb.require("apps/" + appname);
	});
}
module.exports = apps;