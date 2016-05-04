"use strict";
var vm = require('vm');
var path = require("path")
var coroutine = require('coroutine');
var util = require('util');
var dbapi = require("modules/dbapi");
var application = require("application");
var pending = 0;
var appManage = {};
var processroot = require("process").cwd();

function proxy(o, fn) {
	return Proxy.create({
		get: function(receiver, name) {
			if (o && o[name]) return o[name];
			return fn(name);
		}
	});
}

function apploader() {
	var p = Array.prototype.slice.call(arguments),
		LIB = this;
	return new function() {
		if (p.length === 3) {
			var type = p[0],
				appname = p[2];

			var mod = apps(appname);
			if (type === 'friends') {
				var callee = appstack().callee,
					name = callee ? callee.name : "",
					mod = mod[name];
			} else if (type === 'public') mod = mod[""];
			LIB = mod;
		} else if (p.length > 3) {
			var id = p[1],
				funcname = p[p.length - 1],
				obj = LIB[funcname];

			if (!obj) return;
			else if (util.isFunction(obj)) return obj.bind(null, Number(id));
			else LIB = obj;
		}

		if (LIB && LIB.check) this.check = LIB.check.bind(null);
		return proxy(this, function(param) {
			return apploader.apply(LIB, p.concat(param));
		});
	};
}

var appstack = function() {
	var processed = false;

	function appreferer() {
		if (processed) return;
		processed = true;

		//	at Object.on (apps/root/bind.js:194:19)
		//  at Object.<anonymous> (root:apps/base.js:6:30)
		//	at apps/user/mail.js:120:6
		var d,
			stacks = (new Error()).stack.split("\n"),
			_appname = [],
			list = [];

		for (var i = 1; i < stacks.length; i++) {
			var a = stacks[i].split(":");
			if (a.length != 4) continue;
			var appname = a[0].split("(")[1];

			if (appname === "root") {
				d = {
					id: 1,
					name: "root"
				}
			} else {
				var appid = appManage.name2id(appname);
				if (!appid) continue;
				d = {
					id: appid,
					name: appname
				}
			}

			if (d) {
				if (_appname.indexOf(appname) === -1) {
					_appname.push(appname);
					list.push(d);
				}
				this._top = d;
				if (this._callee === undefined)
					this._callee = d;
				else if (this._caller === undefined && this._callee.name !== appname)
					this._caller = d;
			}
		}
		this._list = list;
	}

	return {
		get callee() {
			appreferer.call(this);
			return this._callee;
		},
		get caller() {
			appreferer.call(this);
			return this._caller;
		},
		get top() {
			appreferer.call(this);
			return this._top;
		},
		get list() {
			appreferer.call(this);
			return this._list;
		}
	}
}

var sboxs = new util.LruCache(1000, 0),
	modules = {
		http: require("http"),
		ssl: require("ssl"),
		assert: require("assert"),
		encoding: require("encoding"),
		hash: require("hash"),
		uuid: require("uuid"),
		coroutine: require("coroutine"),
		util: util,
		trigger: function() {
			var t = {};

			t.trigger = function(ev) {
				var callee = appstack().callee,
					appname = "",
					args = arguments;

				if (callee) {
					appname = callee.name;
				} else {
					throw new Error("eventloader: Can not figure out callee!");
				}

				var mAppCfg = appManage.getconfig(appname),
					strfns = mAppCfg["EVENT"] && mAppCfg["EVENT"]["trigger"] && mAppCfg["EVENT"]["trigger"][ev] ? mAppCfg["EVENT"]["trigger"][ev] : "";
				if (strfns === "") return;

				strfns = util.isArray(strfns) ? strfns : [strfns];
				strfns.forEach(function(v) {
					var l = v.split('.'),
						lappname = l[0],
						wp = l[1],
						lAppCfg = appManage.getconfig(lappname),
						valid = lAppCfg["EVENT"] && lAppCfg["EVENT"]["on"] && lAppCfg["EVENT"]["on"][appname] && lAppCfg["EVENT"]["on"][appname][ev] ? lAppCfg["EVENT"]["on"][appname][ev] : "";
					if (valid) {
						var app = apps(lappname),
							fn = app["EVENT"][valid];
						coroutine.start(function() {
							pending++;
							if (!wp) { //默认异步工作模式省略
								var fib = coroutine.start(function() {
									fn.apply(null, Array.prototype.slice.call(args, 1));
								});
								fib.join();
							} else if (wp === "workflow") {
								//drop the fn to the workflow;
							} else if (wp === "call") {
								//call the function;
							}
							pending--;
						});
					} else throw new Error("appname:" + appname + " eventname: " + ev);
				});
			}

			return t;
		},
		fib: {
			request: function() {
				return coroutine.current().request;
			},
			userid: function() {
				return coroutine.current().userid;
			},
			baozadmin: function() {
				return coroutine.current().baozadmin;
			},
			deviceid: function() {
				return coroutine.current().deviceid;
			},
			rewarded: function() {
				return coroutine.current().rewarded;
			},
			firstcreated: function() {
				return coroutine.current().firstcreated;
			},
			sortime: function() {
				return new Date() - new Date("2011/8/30");
			},
			abTest: function() {
				return coroutine.current().abTest[appstack().callee.id];
			},
			mask: function() {
				return coroutine.current().mask;
			},
			identity: function() {
				return coroutine.current().identity;
			},
			get appstack() {
				var stack = appstack();
				return stack;
			},
			allclubs: ["~校园", "~亲子", "~八卦", "~杂谈", "~行者", "~娱乐", "~dancer", "~摄影", "~逗比", "~1024", "~运动", "~碎碎念", "~吃货", "~文青", "~游戏", "~剁手党", "~萌宠", "~虐狗", "~少女", "~其他", "~科普", "~纯爱", "~新群组", "~编辑推荐", "~健身工作室"],
			env: application.env
		},
		apploader: apploader("friends")
	};

//Load Root
function LoadRoot() {
	return sboxs.get(1, function() {
		var sb = new vm.SandBox(modules, function(name) {
			name = name.replace(processroot + '/', '');
			var ns = name.split(path.sep);
			if (ns.length === 1 || ns.indexOf(".modules") > -1) return;
			switch (ns[0]) {
				case "apps":
					if ((ns[1] === "root" || Number(ns[1]) === 1) && ns[2] === "modules")
						return require(name).app;
					return;
				case "modules":
					return require(name).app;
				case "utils":
					return require(name);
				default:
					return;
			}
		}, "root");
		sb.add("modules/dbapi", dbapi(1));
		sb.add("config", require("apps/root/package.json"));
		return sb.require("apps/root");
	});
}

appManage = LoadRoot()[""].object.getAppManage();

function apps(appname) {
	if (appname === "root")
		return LoadRoot();

	var appcfg = appManage.getconfig(appname);
	if (!appcfg) throw "app [" + appname + "] not found!";

	var appid = appcfg.id;
	return sboxs.get(appid, function() {
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
					var _fn = mod.root,
						fn = appcfg.root && _fn && !util.isEmpty(_fn) ? _fn : mod.app;
					return appid === 7 || appid === 25 ? util.extend(util.clone(fn), mod.admin) : fn;
				case "utils":
					mod = require(name);
					if (!mod) throw new Error("require utils fail name:" + name);
					return mod;
				default:
					return;
			}
		}, appname);
		sb.add("modules/dbapi", dbapi(appid));
		sb.add("application", application.apps[appname] || {});
		sb.add("config", require("apps/" + appname + "/package.json"));
		return sb.require("apps/" + appname);
	});
}

apps.apploader = apploader("public");
apps.appstack = appstack;
apps.getPending = function() {
	return pending;
}
module.exports = apps;