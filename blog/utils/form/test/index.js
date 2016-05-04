"use strict";
require("test").setup();

var form = require('utils/form');

describe("form", function() {
	before(function() {});

	after(function() {});

	describe("clean", function() {

		it("过滤非法 unicode 字符", function() {
			for (var i = 55296; i <= 57343; i++) {
				assert.equal(form.clean(String.fromCharCode(i)), '');
			}
			assert.equal(form.clean("\ufeff"), '');
		});

	});

});