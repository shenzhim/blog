"use strict";
require("test").setup();

var coroutine = require('coroutine');
var session = require('modules/session');


describe("session", function() {
	before(function() {});

	after(function() {});

	it("初始化为空", function() {
		assert.deepEqual(session.root.get(), {});
	});

	it("创建", function() {
		var sid = session.root.create();
		assert.equal(sid.length, 36);
	});

	it("获取sessionid为空", function() {
		assert.equal(session.root.getSessionId(), undefined);
	});

	it("获取sessionid成功", function() {
		var sid = session.root.create();
		var fib = coroutine.current();
		fib.sessionid = sid;
		assert.equal(session.root.getSessionId(), sid);
	});

	it("获取session", function() {
		var sid = session.root.create();
		assert.deepEqual(session.root.get(sid), {
			"id": sid
		});
	});

	it("写session", function() {
		var sid = session.root.create();
		var fib = coroutine.current();
		fib.sessionid = sid;

		var d = {
			userid: 123,
			username: "teset"
		}
		var r = session.root.put(d);
		assert.ok(r);

		var s = session.root.get(sid);
		d["id"] = sid;
		assert.deepEqual(s, d);
	});
});