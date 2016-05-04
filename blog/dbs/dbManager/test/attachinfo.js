"use strict";
require("test").setup();

var attachinfo = require("dbs/dbManager").attachinfo;
var client = require('client');

describe("attachinfo", function() {
	var ks = ["037d1e1df9af025253963799d5b161de", "050ba3c071c2e1ccd6983d1fa3d17299"];
	var c;
	before(function() {
		c = new client();
	});

	after(function() {
		c.clearAttachment(ks);
	});

	it("addInfo", function() {
		ks.forEach(function(k) {
			attachinfo.addInfo(k, 8759, 480, 480, 'jpeg', 0, 0, '');
		});
	});

	it("getInfo", function() {
		ks.forEach(function(k) {
			var rs = attachinfo.getInfo(k);
			assert.equal(rs["k"], k);
		});

		var rs = attachinfo.getInfo("test");
		assert.equal(rs, undefined);


		var rs = attachinfo.getInfo(ks);
		assert.equal(rs.length, 2);
	});

});