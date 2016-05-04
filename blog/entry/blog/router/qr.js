"use strict";

var QRCode = require("utils/qrcode");
var gd = require('gd');
var image = require('utils/image');
var storage = require("modules/storage").app;
var http = require("http");
var ssl = require("ssl");
ssl.ca.loadRootCerts();
ssl.max_version = ssl.tls1_1;
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
	if (type === "weixin") {
		var qrimg = gd.load(http.get("https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + u).readAll()).resample(360, 360);
		var baseimg = gd.load(storage.getValue("04558e407a3a1c0d893f7862eef7abe8"));

		baseimg.copy(qrimg, 140, 60, 0, 0, 360, 360);
		baseimg = baseimg.resample(400, 400);

		v.response.write(baseimg.getData(gd.JPEG, 50));
		return;
	}

	var _htOption = {
		width: 800,
		height: 800
	};
	var qrcode = new QRCode(_htOption);
	var imgbase = qrcode.makeCode(encodeURI("http://named.cn/" + u));

	//群组图片
	var hs = v.query.hs;
	if (!hs) {
		v.response.body.write(imgbase.getData(gd.JPEG));
	} else {
		// + 图片缩放 图片格式
		var groupimg = hs + ".t180x180.jpg";
		//将群组图片信息还原
		var url2img = require('utils/url2img');
		var newimg = url2img(v, groupimg);
		newimg = image.loadimg(newimg);
		imgbase = gd.load(imgbase.getData(gd.JPEG));

		if (newimg) {
			function drawPixel(newimg, imgbase) {
				var h = newimg.height,
					w = newimg.width;
				var oh = imgbase.height,
					ow = imgbase.width;
				var nw = ow / 3,
					nh = oh / 3;
				var white = gd.rgb(255, 255, 255);
				imgbase.copyResized(newimg, nw, nh, 0, 0, nw, nh, w, h);

				for (var x = 0; x < nw; x++) {
					for (var j = 0; j < 5; j++) {
						imgbase.setPixel(nw + x, nh + j, white);
						imgbase.setPixel(nw + x, 2 * nh - j, white);
					}
				}
				for (var y = 0; y < nh; y++) {
					for (var i = 0; i < 5; i++) {
						imgbase.setPixel(nw + i, nh + y, white);
						imgbase.setPixel(2 * nw - i, nh + y, white);
					}
				}
				return imgbase;
			}
			var res = drawPixel(newimg, imgbase);
			v.response.body.write(res.getData(gd.JPEG));
		}
	}
};