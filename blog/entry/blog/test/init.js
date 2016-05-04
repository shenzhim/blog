"use strict";
require("test").setup();

var initapp = require("./initapp.js");
var hash = require('hash')
var client = require('client');
var dbapi = require("modules/dbapi");

describe("groupman", function() {
	var c,
		userid;
	before(function() {
		c = new client();
	});

	after(function() {});

	it("注册超级账号", function() {
		console.notice("超级账户: shenzm 123456");
		var name = "shenzm",
			passwd = "123456";

		var d = {
			"mail": name + "@test.cc",
			"name": name,
			"intro": "shenzm"
		};
		var password = hash.md5(passwd).digest().hex();
		d["hpass1"] = hash.hmac_md5(d["mail"]).digest(password).hex();
		d["hpass2"] = hash.hmac_md5(d["name"]).digest(password).hex();
		var r = c.app.xhr(0, "user", "signup")(d).result;
		userid = c.maxid + 1;
		assert.equal(r, userid);
		dbapi(2)[userid].getObject().save({
			phone: "15105161572"
		});

		dbapi(2)[userid].getObject().save({
			baozadmin: 1
		});

		var token = hash.md5(c.sid).digest().hex();
		var password = hash.md5("123456").digest().hex();
		password = hash.hmac_md5(d["name"].toLowerCase()).digest(password).hex();
		password = hash.hmac_md5(token).digest(password).hex();
		var r = c.app.xhr(0, "user", "signin")({
			"mail": d["name"],
			"hpass": password
		}).result;

		assert.equal(r, 0);
	});
});

require("test").run(console.NOTICE);