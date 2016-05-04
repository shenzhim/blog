#!/bin/js

"use strict";

require('utils/colors')(String);
var vm = require("vm")
var process = require('process');
var db = require('db');
var fs = require("fs");
var util = require("util");

var params = process.argv;
if (params.length < 3) {
	console.error("params error");
	process.exit(-1);
}

if (!Proxy.create)
	Proxy.create = function(handler) {
		return new Proxy({}, handler);
	};
var config = require("entry/getConfig")(params[2], params[3]);

var sb = new vm.SandBox(util.extend(require("entry/config/depend.js"), {
	application: config.runtime
}));

sb.add("client", sb.require("entry/blog/test/client.js")(sb.require("entry/" + params[2] + "/router").blog));

console.log("[INFO]init...".green);
var s = config.runtime.database.dbTable.connString;
console.log("[INFO]数据库:[%s],可能会被覆盖确认 Y/N? ".green, s);
if (console.readLine().toLowerCase() !== "y") process.exit(-1);
var conn = db.open(s);
var sql = fs.readFile("dbs/dbManager/script/" + s.substr(0, s.indexOf(":")) + ".sql").split(";");
sql.forEach(function(s) {
	if (s) conn.execute(s + ";");
});

sb.require("entry/blog/test/init.js");
console.log("[INFO]初始化完成, 如果没有错误, 请运行Service服务".green);