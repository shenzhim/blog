"use strict";
require("test").setup();

var ids = require('modules/ids');
var util = require('util');

var rnd = Math.floor(Math.random() * 20) + 3;
var vs = [
	["字符串", "n0", true],
	["字典", {
			name: "n1"
		},
		true
	],
	["字典多字段", {
			email: "e2",
			name: "n2"
		},
		true
	],
	["字典多字段存在重复", {
			test: "t3",
			email: "e3",
			errorname: "n2"
		},
		true
	],
	["字典多字段无重复", {
			test: "t3",
			email: "e3",
			name: "n3"
		},
		true
	],
	["字符串存在", "n1", false],
	["字典存在", {
			errorname: "n3"
		},
		false
	]
];

describe("ids", function() {
	var maxid;
	before(function() {
		maxid = ids.maxId("object") + 1;
	});

	after(function() {
		assert.ok(ids.remove(1, "i1"));

		for (var i = 2; i < rnd; i++) {
			assert.ok(ids.remove(i, "i" + i));
		}

		vs.forEach(function(a) {
			var v = a[1],
				v1 = a[1];
			if (ids.check(v)) {
				if (util.isObject(v)) {
					v1 = {};
					for (var j in v)
						v1[v[j]] = 0;
				}
				var id = ids.get(v1);
				if (util.isObject(id))
					for (var j in id)
						assert.ok(ids.remove(id[j], j));
				else assert.ok(ids.remove(id, v));
			}
		});
	});

	it("申请不存在的id", function() {
		assert.notOk(ids.check("i1"));
		assert.equal(ids.genObjectId("i1"), maxid);
	});

	it("申请已存在的id", function() {
		assert.ok(ids.check("i1"));
		assert.equal(ids.genObjectId("i1"), 0);
	});

	it("申请连续id", function() {
		for (var i = maxid + 1; i < rnd; i++) {
			assert.notOk(ids.check("i" + i));
			assert.equal(ids.genObjectId("i" + i), i);
		}
	});

	vs.forEach(function(a) {
		it(a[0], function() {
			var v = a[1],
				v1 = a[1];

			assert.equal(ids.check(v), !a[2]);
			if (util.isObject(v)) {
				v1 = {};
				for (var j in v)
					v1[v[j]] = 0;
			}

			var id = ids.genObjectId(v);
			var id2 = ids.get(v1);

			if (a[0] !== "字典多字段存在重复") {
				if (a[2]) {
					assert.notEqual(id, 0);
					if (util.isObject(id2))
						for (var j in id2)
							assert.equal(id, id2[j]);
					else assert.equal(id, id2);
				} else {
					assert.equal(id, 0);
				}

				assert.equal(ids.check(v), true);
			}
		});
	});

	it("批量put", function() {
		var d = [{
			name: "a",
			id: 1
		}, {
			name: "b",
			id: 1
		}];

		d.forEach(function(i) {
			assert.ok(ids.put(i.id, i.name));
		});

		d.forEach(function(i) {
			assert.equal(ids.get(i.name), i.id);
		});
	});

	it("批量remove", function() {
		var e = {
			k1: "a",
			k2: "b"
		}

		ids.remove(1, e);
		assert.equal(ids.get("a"), 0);
		assert.equal(ids.get("b"), 0);
	});
});