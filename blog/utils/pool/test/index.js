"use strict";
require("test").setup();

var Pool = require("utils/pool");

describe("pool", function() {
	it("run", function() {
		var p = Pool(function() {
			return 10;
		});

		assert.equal(p(function(v) {
			return v + 1;
		}), 11);
	});

	it("pool", function() {
		var n = 0;

		var p = Pool(function() {
			n++;
			return n;
		});

		assert.equal(p(function(v) {
			return v + 1;
		}), 2);
	});

	it("throw", function() {
		var n = 0;

		var p = Pool(function() {
			n++;
			return n;
		});

		assert.equal(p(function(v) {
			return v + 1;
		}), 2);

		assert.throws(function() {
			p(function(v) {
				throw "error";
			});
		});

		assert.equal(p(function(v) {
			return v + 1;
		}), 3);
	});

});