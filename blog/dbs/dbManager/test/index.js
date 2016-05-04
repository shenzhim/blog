"use strict";
require("test").setup();

var coroutine = require('coroutine');
var c = require("dbs/dbManager").pageCache;


describe("cache", function() {
	before(function() {
		c.clear(0);
	});

	after(function() {});

	it("初始化为空", function() {
		assert.equal(c.get("a"), undefined);
		assert.equal(c.count(), 0);
	});

	it("put 方法", function() {
		assert.ok(c.put("a", 1));
		assert.ok(c.put("b", 2));
		assert.equal(c.get("a"), 1);
		assert.equal(c.get("b"), 2);

		assert.ok(c.put("a", {
			"key": "value"
		}));
		assert.equal(c.get("a"), '{"key":"value"}');
	});

	it("remove 方法", function() {
		assert.ok(c.remove("a"));
		assert.equal(c.get("a"), undefined);
	});

	it("count 方法", function() {
		assert.equal(c.count(), 1);
	});

	it("字典存取", function() {
		var d = {
			a: "1",
			b: "2",
			c: "3"
		};
		assert.ok(c.put(d));
		assert.deepEqual(c.get(d), d);
		assert.equal(c.count(), 3);
	});

	it("数组取", function() {
		var d = {
			a: "1",
			b: "2",
			c: "3"
		};
		assert.deepEqual(c.get(["a", "b", "c"]), d);
	});

	it("删除", function() {
		assert.ok(c.remove("b"));
		var d = {
			a: "1",
			b: "2",
			c: "3"
		};
		delete d["b"];
		assert.deepEqual(c.get(d), d);
		assert.equal(c.count(), 2);
	});

	it("超时", function() {
		coroutine.sleep(1000);
		assert.ok(c.clear(0));
		assert.equal(c.count(), 0);
	});
});