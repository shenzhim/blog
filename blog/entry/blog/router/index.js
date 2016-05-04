"use strict";

var mq = require('mq'),
	coroutine = require('coroutine'),
	session = require('modules/session').app,
	staticer = require("./static"),
	service = require("./service"),
	parser = require("utils/uaparser"),
	hash = require("hash"),
	os = require("os"),
	fs = require("fs"),
	util = require("util"),
	rpc = require('rpc'),
	encoding = require('encoding'),
	serverversion = "dev",
	serverip;

try {
	serverversion = require("modules/version").api.version();
} catch (e) {}

function getServerIp() {
	if (serverip !== undefined) return serverip;

	var info = os.networkInfo();
	serverip = info["eth0"] ? info["eth0"][0].address : "";
	return serverip;
}

var running = false;

module.exports = {
	blog: new mq.Chain([

		function(v) {
			v.UA = v.headers['User-Agent'];
			var rst = new parser().setUA(v.UA).getResult();
			v.os = rst.os.name || "";
			v.osversion = rst.os.version || "";
			v.ip = v.headers["X-Real-IP"] || v.headers["RemoteIp"] || (v.stream ? v.stream.remoteAddress : "");
			v.response.addHeader('Server', "blog/" + serverversion);
			v.startRunTime = new Date().getTime();
		},
		new mq.Routing({
			'^/qr/(.*)$': require("./qr"),
			'^/f/(.*)$': require("./f"),
			'^/amd(/.*)$': staticer.amd,
			'^/blog/(.*)$': service.tmpl,
			'^/xhr/(.*)$': service.xhr,
			'^/rest/(.*)$': service.rest,
			'^/raw/(.*)$': service.raw,
			'^(/imgs/emoji/.*)$': staticer.emoji,
			'^(/.*)$': staticer.wwwroot,
			'^(.*)$': function(v) {
				v.response.status = 404;
			}
		}),
		function(v) {
			var runTime = new Date().getTime() - v.startRunTime;
			v.response.addHeader('Duration', runTime + "/" + (new Date().getTime() - v.startRunTime));
		}
	]),
};

module.exports.blog.init = function() {
	running = true;
	coroutine.start(function() {
		var sessiondb = require('dbs/dbManager').session;
		while (running) {
			coroutine.sleep(24 * 60 * 60 * 1000);
			sessiondb.clear(180 * 24 * 60 * 60 * 1000);
			console.notice("[Task] clear session online: %d", sessiondb.count());
		}
	});
}

module.exports.blog.stop = function() {
	running = false;
}

module.exports.blog.error = function(v) {
	console.error("servererror_500", {
		lastError: v.lastError,
		address: encoding.decodeURI(v.address),
		params: v.params,
		ip: v.ip || "-",
		UA: v.UA,
		Referer: v.headers.Referer || ""
	});
}