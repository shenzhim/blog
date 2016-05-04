"use strict";

var fs = require("fs");
var url2img = require('utils/url2img');
var storage = require('modules/storage').app;

module.exports = function(v, n) {
	if (v.firstHeader('If-Modified-Since')) {
		v.response.status = 304;
		return;
	}

	if (n && n.endsWith(".mp4")) {
		var f = storage.getValue(n.slice(0, 0 - ".mp4".length));
		if (!f) {
			v.response.addHeader('Url-Error', 'value/null');
			return;
		}
		v.response.addHeader('Content-Type', 'video/mpeg4');
		v.response.body.write(f);
		return;
	}

	if (n) {
		v.response.addHeader('Last-Modified', 'Mon, 26 Nov 2012 00:00:00 GMT');
		v.response.addHeader('Cache-Control', "max-age=" + 10 * 365 * 24 * 60 * 60);
		var stream = url2img(v, n.toLowerCase());
		if (stream) {
			v.response.body.write(stream);
			return;
		}
	}
	v.response.addHeader('Content-Type', 'image/jpeg');
	v.response.body = fs.open("../www/imgs/0.jpg");
}