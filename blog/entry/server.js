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
	var sb = new vm.SandBox(require("./config/depend.js"));
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
====================================================================================\n\
          :@B8i  r2OB@BBOEF7.  iZ@8                      :;                        \n\
          MB@B@B@B@B@B@B@B@B@B@B@B@O                    ivr,.,..                   \n\
          v@OBB@B@B@BBO@B@B@B@BBOMB@            ,77rv7  7rrir;vvvi                 \n\
          YBMB@i   ,OB@BL    :@BMM@k              :ri  vr,      i77.               \n\
         iB@BB       5B:       BB@G  UB@B@B5     .ri: .  .ir7i:  r7i    ,:i::      \n\
         B@O@.    ij: 8 ,1@B.  :@O  @B@B@B@B@  :;7iiir. :7i .rr: vr,   ,v;:rr7     \n\
        M@OMB.   @iMB@5:M@B@:  :B7 1BB8OGO8BBM i: :ir:  7r.  rv:   .i:     i;:     \n\
       ,@MO8@Z   r@BOB@. vL    8@U i@BM8O8MB@F    .rii :rr  i7:   :v7:  .;7i:i;7i: \n\
   rPF 5BMGOM@O,   ,FBB@:    .M@B@. 7@B@B@B@Z     :r7. :7r,      :Lr .vv7::iii::LL,\n\
 :@B@M O@8OO@B@B@B@B@B@B@B@B@B@B@B@7  rPMZ1.     .7vi   r7r:   ,rYi        :i7.    \n\
 @BBBX MBM8@v.r5NMMM8MM@B@B@OZ1v:GB@B8:          rr,     ,;7Lvvri.         :77     \n\
 B@M@Z 1@OMB                     r@O@BP                                 .:ivr.     \n\
 jB@B@ :BBO@F                    @MMB@:                                 i7;,       \n\
  ,S@BF @BMM@8.                J@BMO@E  '.green + '8                                          \n'.rainbow + '\
         @BMO@B@Ui.        :LOB@MM8@P   '.green + '8                                          \n'.rainbow + '\
          MBO8BB@B@B@B@B@B@B@B@OOGOBL   '.green + '8oPYo. .oPYo. .oPYo. .oooo.    .oPYo. odYo \n'.rainbow + '\
          M@8OOBB@B@B@B@B@B@B@B@OMO@B   '.green + '8    8 .oooo8 8    8   .dP     8      8\' `8\n'.rainbow + '\
         .@B@B@B@uLukFkFkuur:rBB@B@B@   '.green + '8    8 8    8 8    8  oP\'      8      8   8\n'.rainbow + '\
          O@B@X:                7EM@7   '.green + '`YooP\' `YooP8 `YooP\' `Yooo\' 88 `YooP\' 8   8\n'.rainbow + '\
====================================================================================\n'.green);

var servers = initServer({});

//curl 'http://127.0.0.1:9465' -H 'Accept-Encoding: gzip,deflate' -H 'Content-Type: application/json' --data-binary '{"method":"refresh","params":[true]}'
//curl 'http://127.0.0.1/rest/system/stat'
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