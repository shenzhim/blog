"use strict";

var fib = require("fib");
var apploader = require("apploader");
var hash = require('hash');
var util = require('util');
var object = require("modules/object");
var session = require("modules/session");
var dbapi = require("modules/dbapi");
var base = exports.base = require("apps/base");

exports.JOB = {}

function omit(e) {
	return util.omit(e || {}, ["isphone", "issns", "status"]);
}

function auth(id, sid, hpass) {
	var d = dbapi[id].getJSON();
	var token = hash.md5(sid).digest().hex();
	if (hpass === hash.hmac_md5(token).digest(d["hpass1"]).hex()) return true;
	if (hpass === hash.hmac_md5(token).digest(d["hpass2"]).hex()) return true;
	if (hpass === hash.hmac_md5(token).digest(d["hpass3"]).hex()) return true;

	return false;
}

exports.init = function(id, e) {
	base.init(id);

	var obj = dbapi[id].createObject();
	var d = {
		name: e["name"],
		mail: e["mail"],
		hpass1: e["hpass1"],
		hpass2: e["hpass2"]
	};
	obj.save(d);
	return true;
}

var getPower = exports.getPower = function(id, type) {
	var userid = fib.userid();
	type = util.isString(type) ? type.split("_")[0] : type;
	switch (type) {
		case "base":
			return true;
		default:
			return userid && userid === id;
	}
}

var get = exports.get = function(id, type) {
	var a,
		d = {},
		icon;
	if (id) {
		d = dbapi[id].getJSON();
		icon = d["icon"];
		if (icon)
			icon["crop"] = icon["source"] + ".c" + [icon["x"], icon["y"], icon["size"], 180].join("x"); //兼容老前端通过crop取图片，等洗完数据后一周删除。
	}
	a = type.split("_");
	switch (a[0] || "") {
		case "base":
			return {
				id: id,
				name: d["name"]
			};
		default:
			return undefined;
	}
}

exports.getIds = function(id, type, d) {
	var a = type.split("_");
	switch (a[0]) {
		default: return undefined;
	}
}

exports.fill = function(id, type, d, ds) {
	var a = type.split("_");
	switch (a[0]) {
		default: return d;
	}
}

exports.getInfo = function(id) {
	var d = dbapi[id].getJSON(),
		icon = d["icon"];
	if (icon)
		icon["crop"] = icon["source"] + ".c" + [icon["x"], icon["y"], icon["size"], 180].join("x"); //兼容老前端通过crop取图片，等洗完数据后一周删除。
	return {
		id: d['id'],
		mail: d['mail'],
		name: d['name'],
		icon: icon
	}
}

exports.EVENT = {}

exports.API = {
	update: function(id, e) {
		var d = dbapi[id].getObject();
		var v = {};
		if (e["icon"]) {
			v["icon"] = {
				x: parseInt(e["icon_crop_left"]),
				y: parseInt(e["icon_crop_top"]),
				size: parseInt(e["icon_crop_size"]),
				source: e["icon"]
			}
		}

		d.save(v);
		object.clearCache(id, ["base"]);
		return true;
	},
	signup: function(id, e) {
		e = omit(e);
		var sid = session.getSessionId();
		var id = object.create(0, "", "", "user", e, ["name", "mail"], {
			"blog": {}
		});
		if (!util.isNumber(id)) return {
			error: id
		};
		session.put(sid, {
			"created": new Date(),
			"userid": id
		});
		return id;
	},
	signin: function(id, e) {
		var sid = session.getSessionId();
		var uid = object.getid(e["mail"]);
		if (uid === 0) return {
			error: "mail is error"
		}

		if (!auth(uid, sid, e["hpass"])) return {
			error: "password is error"
		};

		var s = session.get(sid);
		session.put(sid, {
			userid: uid,
			deviceid: 0,
		});
		return true;
	}
}