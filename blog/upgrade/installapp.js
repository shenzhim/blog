"use strict";
require('utils/colors')(String);
var object = require("modules/object");
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();

function isRootApp(appid) {
	var appcfg = appManage.getconfig(appid);
	return appcfg && appcfg.root
}

function isAllowInstall(appid, appname) {
	var appcfg = appManage.getconfig(appid),
		roots = appcfg.roots;
	return !roots || roots.indexOf(appname) !== -1;
}

function init() {
	var rootapp,
		appid,
		installappid,
		installapp;

	while (true) {
		appid = parseInt(console.readLine("需要安装到哪个容器(appid):"));
		if (!isNaN(appid) && isRootApp(appid)) break;
		console.info(("容器appid:" + appid + "  is not root app!").red);
	}
	rootapp = appManage.id2name(appid);

	while (true) {
		installappid = parseInt(console.readLine("需要安装哪个插件(appid):"));
		if (isRootApp(installappid)) {
			console.info(("插件appid:" + installappid + " is root app!").red);
			continue;
		}

		if (isNaN(installappid) || !isAllowInstall(installappid, rootapp)) {
			console.info(("appid:" + appid + " can not allow " + installappid + " install!").red);
			continue;
		}
		break;
	}
	installapp = appManage.id2name(installappid);

	var proxyInstall = apps(rootapp).root.base.proxyInstall;
	var appcheck = apps(installapp).root.base.appcheck;
	var config = appManage.getconfig(installapp);
	var callback = function(info) {
		console.info(info);
	}

	return {
		appid: appid,
		order: "asc",
		version: appManage.getconfig(rootapp).version,
		update: function(id) {
			return proxyInstall(id, installapp) ? 1 : -1;
		},
		check: function(id) {
			if (!object.app.isinstall(id, installapp)) return -1;
			return appcheck(config, id, callback) ? 1 : -1;
		}
	}
}

module.exports = init;