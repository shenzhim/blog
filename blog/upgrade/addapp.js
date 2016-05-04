"use strict";
require('utils/colors')(String);
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var AsciiTable = require("utils/asciitable");
var coroutine = require('coroutine');

function listApp() {
	var allapp = appManage.listApp(),
		table = new AsciiTable("APP LIST");

	table.setHeading(['appid', 'appname']);
	for (var k in allapp) {
		var v = allapp[k];
		table.addRow(v.appid, v.appname);
	}
	return table.toString();
}

function check(appname) {
	if (!/^[a-z]+$/.test(appname)) {
		console.info("[Error]起个英文名字吧!".red);
		return false;
	}

	if (appname.length < 1 || appname.length > 20) {
		console.info("[Error]英文名长度需要在1-20啦!".red);
		return false;
	}

	if (appManage.check(appname)) {
		console.info("[Error]名字好像被人用啦!".red);
		return false;
	}

	return true;
}

function init() {
	var appname;
	console.info(listApp() + "\n[Info]此脚本用于新APP注册到app管理器内!".red);
	while (true) {
		appname = console.readLine("[Step1]给app起个名吧:").toLowerCase();
		if (check(appname)) break;
	}

	var nextappid = appManage.nextAppid();
	var ok = console.readLine("[Step2]appid:" + nextappid + " appname:" + appname + " 确认注册 Y/N ?").toLowerCase();
	if (ok !== "y") return;

	var r = appManage.addApp(appname);

	if (r !== true) {
		console.info(r);
		console.info("[Error]%s,请检查app的配置,路径:apps/%s/package.json".red, r.error, appname);
		return;
	} else {
		console.info("[Step3]注册到app管理器成功!");
	}
	console.info(listApp());
	console.info("[Step4]可以去给容器安装插件啦!");
	coroutine.sleep(3000);
	return;
}

module.exports = init;