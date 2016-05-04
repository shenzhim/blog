"use strict";
require('utils/colors')(String);
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var fs = require("fs");
var AsciiTable = require("utils/asciitable");
var util = require('util');

function init() {
	var list = fs.readdir("upgrade/utils");
	if (!list.length) {
		console.info("[error]utils暂时无脚本!".red);
		return;
	}
	var scripts = [],
		index = 0,
		table = new AsciiTable("utils");

	table.setHeading(['id', 'scriptname']);
	list.forEach(function(s) {
		var name = s.name;
		if (name === "." || name === "..") return;
		table.addRow(index, name.replace(".js", ""));
		scripts.push(name);
		index++;
	});

	var useScript;
	while (true) {
		console.info(table.toString());
		useScript = scripts[Number(console.readLine("请选择脚本:").toLowerCase())];
		if (useScript) break;
	}

	var useApp,
		appid;
	while (true) {
		appid = Number(console.readLine("请选择appid:").toLowerCase());
		if (!isNaN(appid) && (useApp = appManage.id2name(appid))) break;
	}

	console.info("[info]执行 app:[%s] 沙箱调用脚本:[%s]".red, useApp, useScript);

	var task = apps(useApp).root.base.requireinutils(useScript);
	var appids = task.appids;
	if (!appids || !util.isArray(appids) || !appids.length)
		throw new Error("脚本:" + useScript + " 参数错误,检查吧!");

	if (appids.indexOf("all") === -1 && appids.indexOf(appid) === -1)
		throw new Error("脚本:" + useScript + " 只允许执行以下app:" + appids);

	task.appid = appid;
	return task;
}

module.exports = init;