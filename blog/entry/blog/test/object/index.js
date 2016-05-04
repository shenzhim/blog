"use strict";
require("test").setup();

var client = require("client");

var ns = [
	"baoz", "baozpp", "ppbaoz", "1baoz2",
	"孢子", "孢子pp", "pp孢子", "1孢子2",
	"xici", "xicipp", "ppxici", "1xici2",
	"西祠", "西祠pp", "pp西祠", "1西祠2",
	"发布", "发布pp", "pp发布", "1发布2",
	"baoz1孢子2xici3西祠4发布", "name",
	"nonamed", "那么然后", "么么哒那么"
];

describe("object", function() {
	var c;
	before(function() {
		c = new client();
	});

	after(function() {});

	describe("ids", function() {
		it("检测可注册用户名", function() {
			var r = c.module.xhr("object", "check")("tes11t").result;
			assert.equal(r, -1);

			ns.forEach(function(n) {
				var r = c.module.xhr("object", "check")(n).result;
				assert.equal(r, -1);
			});
		});

		it("检测不可注册用户名", function() {
			ns.forEach(function(n) {
				var r = c.module.xhr("object", "check2")(n).result;
				assert.equal(r, 0);
			});
		});

		it("获取id", function() {
			ns.forEach(function(n) {
				var r = c.module.xhr("object", "getid")("test").result;
				assert.equal(r, 0);
			});
		});

		it("获取id和类型", function() {
			ns.forEach(function(n) {
				var r = c.module.xhr("object", "base")("test").result;
				assert.deepEqual(r, {
					id: 0
				});
			});
		});
	});
});