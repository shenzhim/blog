#!/bin/js

"use strict";

var vm = require("vm")
var util = require('util');
var process = require('process');
require('utils/colors')(String);

var params = process.argv;
if (params.length < 4) {
	console.error("params error");
	process.exit(-1);
}

if (!Proxy.create)
	Proxy.create = function(handler) {
		return new Proxy({}, handler);
	};

var config = require("entry/getConfig")(params[2], params[3]);
config.runtime.modules.record.environment = "upgrade";

var sb = new vm.SandBox(util.extend(require("entry/config/depend.js"), {
	application: config.runtime
}));

sb.require("./appupgrade")();