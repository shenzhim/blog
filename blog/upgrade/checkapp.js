"use strict";
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var coroutine = require('coroutine');
require('utils/colors')(String);

function callback(info) {
	console.info(info);
}

function init() {
	var appid,
		appname,
		version,
		task = {};
	while (true) {
		appid = parseInt(console.readLine("请输入check appid值:"));
		if (isNaN(appid)) continue;
		appname = appManage.id2name(appid);
		if (appname) break;
	}

	var cfg = appManage.getconfig(appname),
		cversion = cfg.version;
	while (true) {
		console.info("当前appid:%s version:%s", appid, cversion);
		version = parseInt(console.readLine("请选择版本号:"));
		if (version) break;
	}

	var appcheck = apps(appname).root.base.appcheck;

	return {
		appid: appid,
		version: version,
		order: "asc",
		check: function(id) {
			return appcheck(cfg, id, callback) ? 1 : -1;
		}
	}
}

module.exports = init;