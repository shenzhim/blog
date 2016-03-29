"use strict";

var mq = require('mq'),
	os = require("os"),
	fs = require("fs"),
	util = require("util"),
	rpc = require('rpc'),
	encoding = require('encoding'),
	coroutine = require('coroutine'),
	parser = require("utils/uaparser"),
	staticer = require("./static"),
	service = require("./service");

module.exports = {
	blog: new mq.Chain([
		function(v) {
			v.UA = v.headers['User-Agent'];

			var rst = new parser().setUA(v.UA).getResult();
			v.os = rst.os.name || "";
			v.osversion = rst.os.version || "";
			v.ip = v.headers["X-Real-IP"] || v.headers["RemoteIp"] || (v.stream ? v.stream.remoteAddress : "");
			v.startRunTime = new Date().getTime();
		},
		new mq.Routing({
			'^/qr/(.*)$': require("./qr"),
			'^/f/(.*)$': require("./f"),
			'^/xhr/(.*)$': service.xhr,
			'^/rest/(.*)$': service.rest,
			'^/amd(/.*)$': staticer.amd,
			'^(/.*)$': staticer.wwwroot,
			'^(.*)$': function(v) {
				v.response.status = 404;
			}
		}),
		function(v) {
			var runTime = new Date().getTime() - v.startRunTime;
			v.response.addHeader('Duration', runTime + "/" + (new Date().getTime() - v.startRunTime));
		}
	])
};

module.exports.blog.init = function() {}
module.exports.blog.stop = function() {}

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