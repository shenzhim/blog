"use strict";
var fs = require('fs');
var gd = require('gd');
var image = require('utils/image');
var storage = require('modules/storage').app;
var imgtype = {
	jpg: image.JPEG,
	png: image.PNG,
	gif: image.GIF
};
var util = require("util");
var imgCache = new util.LruCache(100, 1000);

var urlfilter = {
	t: function t(img, fn) {
		var h_w = fn.split("x");
		if (h_w.length !== 2) return;

		var w = Number(h_w[0]) || 0,
			h = Number(h_w[1]) || 0;
		if (w <= 0 || h <= 0) return;

		var h1 = parseInt(w * img.height / img.width);
		if (h <= 720 || h <= h1) {
			if (h1 === h) return image.resampleimg(img, w, h);
			return image.thumbnail(img, w, h);
		}
	},
	g: function g(img, n) {
		n = Number(n);
		if (isNaN(n)) return;
		img.gaussianBlur(n);
		return img;
	},
	o: function o(img, fn) {
		var h_w = fn.split("x");
		if (h_w.length !== 2) return;

		var w = Number(h_w[0]) || 0,
			h = Number(h_w[1]) || 0;
		if (w <= 0 || h <= 0) return;

		var rate = w / h;
		var imgrate = img.width / img.height;

		if (rate < imgrate) {
			var w1 = parseInt(h / img.height * img.width);
			return img.resample(w1, h).crop((w1 - w) / 2, 0, w, h);
		} else {
			var h1 = parseInt(w / img.width * img.height);
			return img.resample(w, h1).crop(0, (h1 - h) / 2, w, h);
		}
	},
	s: function s(img, fn) {
		var p = fn.split("_"),
			len = p.length,
			w = img.width,
			h = img.height;
		if (w > 360 || h > 360 || !len || len > 4) return;


		var v = [];
		for (var i = 0; i < len; i++) {
			var t = p[i].split("x");
			if (t.length !== 3) return;

			var x = Number(t[0]),
				y = Number(t[1]),
				c = parseInt("0x" + t[2]);
			if (isNaN(x) || isNaN(y) || isNaN(c) || c > 0xffffff || Math.abs(x) > w || Math.abs(y) > h) return;
			v.push([x, y, c]);
		}
		return image.shadow(img, v);
	},
	b: function b(img, fn) {
		var p = fn.split("x"),
			w = img.width,
			h = img.height;
		if (w > 720 || h > 500) return;

		var color = parseInt("0x" + p.pop());
		if (isNaN(color) || color > 0xffffff) return;

		var a = 0,
			b = 0,
			c = 0,
			d = 0;
		switch (p.length) {
			case 1:
				a = b = c = d = Number(p[0]);
				break;
			case 2:
				a = c = Number(p[0]);
				b = d = Number(p[1]);
				break;
			case 4:
				a = Number(p[0]);
				b = Number(p[1]);
				c = Number(p[2]);
				d = Number(p[3]);
				break;
			default:
				return;
		}
		if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) ||
			a < 0 || b < 0 || c < 0 || d < 0 ||
			b > w || d > w || a > h || c > h)
			return;

		var v = [
			[d * -1, a * -1, color],
			[b, a * -1, color],
			[b, c, color],
			[d * -1, c, color]
		];
		return image.shadow(img, v);
	},
	r: function r(img, fn) {
		var w = img.width,
			h = img.height;

		var r = fn.split("x"),
			len = r.length;
		if (!len || len > 4) return;

		var r1,
			r2,
			r3,
			r4;
		switch (len) {
			case 1:
				r2 = r3 = r4 = r1 = Number(r[0]);
				break;
			case 2:
				r4 = r2 = Number(r[1]);
				r3 = r1 = Number(r[0]);
				break;
			case 3:
				r1 = Number(r[0]);
				r4 = r2 = Number(r[1]);
				r3 = Number(r[2]);
				break;
			case 4:
				r1 = Number(r[0]);
				r2 = Number(r[1]);
				r3 = Number(r[2]);
				r4 = Number(r[3]);
				break;
		}
		if (isNaN(r1) || isNaN(r2) || isNaN(r3) || isNaN(r4) || (!r1 && !r2 && !r3 && !r4) || r1 < 0 || r2 < 0 || r3 < 0 || r4 < 0) return;
		return image.radius(img, [r1, r2, r3, r4])
	},
	fa: function fa(img, fn) {
		if (img.width > 720 || img.height > 500) return;
		fn = fn.split("x");
		var percent = fn[0];
		var color = fn[1];
		return image.copyalpha(img, percent, color);
	},
	fc: function fc(img) {
		var h = img.height,
			w = img.width;
		if (w > 180 || h > 180 || h !== w) return;
		return image.circle(img, w, h, h / 2);
	},
	l: function l(img, fn) {
		if (img.width > 720 || img.height > 500) return;
		var c = parseInt("0x" + fn);
		if (isNaN(c) || c > 0xffffff) return;
		return image.copybackground(img, Number(c));
	},
	c: function c(img, fn) {
		fn = fn.split("x");
		if (fn.length !== 4) return;

		var r = true;
		fn = fn.map(function(p) {
			p = parseInt(p);
			if (isNaN(p)) r = false;
			return p;
		});

		if (!r) return;
		return image.crop(img, fn[0], fn[1], fn[2], fn[3]);
	},
	dr: function cr(img, fn) {
		fn = fn.split("x");
		if (fn.length !== 4) return;

		var r = true;
		fn = fn.map(function(p) {
			p = parseInt(p);
			if (isNaN(p)) r = false;
			return p;
		});

		if (!r) return;
		var w = img.width,
			h = img.height;
		if (fn[0] > w || fn[1] > h || fn[0] + fn[2] > w || fn[1] + fn[3] > h) return;
		return img.crop(fn[0], fn[1], fn[2], fn[3]);
	},
	pr: function pr(img) {
		if (img.progressive === true) return img;
		img.progressive = true;
		return img;
	},
	m: function m(img, fn) {
		if (!util.isArray(img)) return;
		var n = img.length;
		var h_w = fn.split("x");
		if (h_w.length !== 2) return;

		var w = Number(h_w[0]) || 0,
			h = Number(h_w[1]) || 0;
		if (w <= 0 || h <= 0) return;
		var w1 = Math.floor((w - (n - 1) * 2) / n),
			h1 = h;
		var mergeimg = gd.create(w, h);
		mergeimg.alphaBlending = false;
		mergeimg.filledRectangle(0, 0, w, h, 0x7f00ff00);
		mergeimg.alphaBlending = true;
		for (var i in img) {
			img[i] = urlfilter['t'](img[i], w1 + 'x' + h1);
			if (!img[i]) return;
			img[i] = urlfilter['r'](img[i], '4x4x4x4');
			if (!img[i]) return;
			mergeimg.copy(img[i], i * (2 + w1), 0, 0, 0, w1, h1);
		}
		return mergeimg;
	},
	pl: function pl(img) {
		var f = storage.getValue('d03da7beb3fb1159a45b246f8dbc6dfb'),
			play_btn = image.loadimg(f),
			w = img.width,
			h = img.height,
			w1 = play_btn.width,
			h1 = play_btn.height,
			x = Math.floor(w - w1),
			y = Math.floor(h - h1);

		play_btn.alphaBlending = true;
		if (img.format === image.GIF) img.convert(gd.TRUECOLOR);
		img.alphaBlending = true;

		img.copy(play_btn, x, y, 0, 0, w1, h1);
		return img;
	}
}

module.exports = function(v, d) {
	var p = d.split(".");

	var k = p.shift(),
		img;

	if (!k || (k.indexOf("/") > -1 && p.length < 2) || (k.indexOf("/") === -1 && p.length < 1)) {
		v.response.addHeader('Url-Error', 'parm/null');
		return;
	}

	var t = p.pop();
	if (!imgtype[t]) {
		v.response.addHeader('Url-Error', 'type/null');
		return;
	}
	v.response.addHeader('Content-Type', 'image/' + (t === "jpg" ? "jpeg" : t));

	return imgCache.get(d, function() {
		var f;
		if (k.indexOf("/") > -1) {
			var path = "../www/" + k + "." + p.shift();
			try {
				f = fs.open(path);
			} catch (e) {
				v.response.addHeader('Url-Error', 'file/null');
				return;
			}
			img = image.loadimg(f);
			f.close();
		} else if (k.indexOf('_') !== -1) {
			k = k.substr(1);
			var ks = k.split('_');
			img = [];
			for (var i in ks) {
				if (ks[i].length <= 15) return;
				var f = storage.getValue(ks[i]);
				if (!f) {
					v.response.addHeader('Url-Error', 'value/null');
					return;
				}
				img.push(image.loadimg(f));
			}
		} else if (k.length > 15) {
			f = storage.getValue(k);
			if (!f) {
				v.response.addHeader('Url-Error', 'value/null');
				return;
			}

			//考虑性能,当只有1种类型过滤器时直接返回
			if (!p.length)
				return f;

			img = image.loadimg(f);
		} else {
			if (k[0] === "n") {
				img = image.createimg(k.substr(1));
			}
			if (!img) {
				v.response.addHeader('Url-Error', 'key/error-' + k);
				return;
			}
		}

		if (img.format === gd.GIF) {
			img = image.loadimg(img.getData(gd.JPEG))
		}

		var quality;
		for (var i = 0; i < p.length; i++) {
			var n = p[i],
				fn = urlfilter[n] || urlfilter[n[0]] || urlfilter[n[0] + n[1]];
			if (n[0] === 'q') {
				quality = Number(n.substr(1));
				continue;
			}
			if (!fn) {
				v.response.addHeader('Url-Error', 'method/null-' + n);
				return;
			} else {
				img = fn(img, n.substr(fn.name.length));
				if (!img) {
					v.response.addHeader('Url-Error', 'method/error-' + n);
					return;
				}
			}
		}
		if (t === "jpg") img = urlfilter['pr'](img);
		return image.getData(img, imgtype[t], quality || 70);
	});
}