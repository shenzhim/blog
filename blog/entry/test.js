#!/bin/js

"use strict";
require('utils/colors')(String);
var fs = require("fs");
var os = require('os');
var db = require("db");
var vm = require("vm");
var process = require("process");
var coroutine = require('coroutine');
var AsciiTable = require("utils/asciitable");
var util = require("util");
var casesPath = {
	modules: "modules/",
	dbs: "dbs/",
	utils: "utils/",
	apps: "apps/",
	api: "entry/blog/test/"
}
GC();
var no = os.memoryUsage().nativeObjects.objects;

if (!Proxy.create)
	Proxy.create = function(handler) {
		return new Proxy({}, handler);
	};
var fn = {
	listCases: function(t, c) {
		function getCaseinfo(t, c) {
			var test = require(casesPath[t] + c + "/package.json").test;
			if (!test || !test.length) return;
			return {
				name: c,
				test: test
			};
		}

		var all = {};
		if (t && c) {
			var r = getCaseinfo(t, c);
			all[t] = r ? [r] : [];
		} else {
			var types = t ? [t] : util.keys(casesPath);
			types.forEach(function(t) {
				var r = [],
					list = fs.readdir(casesPath[t]);
				list.forEach(function(f) {
					if (!f.isDirectory() || [".", ".."].indexOf(f.name) > -1) return;

					var d = getCaseinfo(t, f.name);
					if (d) {
						r.push(d);
					}
				});
				all[t] = r;
			});
		}
		return all;
	},
	chooseCases: function(data, t) {
		var table = new AsciiTable(t + "-Test");
		table.setHeading(['id', '用例名称', "用例数量"]);
		for (var i = 0; i < data.length; i++) {
			var v = data[i];
			table.addRow(i, v.name, v.test.length);
		}
		console.log(table.toString());
	},
	runCases: function(cases) {
		var runtime = require("entry/getConfig")("blog", "test").runtime;
		var s = runtime.database.dbTable.connString;
		var conn = db.open(s);
		var sql = fs.readFile("dbs/dbManager/script/" + s.substr(0, s.indexOf(":")) + ".sql").split(";");
		sql.forEach(function(s) {
			if (s) conn.execute(s + ";");
		});
		var sb = new vm.SandBox(require("./config/depend.js"));
		sb.add("application", runtime);
		sb.add("apps", sb.require("apps"));
		sb.add("sb", function(modules) {
			modules = util.extend({
				db: require("db"),
				vm: require('vm'),
				path: require("path"),
				assert: require("assert"),
				coroutine: require('coroutine'),
				encoding: require("encoding"),
				hash: require("hash"),
				uuid: require("uuid"),
				util: require("util"),
				application: runtime,
				io: require('io'),
				mq: require('mq'),
				http: require('http'),
				ssl: require('ssl'),
				net: require('net'),
				websocket: require("websocket"),
				process: process,
				base64: require("base64")
			}, modules);
			return new vm.SandBox(modules || {}, function(name) {});
		});
		sb.add("client", sb.require("entry/blog/test/client.js")(sb.require("entry/blog/router").blog));
		sb.require("entry/blog/test/initapp.js");
		for (var k in cases) {
			cases[k].forEach(function(d) {
				var prefix = casesPath[k] + d.name + "/";
				d.test.forEach(function(c) {
					sb.require(prefix + c);
				});
			});
		}
		require("test").run();
		sb = undefined;
	}
}

var params = process.argv,
	t = (params[2] || "").toLowerCase(),
	c = (params[3] || "").toLowerCase();
if (t && !casesPath[t]) {
	console.error("[ERROR]支持用例类型:apps/utils/api/modules!");
	process.exit(-1);
}

var allcases = fn.listCases(t, c === "all" ? "" : c);
if (t && !c) {
	var data = allcases[t];
	if (!data.length) {
		console.error("[ERROR]类型 %s 暂时没有用例!", t);
		process.exit(-1);
	}
	fn.chooseCases(data, t);
	while (true) {
		var indexs = console.readLine("选择用例(支持all):").toLowerCase();
		if (indexs !== "all") {
			var d = [];
			var r = indexs.split(",").every(function(i) {
				var v = data[i];
				if (!v) return false;
				d.push(v);
				return true;
			});
			if (!r) continue;
			allcases[t] = d;
		}
		break;
	}

}
fn.runCases(allcases);

coroutine.sleep(200);
GC();
console.log(no, os.memoryUsage().nativeObjects.objects);