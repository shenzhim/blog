"use strict";
require('utils/colors')(String);
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();

function init() {
	var appid,
		appname,
		types;
	while (true) {
		appid = parseInt(console.readLine("请输入需要清理的appid:"));
		appname = appManage.id2name(appid);
		if (appname) break;
	}

	while (true) {
		types = console.readLine("请输入需要清理的type(逗号隔开):");
		types = types.split(",");
		if (types.length) break;
	}

	var callback = apps(appname).root.base.clearCache;
	return {
		appid: appid,
		order: "asc",
		version: appManage.getconfig(appid).version,
		update: function(id) {
			callback(id, types);
			return 1;
		}
	}
}

module.exports = init;