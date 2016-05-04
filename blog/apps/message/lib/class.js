"use strict";

var fib = require("fib");
var util = require('util');
var apploader = require("apploader");
var object = require("modules/object")
var dbapi = require("modules/dbapi");
var base = exports.base = require("apps/base");
var storage = require('modules/storage');
var Locker = {};

exports.JOB = {}

exports.init = function(id, e, fromid, fromappid) {
	base.init(id);
	var userid = Number(e["userid"] || fib.userid());
	var tb = dbapi[id],
		d = tb.createObject();

	d["title"] = e["title"];
	d["content"] = e["content"];
	d["summary"] = e["summary"];
	d["userid"] = userid;

	var attachment = e["attachment"],
		source;
	if (util.isArray(attachment) && attachment.length) {
		//兼容
		attachment = attachment.map(function(a) {
			source = util.isObject(a) ? a.source : a;
			return source;
		}).filter(function(f) {
			return !!f;
		});

		attachment = util.unique(attachment);
		var r = attachment.every(function(k) {
			return util.isString(k) && k.length === 32;
		});
		if (r && storage.getInfo(attachment).length === attachment.length) {
			d["attachment"] = attachment;
		}
	}

	d.save();
	tb.put("reads", "0");
	return true;
}

var getPower = exports.getPower = function(id, type, userid) {
	return true;
}

var get = exports.get = function(id, type) {
	var params = type.split("_");
	type = params[0];
	var d = dbapi[id].getJSON();

	var attachment = d["attachment"];
	if (attachment && attachment.length) {
		var infos = storage.getInfo(attachment);
		infos.forEach(function(d) {
			var k = d["k"];
			attachment[attachment.indexOf(k)] = {
				source: k,
				height: d.height,
				width: d.width,
				type: d.type
			}
		});
	}

	switch (type) {
		case "block":
			return {
				id: id,
				title: d["title"],
				content: d["content"],
				summary: d["summary"],
				attachment: attachment,
				user: d["userid"],
				created: d["created"]
			};
	}
}

exports.getIds = function(id, type, d) {
	type = type.split("_")[0];
	switch (type) {
		case "block":
			if (d["user"]) {
				var base = [d["user"]];
				return {
					base: base
				};
			}
	}

}

exports.fill = function(id, type, d, ds) {
	type = type.split("_")[0];
	switch (type) {
		case "block":
			d["user"] = ds["base_" + d.user];
			break;
	}
	return d;
}

exports.EVENT = {}

exports.API = {
	stat: function(id, e) {
		if (!getPower(id, "read")) {
			return {
				error: "noPower"
			};
		};
		return dbapi[id].inc("reads");
	}
}