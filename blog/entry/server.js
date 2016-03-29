#!/bin/js

"use strict";
var vm = require("vm");
var mq = require("mq");
var net = require('net');
var http = require('http');
var rpc = require('rpc');
var websocket = require('websocket');
var util = require('util');
var process = require('process');
require("coroutine").spareFibers = 512;
require('utils/colors')(String);
var startTime = new Date();
var refreshCount = 0;

var params = process.argv;
if (params.length < 4) {
	console.error("params error");
	console.notice("js server.js routermode runmode");
	process.exit(-1);
}

var refreshport;
var ws = {};
if (!Proxy.create)
	Proxy.create = function(handler) {
		return new Proxy({}, handler);
	};

function initServer(servers) {
	var sb = new vm.SandBox(require("./" + params[2] + "/depend.js"));
	var config = sb.require('entry/getConfig')(params[2], params[3]);
	refreshport = config.runtime.refresh.port
	sb.add("application", config.runtime);
	sb.add("refreshTime", new Date());
	sb.add("refreshCount", refreshCount);
	sb.add("startTime", startTime);
	sb.add("websocket", {
		Message: websocket.Message,
		Handler: function(hdlr, k) {
			var stacks = (new Error()).stack.split("\n"),
				caller = stacks[2].split(":")[0].split("(")[1],
				name = k ? caller + "_" + k : caller;

			if (!ws[name]) ws[name] = new websocket.Handler(hdlr);
			else ws[name].handler = mq.jsHandler(hdlr);

			return ws[name];
		},
		connect: websocket.connect,
		CONTINUE: websocket.CONTINUE,
		TEXT: websocket.TEXT,
		BINARY: websocket.BINARY,
		CLOSE: websocket.CLOSE,
		PING: websocket.PING,
		PONG: websocket.PONG
	});
	if (config.logger) {
		console.reset();
		console.add(config.logger);
	}

	if (util.isEmpty(servers) && config.daemon)
		sb.require('utils/watchdog').run(config.daemon);

	var servers2 = {},
		stats = {};
	config.services.forEach(function(d) {
		var svr = servers[d.port];

		var hdlr = sb.require("entry/" + params[2] + "/router")[d.hdlr];
		if (svr) {
			svr.handler.stop();
			hdlr.init();
			svr.handler = hdlr;
			delete servers[d.port];
		} else {
			hdlr.init();
			if (d.type === "http") {
				svr = new http.Server(d.addr, d.port, hdlr)
				svr.onerror({
					500: hdlr.error
				});
				svr.crossDomain = true;
				svr.asyncRun();
			} else if (d.type === "rpc") {
				svr = new http.Server(d.addr, d.port, new websocket.Handler(hdlr));
				svr.onerror({
					500: hdlr.error
				});
				svr.asyncRun();
				svr = svr.handler;
			} else {
				console.error("unsupport type", d.type);
			}
		}

		stats[d.port] = {
			http: svr.httpStats,
			tcp: svr.stats
		}
		servers2[d.port] = svr;
	});

	for (var k in servers) {
		servers[k].handler.stop();
		servers[k].stop();
		delete servers[d.port];
	}

	sb.add("stats", stats);
	return servers2;
}

console.log('\
=============================================\n'.green + '\
  8      88                            \n'.rainbow + '\
  8      88                            \n'.rainbow + '\
  8oPYo. 88  .oPYo. .oPYo.             \n'.rainbow + '\
  8    8 88  8    o 8    8             \n'.rainbow + '\
  8    8 88  8    8  ````8             \n'.rainbow + '\
  `YooP  88  `YooP8 `Yooo8 ............\n'.rainbow + '\
=============================================\n'.green);

var servers = initServer({});

//curl 'http://127.0.0.1:9465' -H 'Accept-Encoding: gzip,deflate' -H 'Content-Type: application/json' --data-binary '{"method":"refresh","params":[true]}'
var port = refreshport;
while (port === refreshport) {
	try {
		var refreshsvr = new net.TcpServer("127.0.0.1", port,
			new http.Handler(rpc.json({
				refresh: function() {
					refreshCount++;
					servers = initServer(servers);
					console.notice(new Date(), "refresh server ok...");
					return true;
				}
			}))
		);
		console.notice("refresh port:", port);
		refreshsvr.run();
	} catch (e) {
		port++;
	}
}