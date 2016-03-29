"use strict";

var QRCode = require("utils/qrcode");
var gd = require('gd');
var image = require('utils/image');
var http = require("http");
/*
 *二维码备注：
 *二维码规格由var _htOption = {}
 *前端二维码格式为 http://name.cn/nqr/群组号?hs=图片哈希.c
 *例：
 *		http://127.0.0.1:81/nqr/69?hs=c9c2dd8f6febda0175f541c4606cc9bc.c10x8x279x180
 */
module.exports = function(v, u) {
	if (v.firstHeader('If-Modified-Since')) {
		v.response.status = 304;
		return;
	}

	v.response.addHeader('Last-Modified', 'Mon, 26 Nov 2012 00:00:00 GMT');
	v.response.addHeader('Cache-Control', "max-age=" + 10 * 365 * 24 * 60 * 60);
	v.response.addHeader('Content-Type', 'image/jpeg');

	var type = v.query.type || "";

	var _htOption = {
		width: 800,
		height: 800
	};
	var qrcode = new QRCode(_htOption);
	var imgbase = qrcode.makeCode(encodeURI("http://named.cn/" + u));

	//群组图片
	var hs = v.query.hs;
	v.response.body.write(imgbase.getData(gd.JPEG));
};