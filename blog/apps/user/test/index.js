"use strict";
require("test").setup();

var hash = require('hash')
var client = require('client');
var dbapi = require("modules/dbapi");
var apps = require('apps');
var storage = require("modules/storage").app;
var util = require("util");
var gd = require("gd");
var session = require("modules/session").root;
var object = require("modules/object");

describe("user", function() {
	var c,
		userid,
		ids = [],
		pics = [],
		uploadImg,
		creatclient,
		checksignin;
	before(function() {
		c = new client();
		uploadImg = function(d) {
			var img = gd.create(d.width, d.height);
			var data = {
				png: img.getData(gd.PNG),
				jpeg: img.getData(gd.JPEG, 85)
			}
			assert.equal(data.png.length < data.jpeg.length, true);
			var r = c.stream("photo")(data[d.type]);
			assert.deepEqual(r.id, d.source);

			pics.push(d.source);

			var info = storage.getInfo(d.source);
			assert.ok(info.created !== undefined);
			util.keys(d).forEach(function(k) {
				if (k === "source") return;
				assert.equal(d[k], info[k]);
			});

			var params = {
				"icon": d.source,
				"icon_crop_size": 100,
				"icon_crop_left": 0,
				"icon_crop_top": 0
			};
			r = c.app.xhr("青蛙青蛙", "user", "update")(params).result;
			assert.equal(r, 0);
			var obj = dbapi(2)[c.maxid + 1].getJSON();
			assert.equal(obj.icon.crop, undefined); //数据库不存储crop字段
		}

		creatclient = function(d, result, cl) {
			var password = hash.md5("123456").digest().hex();
			assert.equal(password, "e10adc3949ba59abbe56e057f20f883e");

			d["hpass1"] = hash.hmac_md5(d["mail"].toLowerCase()).digest(password).hex();
			d["hpass2"] = hash.hmac_md5(d["name"].toLowerCase()).digest(password).hex();

			var r = (cl || c).app.xhr(0, "user", "signup")(d).result;
			assert.deepEqual(r, result);
			if (Number(r)) ids.push(r);
		}

		checksignin = function(d) {
			var password = hash.md5(d["password"]).digest().hex();
			password = hash.hmac_md5(d["name"].toLowerCase()).digest(password).hex();
			password = hash.hmac_md5(c.sid).digest(password).hex();

			var r = c.app.xhr(0, "user", "signin")({
				"mail": d["name"].toLowerCase(),
				"hpass": password
			}).result;
			assert.equal(r, 0);
		}
	});

	after(function() {
		c.clear(ids);
		c.clearAttachment(pics);
	});

	it("成功注册用户", function() {
		var d = {
			"mail": "reg@qinwa.net",
			"name": "青蛙青蛙",
			"intro": "test"
		};

		userid = c.maxid + 1;
		creatclient(d, userid);
		assert.deepEqual(d, {
			"mail": "reg@qinwa.net",
			"name": "青蛙青蛙",
			"hpass1": "4cbe5e8552a4a92aec8cb36fc588e771",
			"hpass2": "19c6807b5f4050a42a2949b0de051f94",
			"intro": "test"
		});

		assert.deepEqual(dbapi(1)[userid].getJSON().apps, {
			"1": 1,
			"2": 1,
			"4": 1
		})
		assert.equal(dbapi(4)[userid].blog.get("sorts"), 0);
	});

	it("用户上传头像-png类型", function() {
		uploadImg({
			width: 200,
			height: 200,
			source: "ba43543787b2f0b4ca0e277bac888095",
			type: "png",
			size: 216,
			isdelete: 0,
			exif: "",
			userid: c.maxid + 1
		});
	});

});