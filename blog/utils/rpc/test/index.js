"use strict";
require("test").setup();

var net = require("net");
var http = require("http");
var websocket = require("websocket");
var rpc = require("rpc");
var mq = require("mq");

var client = require("utils/rpc");

var remoting, func;

describe("websocket rpc", function() {
	var svr;

	before(function() {
		svr = new http.Server(8811, new websocket.Handler(rpc.json({
			test: function(m, v1, v2) {
				return v1 + v2;
			}
		})));
		svr.asyncRun();
	})

	after(function() {
		svr.stop();
		remoting = undefined;
	})

	it("connect", function() {
		remoting = client.ws_connect("ws://127.0.0.1:8811");
	});

	it("test", function() {
		assert.equal(remoting("test")(1, 2), 3);
	});

	it("id not exists", function() {
		assert.throws(function() {
			remoting("unknown_id")(1, 2);
		});
	});
});