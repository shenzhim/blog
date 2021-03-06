"use strict";

var io = require("io");
var mq = require("mq");
var http = require('http');
var encoding = require('encoding');
var fs = require("fs");

var application = require('application');
var hfh = http.fileHandler("../www");
var object = require('modules/object').app;

module.exports = {
	amd: new mq.Chain([hfh,
		function(v, f) {
			if (v.response.status !== 200) return;
			if (v.response.firstHeader("Content-Type").substring(0, 5) !== "text/") return;
			v.response.setHeader('Content-Type', 'application/x-javascript;charset=utf-8');

			if (application.router.static.amdCache === false) v.response.removeHeader("Last-Modified");
			var new_body = new io.MemoryStream();
			var repstream = new io.BufferedStream(new_body);

			if (f.indexOf("/tmpl/") > -1) {
				repstream.writeText('define("amd' + f.replace(/\//ig, ".") + '","');
				//console.debug(f, 'amd' + f.replace(/\//ig, "."))
			} else repstream.writeText('define("');

			if (v.response.length > 0) {
				var old_body = v.response.body;
				old_body.rewind();
				repstream.writeText(encoding.jsstr(old_body.readAll().toString()));
			}
			repstream.writeText('");');
			v.response.body.close();
			v.response.body = new_body;
		}
	]),
	emoji: new mq.Chain([hfh,
		function(v, f) {
			v.response.addHeader('Cache-Control', "max-age=" + 365 * 24 * 60 * 60);
		}
	]),
	wwwroot: new mq.Chain([hfh,
		function(v, f) {
			v.response.removeHeader("Last-Modified");
			if (v.response.status === 404) {
				var id = f.substr(1);
				if ((Number(id) % 1 === 0)) {
					var data = {};
					try {
						data = object.get(id, "base");
					} catch (e) {}
					if (data.base && data.base.root === "group") {
						v.response.status = 302;
						v.response.setHeader("Location", "/" + encodeURI(data.group.name));
						return;
					}
				}
				if (application.router.static.default === 404) {
					v.response.status = 404;
				} else {
					v.response.setHeader("Location", "/blog/index.html");
					v.response.status = 302;
				}
			}
		}
	])
}