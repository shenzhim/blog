"use strict";
require('utils/colors')(String);
var apps = require("apps");
var apploader = apps.apploader;
var fs = require("fs");
var AsciiTable = require("utils/asciitable");
var coroutine = require('coroutine');
var util = require('util');
var appIdsManage = apploader[0].root.object.getAppIdsManage();
var perCount = 10000;

function listfile(mid, app) {
	var path,
		r = [];
	mid = Number(mid);
	if (mid !== 1 && mid !== 2) {
		console.info("[Error]模式错误!".red)
		return r;
	}
	app = app || "";
	if (mid === 1) {
		app = "";
	}
	path = "upgrade/" + (app ? app + "/" : "");
	var name,
		list = fs.readdir(path);
	list.forEach(function(f) {
		name = f.name;
		if (f.isDirectory()) {
			if (name === "." || name === ".." || name === "utils" || mid === 1) return;
			r = r.concat(listfile(mid, name));
		} else {
			if (name.indexOf(".js") === -1 || (!app && mid === 2)) return;
			name = name.replace(".js", "");
			r.push({
				name: name,
				app: app
			});
		}
	});
	return r;
}

function run(appid, callback, startId, endId, order, version) {
	var id,
		ret,
		cnt = 0,
		sid = startId,
		eid = endId,
		scriptResult = {
			"1": 0,
			"0": 0,
			"-1": 0
		};

	console.info("\n================开始执行脚本================");
	while (true) {
		var rs = appIdsManage.get(appid, version, perCount, [sid, eid], order);
		rs.forEach(function(m) {
			id = m.id;
			ret = callback(id);

			if (ret === -1) console.info("failure_id: ", id);
			if (!(cnt++ % 500)) console.info("Excuting script ,current id: %d, run count: %d", id, cnt);
			scriptResult[ret]++;

			if (order === "desc")
				eid = id;
			else
				sid = id;
		});

		if (rs.length !== perCount) {
			break;
		}
	}

	console.info("\n================脚本执行结果================");
	console.info("成功：", scriptResult["1"]);
	console.info("失败：", scriptResult["-1"]);
	console.info("未处理：", scriptResult["0"]);
}

function CLI() {
	var scriptnames, //记录每个模式下所有脚本
		currentMode, //记录当前模式
		currentScript, //当前脚本信息
		exportsData, //记录初始化加载过的数据
		task = [],
		modes = {
			"0": "mode",
			"1": "system",
			"2": "common"
		};

	this.run = function() {
		currentMode = "0";
		scriptnames = {};
		currentScript = {};
		nextTask(choose_mode);
		while (task.length) {
			task[0]();
		}
	}

	function nextTask(fn) {
		task[0] = fn;
	}

	function getInput() {
		return console.readLine("[" + (!util.isEmpty(currentScript) ? currentScript.app + "/" + currentScript.name : modes[currentMode]) + "]> ").toLowerCase();
	}

	function info(str) {
		console.info("[%s]> %s", (!util.isEmpty(currentScript) ? currentScript.app + "/" + currentScript.name : modes[currentMode]), str);
	}

	function choose_mode() {
		console.info("进入[%s]模式!", modes[currentMode].red);
		nextTask(choose_script);

		while (true) {
			for (var k in modes)
				if (k !== "0") console.info("%s. %s模式", k, modes[k]);

			var mid = Number(getInput("mode"));
			if (mid && modes[mid]) return currentMode = mid;
		}
	}

	function choose_script() {
		console.info("进入[%s]模式!", modes[currentMode].red);
		nextTask(scriptAction);

		function getScriptInfo() {
			var scriptInfos = scriptnames[currentMode] || {};
			if (util.isEmpty(scriptInfos)) {
				var lists = listfile(currentMode),
					table = new AsciiTable(modes[currentMode]);
				table.setHeading(['id', 'app', 'scriptname']);
				for (var i = 0; i < lists.length; i++) {
					var d = lists[i];
					table.addRow(i, d.app, d.name);
				}
				scriptInfos["lists"] = lists;
				scriptInfos["table"] = table.toString();
				scriptnames[currentMode] = scriptInfos;
			}
			return scriptInfos;
		}

		var scriptInfos = getScriptInfo(currentMode);
		if (!scriptInfos.lists.length) {
			info("暂无任何脚本!");
			return nextTask(choose_mode);
		}

		while (true) {
			console.info(scriptInfos.table);
			var script,
				input = getInput();
			if (input === "back") return nextTask(back);

			script = scriptInfos.lists[Number(input)];
			if (script) return currentScript = script;
		}
	}

	function back() {
		if (!util.isEmpty(currentScript)) {
			currentScript = {};
			exportsData = undefined;
			return nextTask(choose_script);
		} else {
			currentMode = "0";
			exportsData = undefined;
			return nextTask(choose_mode);
		}
	}

	function scriptAction() {
		var sname = currentScript.name,
			sapp = currentScript.app;
		console.info("进入[%s]脚本!", sname.red);
		nextTask(choose_script);

		info("\n1. run  执行脚本\n2. init 只对系统脚本有效\n3. back 返回上级");
		while (true) {
			var input = getInput();
			if (input === "back") return nextTask(back);
			if (input === "run") break;
			if (input === "init") {
				exportsData = undefined;
				break;
			}
		}

		if (!exportsData) {
			exportsData = currentMode == "1" ? require("upgrade/" + sname)() : apps(sapp).root.base.require(sname);
			if (!exportsData) return nextTask(back);
		}

		var appid = Number(exportsData.appid),
			update = exportsData.update,
			check = exportsData.check,
			order = (exportsData.order || "").toLowerCase(),
			version = Number(exportsData.version || 0),
			fns = [];

		if (order && order != "desc" && order != "asc") return info("脚本查询order非法!");

		if (!version) return info("必须按照version查询!");

		if (update) {
			if (!util.isFunction(update)) return info("脚本至update类型错误!");
			fns.push("update");
		}

		if (check) {
			if (!util.isFunction(check)) return info("脚本至check类型错误!");
			fns.push("check");
		}

		fns.push("count");
		console.info("当前环境: appid[%s] version[%s]!".green, appid, version);
		var cmd,
			startId,
			endId,
			params;
		while (true) {
			info("\n支持以下方法:(方法名 开始id 结束id)");
			for (var i = 0; i < fns.length; i++) console.info("%s.%s", i, fns[i]);

			var input = getInput();
			if (input === "back") return nextTask(back);

			params = input.split(" ");
			cmd = params[0];
			if (!cmd || fns.indexOf(cmd) === -1) continue;

			startId = Number(params[1] || 0);
			endId = Number(params[2] || 0);
			if (isNaN(startId) || isNaN(endId) || endId > 0 && (startId > endId)) continue;
			break;
		}

		switch (cmd) {
			case "update":
				run(appid, update, startId, endId, order, version);
				coroutine.sleep(3000);
			case "check":
				if (check) run(appid, check, startId, endId, order, version);
				break;
			case "count":
				console.info("\napp:%s 记录数：", appid, appIdsManage.count(appid, version));
				break;
		}
		return nextTask(scriptAction);
	}
}

module.exports = function() {
	var cli = new CLI();
	cli.run();
}