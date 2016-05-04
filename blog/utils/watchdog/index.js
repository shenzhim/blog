"use strict";

var net = require('net'),
	fs = require('fs'),
	coroutine = require('coroutine'),
	process = require('process');

exports.run = function(st) {
	var n = 0,
		port = 7723; //process.argv[2];
	while (1) {
		try {
			new net.TcpServer(port, function(c) {
				if (n > 0) c.write(new Buffer("x"));
				n++;
				try {
					c.read();
				} catch (e) {}
				n--;
			}).asyncRun();
			coroutine.start(function() {
				var restart;
				while (1) {
					if (n === 0) {
						if (!restart) restart = [];
						else restart.push(new Date());
						coroutine.start(function() {
							fs.writeFile("../watchdog_log", restart.join("\n"));
						})
						process.system(process.argv.join(" "));
					}
					coroutine.sleep(st || 1);
				}
			});
			return;
		} catch (e) {}

		var s = new net.Socket();
		try {
			s.connect('127.0.0.1', port);
			if (s.read(1) !== null) process.exit(-1);
		} finally {
			s.close();
			s.dispose();
		}
	}
}