"use strict";
require("test").setup();

var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var appIdsManage = apploader[0].root.object.getAppIdsManage();
var util = require('util');
var client = require('client');

describe("appManage", function() {
	var ids,
		put,
		get,
		count,
		update,
		remove,
		allApp;
	before(function() {
		ids = [];
		put = appIdsManage.put;
		get = appIdsManage.get;
		count = appIdsManage.count;
		update = appIdsManage.update;
		remove = appIdsManage.remove;
		allApp = appManage.listApp();
	});

	after(function() {
		var c = new client();
		c.clearappIds(ids);
	});

	describe("所有app配置check", function() {
		it("check config", function() {
			allApp.forEach(function(o) {
				var appname = o.appname;
				var r = appManage.checkconfig(appname, require("apps/" + appname + "/package.json"));
				assert.equal(r, undefined);
			});
		});

		it("入口检测", function() {
			allApp.forEach(function(o) {
				var appname = o.appname,
					config = apps(appname).root.base.config,
					entry = config.entry,
					adminentry = config.adminentry;
				[entry, adminentry].forEach(function(_entry) {
					if (_entry) {
						assert.ok(util.isObject(_entry));
						for (var k in _entry) {
							var v = _entry[k];
							assert.ok(util.isObject(v));
							assert.ok(!util.isEmpty(v));
							var keys = ["name", "icon", "role", "type"];
							for (var _k in v) {
								assert.ok(keys.indexOf(_k) !== -1);
							}
							if (v["name"]) assert.ok(util.isString(v["name"]));
							if (v["icon"]) {
								assert.ok(util.isString(v["icon"]));
								assert.ok(v["icon"].length === 32);
							}

							if (v["role"]) assert.ok(util.isArray(v["role"]));
						}
					}
				});

				if (entry && adminentry) {
					assert.equal(util.keys(util.extend({}, entry, adminentry)).length, (util.keys(entry).length + util.keys(config.adminentry).length));
				}
			});
		});
	});

	describe("appIds的操作测试", function() {
		it("put", function() {
			var d = [
				[0, 1, 2, true],
				["0", 1, 2, false],
				[0, "1", 2, false],
				[0, 1, "2", false]
			];

			d.forEach(function(n) {
				var r = n.pop();
				if (r) {
					assert.ok(put.apply(null, n));
				} else {
					assert.throws(function() {
						put.apply(null, n)
					});
				}
			});

			ids.push(2);
		});

		it("get", function() {
			//error
			assert.throws(function() {
				get.apply(null, ["1", 1]);
			});

			assert.throws(function() {
				get.apply(null, [1, 0]);
			});

			//true
			assert.ok(put.apply(null, [1, 2, 3]));
			ids.push(3);
			var rs = get(1, 2);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].id, 3);
		});

		it("count", function() {
			//error
			assert.throws(function() {
				count.apply(null, ["1", 1]);
			});

			assert.throws(function() {
				count.apply(null, [1, 0]);
			});

			//true
			for (var i = 1; i <= 5; i++) {
				assert.ok(put.apply(null, [2, 1, i]));
				ids.push(i);
			}
			assert.equal(count(2, 1), 5);

			assert.equal(count(2, 1, 1), 1);
		});

		it("update", function() {
			assert.ok(put.apply(null, [3, 99, 1]));
			ids.push(1);
			assert.equal(count(3, 99, 1), 1);

			assert.ok(update.apply(null, [3, 99, 1, 100]));
			assert.equal(count(3, 99, 1), 0);
			assert.equal(count(3, 100, 1), 1);
		});

		it("remove", function() {
			assert.ok(put.apply(null, [4, 99, 1]));
			assert.equal(count(4, 99, 1), 1);
			assert.ok(remove(4, 99, 1));
		});
	});

	describe("app配置的操作测试", function() {
		it("id2name", function() {
			allApp.forEach(function(o) {
				assert.equal(o.appname, appManage.id2name(o.appid));
			});
		});

		it("name2id", function() {
			allApp.forEach(function(o) {
				assert.equal(o.appid, appManage.name2id(o.appname));
			});
		});

		it("getconfig", function() {
			var getconfig = appManage.getconfig;
			var check_depends = {
				message: ["root"],
				user: ["root"],
			}
			var check_optionals = {
				message: [],
				user: ["blog"]
			}

			allApp.forEach(function(o) {
				var appname = o.appname;
				var appcfg = getconfig(appname),
					depends = appManage.getdependapps(appname),
					optionals = appManage.getoptionalapps(appname),
					roots = appcfg.roots;
				assert.deepEqual(check_depends[appname] || [], depends);
				assert.deepEqual(check_optionals[appname] || [], optionals);
				if (appcfg.root) {
					assert.ok(util.isArray(roots) && roots.length === 1 && roots[0] === "object");
					assert.ok(util.isArray(depends));
					assert.ok(depends.indexOf("root") !== -1);
					assert.ok(util.isArray(optionals));
				} else {
					if (roots) assert.ok(util.isArray(roots) && roots.indexOf("object") === -1);
					assert.ok(util.isArray(depends) && depends.length === 0);
					assert.ok(util.isArray(optionals) && optionals.length === 0);
				}
				assert.equal(appcfg.id, appManage.name2id(appname));
			});
		});

		xit("checkconfig 单元测试", function() {
			var r,
				checkconfig = appManage.checkconfig;

			function check(a, b, r) {
				a = util.isArray(a) ? a : [a];
				b = util.isArray(b) ? b : [b];
				a.forEach(function(appname) {
					b.forEach(function(config) {
						console.error(appname, config)
						var d = checkconfig(appname, config).error;
						assert.ok(d === r);
					});

				});
			}

			check([null, 123, "aaA"], null, "appname error")

			check("test", [1, [1222], "222"], "config is not object");

			var config = {};
			check("test", config, "main is error");

			config.main = "a/a.js";
			check("test", config, "main is error");
			config.main = "index.js";
			check("test", config, "version is error");

			config.version = 1;
			check("test", config, "struct is error");

			config.struct = {};
			config.depends = [];
			check("test", config, "depends is error");

			config.depends = ["bug"];
			check("test", config, "depends app bug is not exist");

			config.depends = ["blog"]
			config.friends = [];
			check("test", config, "friends is error");

			config.friends = ["bug"];
			check("test", config, "friends app bug is not exist");

			config.friends = ["root"];
			config.install = [];
			check("test", config, "install is error");

			config.install = ["bug"];
			check("test", config, "install app bug is not exist");

			config.install = ["user"];
			config.roots = [];
			check("test", config, "roots is error");

			//rootapp
			config.roots = ["object", "hello"];
			check("test", config, "roots length > 1");

			config.roots = ["object"];
			check("test", config, "rootapp must have app [root,bind,link]");

			config.depends = ["root", "bind", "link", "group"];
			check("test", config, "depends [group] app is rootapp!");

			config.depends = ["root", "bind", "link", "comments"];
			check("test", config, "depends [comments] rootapp is difference!");


			//非rootapp
			config.roots = ["hello"];
			check("test", config, "roots [hello] app is not exist!");

			config.roots = ["comments"];
			check("test", config, "roots [comments] app is not rootapp!");

			config.roots = ["user"];
			config.depends = ["group"];
			check("test", config, "depends [group] app is rootapp!");

			config.depends = ["comments"];
			check("test", config, "depends [comments] rootapp is difference!");
		});

		xit("管理器内的配置数据公共调用 不可修改", function() {
			var cfg = appManage.getdependapps("message");
			cfg.push(2998);

			cfg = appManage.getdependapps("message");
			assert.ok(cfg.indexOf(2998) === -1);

			cfg = appManage.getoptionalapps("message");
			cfg.push(2998);

			cfg = appManage.getoptionalapps("message");
			assert.ok(cfg.indexOf(2998) === -1);
		});
	});

});