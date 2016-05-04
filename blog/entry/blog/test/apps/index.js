"use strict";
require("test").setup();

var apps = require('apps');
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var util = require('util');

describe("apps", function() {
	var appnames;

	before(function() {
		appnames = appManage.listApp();
	});

	after(function() {});

	it("app支持反射", function() {
		appnames.forEach(function(o) {
			var appname = o.appname;
			var app = apps(appname);
			assert.equal(app.root.base.getappid(), appname);
			assert.deepEqual(app.root.base.config, require("apps/" + appname + "/package.json"));
		});
	});

	it("app的types配置", function() {
		appnames.forEach(function(o) {
			var types = require("apps/" + o.appname + "/package.json").types;
			assert.equal(util.isObject(types), true);
			if (types) {
				for (var i in types) {
					assert.equal(util.isNumber(types[i]) || util.isObject(types[i]), true);
					if (util.isNumber(types[i])) {
						assert.equal(types[i] >= 0, true);
					} else {
						assert.equal(types[i]["appcache"] >= 0, true);
						assert.equal(types[i]["get"] >= 0, true);
						assert.equal(types[i]["fill"] >= 0, true);
					}
				}
			}
		});
	});

	it("app的types配置-expire方法", function() {
		var baseExpire = apps("root")[""].object.expire.toString();
		appnames.forEach(function(o) {
			var expire = apps(o.appname)[""].object.expire;
			assert.ok(!expire || util.isFunction(expire) && expire.toString() === baseExpire);
		});
	});

	it("apploader测试", function() {
		var p = apps("root")[""];
		var apploader = apps.apploader;
		apps("root")[""] = {
			'func1': function() {
				return "func1";
			}
		}
		assert.deepEqual(apploader[0]["root"]["func1"](), "func1");
		apps("root")[""] = p
	});
});