"use strict";
require("test").setup();

var dbapi = require("modules/dbapi");

describe("initapp", function() {
	var allapp = {
		"root": 1,
		"user": 2,
		"message": 3,
		"blog": 4
	};

	before(function() {});

	after(function() {});

	it("初始化app数据", function() {
		var tb = dbapi(1)[0];
		assert.ok(tb.getObject().save({
			apps: {
				"1": 1
			}
		}));

		tb = tb.app;
		assert.ok(tb.put("sorts", 0));

		for (var k in allapp) {
			assert.ok(tb.put({
				tag: k,
				bindid: allapp[k]
			}));
		}
	});

	it("初始化appids管理器", function() {
		var apploader = require("apps").apploader;
		var appIdsManage = apploader[0].root.object.getAppIdsManage();
		assert.ok(appIdsManage.put(1, 1, 0));
	});

});