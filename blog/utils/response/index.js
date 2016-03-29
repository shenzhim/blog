var io = require('io');
var mq = require('mq');
var http = require('http');
var util = require('util');

exports.redirect = function(v, url) {
	v.response.status = 302;
	v.response.setHeader("Location", url);
}

exports.write = function(v, value) {
	v.response.write(value);
}

exports.amd = function(v, value) {
	v.response.setHeader('Content-Type', 'application/x-javascript');
	//v.response.removeHeader("Last-Modified");
	if (v.response.status === 304) return;

	v.response.write('define(' + JSON.stringify(value) + ');');
}

exports.invoke = function(handler, url, method, params, headers, d) {
	if (method && !params && !headers) {
		headers = method;
		method = null;
	}

	var req = new http.Request();
	req.address = req.value = url;
	if (headers) req.setHeader(headers);

	if (d) {
		req.write(d);
		req.method = 'POST';
	} else if (method || params) {
		req.setHeader("Content-Type", "application/json, charset=utf-8;");
		req.write(JSON.stringify({
			method: method,
			params: params,
			id: 1234
		}));
	}

	//req.sendTo(console.stdout);
	mq.invoke(handler, req);
	//req.response.sendTo(console.stdout);
	req.response.body.rewind();
	var s = req.response.body.readAll().toString();
	req.response.toString = function() {
		return s;
	}
	req.response.toJSON = function() {
		return JSON.parse(s);
	}

	req.response.toName = function() {
		return s.substr(21, s.length - 21 - 11);
	}
	req.response.toNameJSON = function() {
		return JSON.parse(s.substr(21, s.length - 21 - 11));
	}
	return req.response;
}