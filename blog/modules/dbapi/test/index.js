"use strict";
require("test").setup();

var dbapi = require('modules/dbapi');
var coroutine = require('coroutine');
var util = require('util');
var config = require('entry/getConfig')("blog", "test");

var tb1 = dbapi(1);

describe("dbapi", function() {
	before(function() {});
	after(function() {});

	function test_kv(o) {
		it("undefined", function() {
			assert.equal(o.get("key"), undefined);
			assert.throws(function() {
				a.save()
			});
		});

		it("set key", function() {
			assert.ok(o.put("key", "value"));
		});

		it("put/get key1", function() {
			//set
			assert.ok(o.put("key1", "value1"));
			assert.equal(o.get("key1"), "value1");
		});

		it("批量 get", function() {
			var arr = o.get(["key", "key1"]);
			assert.deepEqual(arr, {
				"key": "value",
				"key1": "value1"
			});

			arr = o.get(["key", "key2"]);
			assert.deepEqual(arr, {
				"key": "value"
			});

			arr = o.get(["key2"]);
			assert.deepEqual(arr, {});
		});

		it("put/get KV (value is object)", function() {
			//set
			assert.ok(o.put("key2", {
				v1: "tagsort",
				v2: 301,
				j1: {
					jv1: "v500"
				}
			}));
			var v = JSON.parse(o.get("key2"));
			assert.equal(v["v1"], "tagsort");
			assert.equal(v["v2"], 301);
			assert.equal(v["j1"]["jv1"], "v500");
		});

		it("change k1", function() {
			//change
			assert.ok(o.put("key1", "value2"));
			//assert.equal(o.get("key1"), "value2");
			var a = o.get("key1");
			assert.equal(a, "value2");
			assert.throws(function() {
				a.save();
			});
		});

		it("erase key1", function() {
			//delete
			assert.ok(o.erase("key1", 0, 0));
			assert.equal(o.get("key1"), undefined);
		});

		it("reset k1", function() {
			//reset
			assert.ok(o.put("key1", "value1"));
			assert.ok(o.erase("key1", 0, 0));
			assert.ok(o.put("key1", "value2"));
			assert.equal(o.get("key1"), "value2");

			assert.ok(o.erase("key1", 0, 0));
		});

		it("put/get emoji", function() {
			//emoji
			var emoji = "（?）";
			assert.ok(o.put("emoji", emoji));
			assert.equal(o.get("emoji"), emoji);
			assert.ok(o.erase("emoji", 0, 0));
		});

		//counter
		it("inc throw", function() {
			// --- inc ---
			assert.throws(function() {
				o.inc("key2");
			});
		});
		it("dec throw", function() {
			// --- inc ---
			assert.throws(function() {
				o.dec("key2");
			});
		});

		it("int", function() {
			//put
			assert.ok(o.put("key2", "0"));

			//inc
			assert.ok(o.inc("key2"), 1);
			//assert.equal(o.get("key2"), 1);
			var a = o.get("key2");
			assert.equal(a, 1);
			assert.throws(function() {
				a.save();
			});
		});

		it("int ++", function() {
			//inc n
			assert.ok(o.put("key2", 0));
			var len = Math.floor(Math.random() * 20 + 2);
			for (var i = 1; i <= len; i++) {
				assert.ok(o.inc("key2"), i);
				assert.equal(o.get("key2"), i);
			}

			for (var i = len - 1; i >= 0; i--) {
				assert.equal(o.dec("key2"), i);
				assert.equal(o.get("key2"), i);
			}
		});

		it("inc erase", function() {
			//erase
			assert.ok(o.erase("key2", 0, 0));
			assert.equal(o.get("key2"), undefined);
		});

		it("int error", function() {
			//error: string inc
			assert.ok(o.put("key3", "hello"));
			assert.throws(function() {
				o.inc("key3");
			});
			assert.equal(o.get("key3"), "hello");
			assert.ok(o.erase("key3", 0, 0));
		});

		it("get key", function() {
			//have?
			assert.equal(o.get("key"), "value");
			assert.ok(o.erase("key", 0, 0));
		});
	}

	function test_json(o, table) {
		function dbapi_base_assert(x, y) {
			if (y) {
				assert.equal(x["id"], 1);
				assert.equal(x["appid"], 1);
				assert.equal(x["list"], table);
				assert.equal(x["tag"], y["tag"]);
				assert.equal(x["sort"], y["sort"]);
				assert.equal(x["bindid"], y["bindid"]);
			} else {
				assert.equal(x["id"], 1);
				assert.equal(x["appid"], 1);
				assert.equal(x["list"], table);
				assert.equal(x["tag"], "");
				assert.equal(x["sort"], 0);
				assert.equal(x["bindid"], 0);
			}
		}

		it("getobject", function() {
			dbapi_base_assert(o.getObject());
		});

		it("save 1", function() {
			var a = o.getObject();
			a["k1"] = "v1";
			assert.ok(a.save());

			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], "v1");
			assert.ok(b["created"]);
			assert.ok(b["changed"]);
			assert.equal(b["created"].getTime(), b["changed"].getTime());
		});

		it("save 2", function() {
			var a = o.getObject();
			assert.ok(a.save({
				k2: "v2"
			}));
			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], "v1");
			assert.equal(b["k2"], "v2");
		});

		it("默认字段无法改写", function() {
			var a = o.getObject();
			assert.ok(a.save({
				id: 123,
				appid: 321,
				list: "teble",
				tag: "key",
				bindappid: 123321,
				k1: "v11"
			}));
			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], "v11");
			assert.equal(b["k2"], "v2");
		});

		it("save multiple", function() {
			var a = o.getObject();
			delete a["k1"];
			a["k3"] = "v3";
			a["k4"] = "v4";
			assert.ok(a.save());
			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], undefined);
			assert.equal(b["k2"], "v2");
			assert.equal(b["k3"], "v3");
			assert.equal(b["k4"], "v4");
		});

		it("save multiple 2", function() {
			var a = o.getObject();
			a["k1"] = "v1";
			a["k2"] = "vx2";
			delete a["k3"]
			assert.ok(a.save({
				k4: "vx4",
				k5: "v5"
			}));
			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], "v1");
			assert.equal(b["k2"], "vx2");
			assert.equal(b["k3"], undefined);
			assert.equal(b["k4"], "vx4");
			assert.equal(b["k5"], "v5");
		});

		it("delete", function() {
			var a = o.getObject();
			delete a["k1"]
			delete a["k2"]
			delete a["k3"]
			delete a["k4"]
			a["k4"] = "vx4"
			delete a["k5"]
			assert.ok(a.save());
			var b = o.getObject();
			dbapi_base_assert(b);
			assert.equal(b["k1"], undefined);
			assert.equal(b["k2"], undefined);
			assert.equal(b["k3"], undefined);
			assert.equal(b["k4"], "vx4");
			assert.equal(b["k5"], undefined);
		});

		it("changed time", function() {
			var a = o.getObject();
			var changed = a["changed"];
			coroutine.sleep(1000);
			a["k1"] = "v1";
			a["k2"] = "vx2";
			assert.ok(a.save());

			var b = o.getObject();
			assert.lessThan(changed, b["changed"]);
		});

		it("erase", function() {
			var a = o.getObject();
			a.erase();
			var a = o.getObject();
			assert.equal(a["k4"], undefined);
			dbapi_base_assert(a);
		});

		it("错误的put", function() {
			assert.throws(function() {
				assert.ok(o.put("", "{\"appid\": 1}"));
			});
		});
	}

	function test_list(t, table) {
		function dbapi_base_assert(x, y) {
			if (y) {
				assert.equal(x["id"], 1);
				assert.equal(x["appid"], 1);
				assert.equal(x["list"], table);
				assert.equal(x["tag"], y["tag"]);
				assert.equal(x["sort"], y["sort"]);
				assert.equal(x["bindid"], y["bindid"]);
			} else {
				assert.equal(x["id"], 1);
				assert.equal(x["appid"], 1);
				assert.equal(x["list"], table);
				assert.equal(x["tag"], "");
				assert.equal(x["sort"], 0);
				assert.equal(x["bindid"], 0);
			}
		}

		it("初始化为空", function() {
			var a = t.tags("tagx", 100);
			assert.deepEqual(a, []);
		});

		it("get 0 值", function() {
			assert.ok(t.put({
				tag: "xxy",
				sort: 111,
				bindid: 100
			}));

			var a = t.tags("xxy", 100);
			assert.equal(a.length, 1);
			a[0].xyz = 0;
			assert.equal(a[0].xyz, 0);

			a[0].xyz = 1;
			assert.equal(a[0].xyz, 1);
			t.erase("xxy", 100);
		});

		it("put", function() {
			// without sort
			assert.equal(t.put({
				tag: "tagsort",
				bindid: 301,
				keytest: "value500",
				jsontest: {
					k: "v500"
				}
			}), 1);
			var a = t.tags("tagsort", 100);
			assert.equal(a.length, 1);
			var b = a[0];
			dbapi_base_assert(b, {
				list: table,
				tag: "tagsort",
				bindid: 301,
				sort: 1
			});
			assert.equal(b["keytest"], "value500");
			assert.equal(b["jsontest"]["k"], "v500");

			// with bindid(0)
			assert.equal(t.put({
				tag: "bindid0",
				bindid: 0,
				keytest: "value500",
				jsontest: {
					k: "v500"
				}
			}), 2);
			var a = t.tags("bindid0", 100);
			assert.equal(a.length, 1);

			// with bindid(string)
			assert.throws(function() {
				t.put({
					tag: "bindidString",
					bindid: "test",
					keytest: "value500"
				});
			});

			// with bindid("")
			assert.throws(function() {
				t.put({
					tag: "bindidString",
					bindid: "",
					keytest: "value500"

				});

			});

			// with sort
			assert.equal(t.put({
				tag: "tagx",
				bindid: 300,
				sort: 500,
				keytest: "value500",
				jsontest: {
					k: "v500"
				}
			}), 500);
			var a = t.tags("tagx", 100);
			assert.equal(a.length, 1);
			var b = a[0];
			dbapi_base_assert(b, {
				list: table,
				tag: "tagx",
				bindid: 300,
				sort: 500
			});
			assert.equal(b["keytest"], "value500");
			assert.equal(b["jsontest"]["k"], "v500");
		});

		it("add data", function() {
			assert.ok(t.put({
				tag: "tagx",
				bindid: 200,
				sort: 600,
				keytest: "value600",
				jsontest: {
					k: "v600"
				}
			}));

			assert.ok(t.put({
				tag: "tagx",
				bindid: 400,
				sort: 400,
				keytest: "value400",
				jsontest: {
					k: "v400"
				}
			}));

			assert.ok(t.put({
				tag: "tagx",
				bindid: 100,
				sort: 700,
				keytest: "value700",
				jsontest: {
					k: "v700"
				}
			}));

			assert.ok(t.put({
				tag: "tagx",
				bindid: 500,
				sort: 300,
				keytest: "value300",
				jsontest: {
					k: "v300"
				}
			}));

			//sort   700  600  500  400  300
			//bindid 100, 200, 300, 400, 500,
			assert.equal(t.count("tagx"), 5);
		});

		it("tag 2", function() {
			var a = t.tags("tagx", 100);
			assert.equal(a.length, 5);
		});

		it("tag sort", function() {
			var a = t.tags("tagx", 100, [1000, undefined]);
			assert.deepEqual(a, []);
		});

		it("tag change", function() {
			var a = t.tags("tagx", 3, [350, undefined]);
			assert.equal(a.length, 3);
			var b = a[1];
			dbapi_base_assert(b, {
				list: table,
				tag: "tagx",
				bindid: 300,
				sort: 500
			});
			assert.equal(b["keytest"], "value500");
			assert.equal(b["jsontest"]["k"], "v500");
		});

		it("list", function() {
			var a = t.list(300);
			assert.equal(a.length, 1);
			var b = a[0];
			dbapi_base_assert(b, {
				list: table,
				tag: "tagx",
				bindid: 300,
				sort: 500
			});
			assert.equal(b["keytest"], "value500");
			assert.equal(b["jsontest"]["k"], "v500");

			//save
			b["keytest"] = "testsave";
			assert.ok(b.save({
				jsontest: {
					k: "vtest",
					k2: "v2"
				}
			}));
		});

		it("list get", function() {
			var a = t.list(300);
			assert.equal(a.length, 1);
			var b = a[0];
			dbapi_base_assert(b, {
				list: table,
				tag: "tagx",
				bindid: 300,
				sort: 500
			});
			assert.equal(b["keytest"], "testsave");
			assert.equal(b["jsontest"]["k"], "vtest");
		});

		it("erase object", function() {
			var a = t.list(300);
			assert.equal(a.length, 1);
			var b = a[0];
			assert.ok(b.erase());
			assert.equal(t.count("tagx"), 4);
		});

		it("erase list", function() {
			assert.throws(function() {
				t.erase();
			});

			assert.equal(t.count("tagx"), 4);

			t.list(200, "tagx")[0].erase();
			assert.equal(t.count("tagx"), 3);

			t.list(400, "tagx")[0].erase();
			assert.equal(t.count("tagx"), 2);

			t.list(100, "tagx")[0].erase();
			assert.equal(t.count("tagx"), 1);

			t.list(500, "tagx")[0].erase();
			assert.equal(t.count("tagx"), 0);
		});
	}

	function test_list2(d, table) {
		it("多id处理", function() {
			d[110][table].getObject("test").save({
				a: 1
			});
			d[120][table].getObject("test").save({
				b: 2
			});
			d[130][table].getObject("test").save({
				c: 3
			});

			var r = d[[110, 120, 130]][table].list(0);
			assert.equal(r.length, 3);
			d[120][table].erase("test", 0, 0);
			r = d[[110, 120, 130]][table].list(0);
			assert.equal(r.length, 2);

			d[110][table].getObject("test").erase();
			r = d[[110, 120, 130]][table].list(0);
			assert.equal(r.length, 1);

			d[130][table].getObject("test").erase();
			r = d[[110, 120, 130]][table].list(0);
			assert.equal(r.length, 0);
		});
	}

	describe("Key-Value", function() {
		describe("Null TAble", function() {
			dbapi(1)[1].put("sorts", 0);
			test_kv(dbapi(1)[1]);
		});

		describe("Test TAble", function() {
			dbapi(1)[1].put("sorts", 0);
			test_kv(dbapi(1)[1].test);
		});
	});

	describe("JSON", function() {
		describe("Null TAble", function() {
			test_json(dbapi(1)[1], "")
		});
		describe("Test TAble", function() {
			test_json(dbapi(1)[1].test, "test")
		});
	});

	describe("LIST", function() {
		describe("Null TAble", function() {
			dbapi(1)[1].put("sorts", 0);
			test_list(dbapi(1)[1], "")
		});
		describe("Test TAble", function() {
			dbapi(1)[1].test.put("sorts", 0);
			test_list(dbapi(1)[1].test, "test")
			test_list2(dbapi(1), "cache")
		});
	});

	describe("distinct", function() {
		var tb;
		before(function() {
			tb = dbapi(1)[1];
			tb.getObject().save({
				"apps": {
					"1": 1,
					"2": 1
				}
			});

			tb["bbs"].put({
				tag: "a",
				sort: 100,
				bindid: 129
			});

			tb["bbs"].put({
				tag: "a",
				sort: 100,
				bindid: 0
			});

			tb["bbs"].put({
				tag: "b",
				sort: 100,
				bindid: 0
			});

			tb["test"].put({
				tag: "a",
				sort: 100,
				bindid: 0
			});

			dbapi(2)[1]["mail"].put({
				tag: "b",
				sort: 100,
				bindid: 129
			});
		})

		it("list", function() {
			assert.deepEqual(tb.distinct("list"), ["bbs", "test"]);
		});

		it("clear data", function() {
			tb.getObject().erase();
			tb.bbs.list(129, "a")[0].erase();
			tb.bbs.list(0, "a")[0].erase();
			tb.bbs.list(0, "b")[0].erase();
			tb.test.list(0, "a")[0].erase();
			dbapi(2)[1]["mail"].list(129, "b")[0].erase();
		});
	});

	describe("dbapi format", function() {
		it("dbapi", function() {
			var obj = dbapi(1)[2998].getObject();
			var d = ["id", "appid", "bindid", "sort"];
			d.forEach(function(k) {
				assert.ok(util.isNumber(obj[k]))
			});

			obj.save();
			obj = dbapi(1)[2998].getObject();
			d.forEach(function(k) {
				assert.ok(util.isNumber(obj[k]))
			});

			obj = dbapi(1)[2998].getObject();
			obj.erase();
		});
	});

	describe("dbapi error", function() {
		it("put error", function() {
			assert.throws(function() { //object为空
				dbapi(1)[2998].put({});
			});

			assert.throws(function() { //sort为0
				dbapi(1)[2998].put({
					sort: 0,
					bindid: 1,
					tag: "tagE"
				});
			});

			assert.throws(function() { //bindid为空
				dbapi(1)[2998].put({
					bindid: 1,
					tag: ""
				});
			});

			assert.throws(function() { //bindid为空
				dbapi(1)[2998].put({
					bindid: "",
					tag: "tagE"
				});
			});

			assert.throws(function() { //tag为空
				dbapi(1)[2998].put(null, "value1");
			});

			assert.throws(function() { //value为空
				dbapi(1)[2998].put("key1", null);
			});

			assert.throws(function() { //object中含_tags
				dbapi(1)[2998].put({
					bindid: 1,
					tag: "tagE",
					_tags: "tagA,tagB"
				});
			});
		});
	});

	describe("新版dbapi", function() {
		var tb = dbapi(1)[1];
		it("不存在的数据不携带oldsort", function() {
			var o = tb.getObject();
			assert.equal(o.oldsort, undefined);
		});

		it("存在的数据携带oldsort", function() {
			assert.equal(tb.getObject().save({
				test: 1
			}), true);
			var o = tb.getObject();
			assert.equal(o.test, 1);
			assert.equal(o.oldsort, 0);
			assert.equal(o.erase(), true);

			assert.equal(tb.test.put({
				bindid: 1,
				sort: 1,
				tag: ""
			}), true);

			var rs = tb.test.tags("");
			assert.equal(rs.length, 1);
			assert.equal(rs[0].oldsort, 1);
			assert.equal(rs[0].erase(), true);
		});

		it("oldsort不可被修改", function() {
			assert.equal(tb.getObject().save({
				test: 1
			}), true);
			var o = tb.getObject();
			assert.equal(o.oldsort, 0);
			assert.equal(o.test, 1);
			o.oldsort = "hello";
			assert.equal(o.save(), true);
			o = tb.getObject();
			assert.equal(o.oldsort, 0);
			assert.equal(o.erase(), true);

			var o = tb.getObject();
			assert.equal(o.oldsort, undefined);
			assert.equal(o.save({
				oldsort: "hello",
				test: 2
			}), true);

			o = tb.getObject();
			assert.equal(o.test, 2);
			assert.equal(o.oldsort, 0);
			assert.equal(o.erase(), true);


			assert.equal(tb.test.put({
				bindid: 1,
				sort: 1,
				tag: ""
			}), true);

			var rs = tb.test.tags("");
			assert.equal(rs.length, 1);
			o = rs[0];
			assert.equal(o.oldsort, 1);
			o.oldsort = "hello";
			assert.equal(o.save(), true);
			var rs = tb.test.tags("");
			assert.equal(rs.length, 1);
			o = rs[0];
			assert.equal(o.oldsort, 1);
			assert.equal(o.erase(), true);

			assert.throws(function() {
				tb.test.put({
					bindid: 1,
					sort: 1,
					tag: "",
					oldsort: 1
				});
			});
		});

		it("插入/更新key-value记录,只存在一条", function() {
			assert.equal(tb.test.put("test", 1), true);
			assert.equal(tb.test.get("test"), 1);
			assert.equal(tb.test.put("test", 2), true);
			assert.equal(tb.test.get("test"), 2);
			assert.equal(tb.test.count("test", 0), 1);
			assert.equal(tb.test.erase("test", 0, 0), true);
		});

		it("put插入多条sort不一样的数据", function() {
			assert.equal(tb.test.put({
				bindid: 1,
				sort: 1,
				tag: ""
			}), true);

			assert.ok(tb.test.put({
				bindid: 1,
				sort: 2,
				tag: ""
			}));

			var rs = tb.test.list(1, "");
			assert.equal(rs.length, 2);
			rs = tb.test.tags("");
			assert.equal(rs.length, 2);
			rs.forEach(function(o) {
				o.erase();
			});
			var rs = tb.test.list(1, "");
			assert.equal(rs.length, 0);
		});

		it("object类型 save操作", function() {
			var o = tb.getObject();
			assert.equal(o.save({
				test: 3
			}), true);

			var o = tb.getObject();
			assert.equal(o.oldsort, 0);
			assert.equal(o.test, 3);
			assert.equal(o.erase(), true);

			o = tb.getObject();
			assert.equal(o.oldsort, undefined);
		});

		it("list类型 save操作", function() {
			assert.ok(tb.test.put({
				bindid: 1,
				sort: 3,
				tag: ""
			}));

			var rs = tb.test.list(1);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].oldsort, 3);

			assert.equal(rs[0].save({
				test: 4,
				sort: 10
			}), true);

			rs = tb.test.list(1);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].oldsort, 10);
			assert.equal(rs[0].sort, 10);
			assert.equal(rs[0].test, 4);
			assert.equal(rs[0].erase(), true);
		});

		it("支持连续save操作", function() {
			var o = tb.getObject();
			assert.equal(o.oldsort, undefined);
			assert.equal(o.save(), true);
			assert.equal(o.oldsort, 0);
			assert.equal(o.save({
				test: 1
			}), true);
			assert.equal(o.oldsort, 0);
			assert.equal(o.test, 1);
			assert.equal(o.erase(), true);


			assert.ok(tb.test.put({
				bindid: 1,
				sort: 1,
				tag: ""
			}));
			var rs = tb.test.list(1);
			assert.equal(rs.length, 1);
			o = rs[0];
			assert.equal(o.oldsort, 1);

			assert.equal(o.save({
				sort: 50
			}), true);

			rs = tb.test.list(1);
			assert.equal(rs.length, 1);
			o = rs[0];
			assert.equal(o.oldsort, 50);
			assert.equal(o.save({
				test: 2
			}), true);

			rs = tb.test.list(1);
			assert.equal(rs.length, 1);
			assert.equal(o.oldsort, 50);
			assert.equal(o.test, 2);
			assert.equal(o.erase(), true);
		});

		it("addTag", function() {
			var tb = dbapi(1)[1].demo;
			tb.put("sorts", 0);
			assert.throws(function() { //tag不能为空
				tb.addTag("")
			});
			assert.throws(function() { //bindid不能为0
				tb.addTag("a", 0);
			});

			assert.throws(function() { //不存在主记录
				tb.addTag("a", 1);
			});

			tb.put({
				tag: "",
				sort: 1,
				bindid: 1
			});

			assert.ok(tb.addTag("a", 1));
			assert.ok(tb.addTag("a", 1)); //重复插入没有操作，返回true
			var rs = tb.list(1, "");
			assert.deepEqual(rs[0]._tags, ["a"]);
			assert.deepEqual(rs[0].tag, "");
			assert.deepEqual(rs[0].sort, 1);

			rs = tb.list(1, "a");
			assert.equal(rs.length, 1);
			assert.equal(rs[0].tag, "a");
			assert.equal(rs[0].sort, 1);

			assert.ok(tb.addTag("b", 1));
			rs = tb.list(1, "");
			assert.deepEqual(rs[0]._tags, ["a", "b"]);
			assert.deepEqual(rs[0].tag, "");
			assert.deepEqual(rs[0].sort, 1);

			rs = tb.list(1, "b");
			assert.equal(rs.length, 1);
			assert.equal(rs[0].tag, "b");
			assert.equal(rs[0].sort, 1);

		});

		it("removeTag", function() {
			var tb = dbapi(1)[1].demo;
			assert.throws(function() {
				tb.removeTag("a", 2);
			});

			assert.throws(function() {
				tb.removeTag("c", 2);
			});

			tb.put({
				sort: 2,
				bindid: 1,
				tag: "a"
			})

			tb.erase("a", 1, 2);

			tb.removeTag("a", 1);

			var rs = tb.list(1, "");
			assert.equal(rs.length, 1);
			assert.deepEqual(rs[0]._tags, ["b"]);

			rs = tb.list(1, "a");
			assert.equal(rs.length, 0);

			tb.removeTag("", 1);

			rs = tb.list(1);
			assert.equal(rs.length, 0);

		});

		it("listTag", function() {
			function createData(o, tag) {
				for (var i = 1; i <= 20; i++) {
					o.put({
						bindid: i,
						tag: "",
						sort: i
					})
					o.addTag(tag[0], i);
					o.addTag(tag[1], i);
				}
			}
			var tb = dbapi(1)[1].demo1;
			assert.throws(function() {
				tb.listTag("");
			});
			createData(tb, ["a", "b"]);
			var rs = tb.listTag("a");
			assert.equal(rs.length, 20);
			rs.forEach(function(o) {
				assert.deepEqual(o._tags, ["a", "b"]);
			});

			rs = tb.listTag("a", 5);
			assert.equal(rs.length, 5);
			assert.equal(rs[0].sort, 1);

			rs = tb.listTag("a", 10, null, "desc");
			assert.equal(rs.length, 10);
			assert.equal(rs[0].sort, 20);

			rs = tb.listTag("a", 10, 2);
			assert.equal(rs.length, 10);
			assert.equal(rs[0].sort, 3);

			rs = tb.listTag("a", 10, 3, "desc");
			assert.equal(rs.length, 2);
			assert.equal(rs[0].sort, 2);

			rs = tb.list(1, "");
			assert.equal(rs.length, 1);
			rs[0].erase();
			assert.throws(function() {
				rs = tb.listTag("a");
			});
			tb.all().forEach(function(o) {
				tb.removeTag("", o.bindid);
			});

			assert.equal(tb.all().length, 0);
		});

		it("updateSort", function() {
			var tb = dbapi(1)[1].demo1;
			assert.throws(function() {
				tb.updateSort(1); //此时不存在sorts的键值对
			});
			tb.put({
				sort: 1,
				bindid: 1,
				tag: ""
			});
			tb.put("sorts", 1);

			tb.addTag("a", 1);
			tb.addTag("b", 1);

			assert.throws(function() {
				tb.updateSort(0); //bindid必须>0
			});
			assert.equal(tb.updateSort(2), 2); //bindid值不存在

			assert.equal(tb.updateSort(1), 3); //updateSort返回inc后的sort值

			var rs = tb.list(1);
			assert.equal(rs.length, 3);
			rs.forEach(function(o) {
				assert.equal(o.sort, 3);
				o.erase();
			});
			assert.equal(tb.list(1).length, 0);
		});

		it("list 支持按sort查询", function() {
			var tb = dbapi(1)[1].demo1;
			tb.put({
				tag: "",
				bindid: 1,
				sort: 1
			});

			tb.put({
				tag: "",
				bindid: 1,
				sort: 2
			});

			var rs = tb.list(1);
			assert.equal(rs.length, 2);

			rs = tb.list(1, 1);
			assert.equal(rs.length, 0);

			rs = tb.list(1, "", 1);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].sort, 1);

			rs = tb.list(1, "", 2);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].sort, 2);
		});

		it("batchErase", function() {
			var tb = dbapi(1)[2].demo1;

			for (var i = 1; i <= 21; i++) {
				tb.put({
					tag: "batchErase",
					bindid: 1,
					sort: i
				});
			}

			tb.batchErase("batchErase", 20, 5)

			var rs = tb.list(1);
			assert.equal(rs.length, 5);
			assert.equal(rs[rs.length - 1].sort, 21);
		});

		it("transaction-same params", function() {
			var tb1 = dbapi(1);
			var balance = 100,
				money = 10;
			var tbo1 = dbapi(1)[1],
				idPos = 1;

			assert.ok(tbo1.put("balance", balance));

			tb1.transaction(function(tbTrans) {
				tbTrans[1].put("balance", 1000);
			}, [idPos, idPos], "", "balance");
			assert.equal(Number(tbo1.get('balance')), 100);
		});

		it("transaction-1", function() {
			var tb1 = dbapi(1);
			var balance = 100,
				money = 10;
			var tbo1 = dbapi(1)[1],
				tbo2 = dbapi(1)[2],
				idPos = 1,
				idNeg = 2;

			assert.ok(tbo1.test.put("balance", balance));
			assert.ok(tbo2.test1.put("balance", balance));

			coroutine.parallel([

				function() {

					tb1.transaction(
						function(tbTrans) {
							var balance11 = Number(tbTrans[1].test.get("balance"));
							var balance12 = Number(tbTrans[2].test1.get("balance"));
							coroutine.sleep(10);
							assert.equal(tbTrans[1].test.decMore("balance", money), balance - money);
							assert.equal(tbTrans[2].test1.incMore("balance", money), balance + money);
						}, idPos, "test", "balance")
				},
				function() {
					coroutine.sleep(1);
					tb1.transaction(function(tbTrans) {
						var balance21 = Number(tbTrans[1].test.get("balance"));
						var balance22 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 2 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 2 * money);
					}, idPos, "test", "balance")
				},
				function() {
					coroutine.sleep(2);
					tb1.transaction(function(tbTrans) {
						var balance31 = Number(tbTrans[1].test.get("balance"));
						var balance32 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 3 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 3 * money);
						assert.ok(tbTrans[1].test.decMore("balance", money));
						assert.ok(tbTrans[2].test1.incMore("balance", money));
						throw new TypeError("Interrupt");
					}, idPos, "test", "balance")
				}
			]);
			assert.equal(Number(tbo1.test.get('balance')), balance - 2 * money);
			assert.equal(Number(tbo2.test1.get('balance')), balance + 2 * money);
		});

		it("transaction-2", function() {
			var tb1 = dbapi(1);
			var balance = 100,
				money = 10;
			var tbo1 = dbapi(1)[1],
				tbo2 = dbapi(1)[2],
				idPos = 1,
				idNeg = 2;

			assert.ok(tbo1.test.put("balance", balance));
			assert.ok(tbo2.test1.put("balance", balance));

			coroutine.parallel([

				function() {

					tb1.transaction(
						function(tbTrans) {
							var balance11 = Number(tbTrans[1].test.get("balance"));
							var balance12 = Number(tbTrans[2].test1.get("balance"));
							coroutine.sleep(10);
							assert.equal(tbTrans[1].test.decMore("balance", money), balance - money);
							assert.equal(tbTrans[2].test1.incMore("balance", money), balance + money);
						}, [idPos, idNeg], "test", "balance")
				},
				function() {
					coroutine.sleep(1);
					tb1.transaction(function(tbTrans) {
						var balance21 = Number(tbTrans[1].test.get("balance"));
						var balance22 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 2 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 2 * money);
					}, [idPos, idNeg], "test", "balance")
				},
				function() {
					coroutine.sleep(2);
					tb1.transaction(function(tbTrans) {
						var balance31 = Number(tbTrans[1].test.get("balance"));
						var balance32 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 3 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 3 * money);
						assert.ok(tbTrans[1].test.decMore("balance", money));
						assert.ok(tbTrans[2].test1.incMore("balance", money));
						throw new TypeError("Interrupt");
					}, [idPos, idNeg], "test", "balance")
				}
			]);
			assert.equal(Number(tbo1.test.get('balance')), balance - 2 * money);
			assert.equal(Number(tbo2.test1.get('balance')), balance + 2 * money);
		});

		it("transaction-3", function() {
			var tb1 = dbapi(1);
			var balance = 100,
				money = 10;
			var tbo1 = dbapi(1)[1],
				tbo2 = dbapi(1)[2],
				idPos = 1,
				idNeg = 2;

			assert.ok(tbo1.test.put("balance", balance));
			assert.ok(tbo2.test1.put("balance", balance));

			coroutine.parallel([

				function() {

					tb1.transaction(
						function(tbTrans) {
							var balance11 = Number(tbTrans[1].test.get("balance"));
							var balance12 = Number(tbTrans[2].test1.get("balance"));
							coroutine.sleep(10);
							assert.equal(tbTrans[1].test.decMore("balance", money), balance - money);
							assert.equal(tbTrans[2].test1.incMore("balance", money), balance + money);
						}, [idPos, "test", "balance"], [idNeg, "test1", "balance"])
				},
				function() {
					coroutine.sleep(1);
					tb1.transaction(function(tbTrans) {
						var balance21 = Number(tbTrans[1].test.get("balance"));
						var balance22 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 2 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 2 * money);
					}, [idPos, "test", "balance"], [idNeg, "test1", "balance"])
				},
				function() {
					coroutine.sleep(2);
					tb1.transaction(function(tbTrans) {
						var balance31 = Number(tbTrans[1].test.get("balance"));
						var balance32 = Number(tbTrans[2].test1.get("balance"));
						assert.equal(tbTrans[1].test.decMore("balance", money), balance - 3 * money);
						assert.equal(tbTrans[2].test1.incMore("balance", money), balance + 3 * money);
						assert.ok(tbTrans[1].test.decMore("balance", money));
						assert.ok(tbTrans[2].test1.incMore("balance", money));
						throw new TypeError("Interrupt");
					}, [idPos, "test", "balance"], [idNeg, "test1", "balance"])
				}
			]);
			assert.equal(Number(tbo1.test.get('balance')), balance - 2 * money);
			assert.equal(Number(tbo2.test1.get('balance')), balance + 2 * money);
		});

		it("transaction-put", function() {
			var tb1 = dbapi(1);
			var balance = 100,
				money = 10;
			var tbo1 = dbapi(1)[1],
				tbo2 = dbapi(1)[2],
				idPos = 1,
				idNeg = 2;

			assert.ok(tbo1.put("balance", balance));
			assert.ok(tbo2.put("balance", balance));

			tb1.transaction(function(tbTrans) {
				tbTrans[1].put("balance", 1000);
			}, [idPos, idNeg], "", "balance");
			assert.equal(Number(tbo1.get('balance')), 1000);
		});

		it("ptags", function() {
			var rs = dbapi(1)[1].ptags();
			rs.forEach(function(o) {
				o.erase();
			});
			assert.equal(dbapi(1)[1].ptags().length, 0);
			dbapi(1)[1].demo.put({
				tag: "a",
				bindid: 1,
				sort: 1
			});

			dbapi(1)[1].demo.put({
				tag: "b",
				bindid: 2,
				sort: 2
			});

			assert.equal(dbapi(1)[1].ptags().length, 0);


			var rs = dbapi(1)[1].demo.ptags();

			assert.equal(rs.length, 2);
			assert.equal(rs[0].bindid, 1);
			assert.equal(rs[1].bindid, 2);

			rs = dbapi(1)[1].demo.ptags(1);
			assert.equal(rs.length, 1);
			assert.equal(rs[0].bindid, 1);

			rs = dbapi(1)[1].demo.ptags(1, null, "desc");
			assert.equal(rs.length, 1);
			assert.equal(rs[0].bindid, 2);

			rs = dbapi(1)[1].demo.ptags(20, null, "desc");
			assert.equal(rs.length, 2);
			assert.equal(rs[0].bindid, 2);
			assert.equal(rs[1].bindid, 1);

			rs.forEach(function(o) {
				o.erase();
			});

			rs = dbapi(1)[1].demo.ptags(20, null, "desc");
			assert.equal(rs.length, 0);
		});
	});
});