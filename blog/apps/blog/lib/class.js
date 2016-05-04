"use strict";

var fib = require("fib");
var apploader = require("apploader");
var dbapi = require("modules/dbapi");
var base = exports.base = require("apps/base");
var object = require("modules/object");
var util = require("util");

exports.init = function(id, e) {
	base.init(id);
	dbapi[id].blog.put("sorts", 0);
	return true;
}

var getPower = exports.getPower = function(id, type, userid) {
	return true;
}

exports.get = function(id, type) {
	var tb = dbapi[id].blog;
	switch (type) {
		case "blog":
			var rs = tb.tags("", 10, [], "desc");
			return {
				list: rs.map(function(d) {
					return {
						bindid: d.bindid,
						_tags: d._tags,
						sort: d.sort
					}
				}),
				count: tb.count(),
				user: id
			}

		default:
			return undefined;
	}
}

exports.getIds = function(id, type, d) {
	switch (type) {
		case "blog":
			var r = {
				block: d.list.map(function(d) {
					return d.bindid;
				})
			};
			if (d.user) r.base = [d.user];
			return r;
	}
}

exports.fill = function(id, type, d, ds) {
	switch (type) {
		case "blog":
			return {
				user: ds["base_" + d["user"]],
				list: d.list.map(function(d) {
					return {
						data: ds["block_" + d["bindid"]],
						_tags: d["_tags"],
						sort: d["sort"]
					}
				}),
				count: d.count
			}
			break;
	}
	return d;
}

exports.EVENT = {}

exports.API = {
	post: function(id, e) {
		var userid = fib.userid();
		userid = 1;
		// if (!getPower(userid, "blog")) return {
		// 	error: "noPower"
		// }

		var id = object.create(userid, "bbs", "", "message", e, []);
		if (!util.isNumber(id)) return {
			error: id
		};

		var tb = dbapi[userid].blog;
		tb.put({
			tag: "",
			bindid: id
		});

		object.clearCache(userid, ["blog"]);
		return id;
	},
	remove: function(id, e) {
		var userid = fib.userid();
		if (!getPower(userid, "blog")) return {
			error: "noPower"
		}

		if (!d["msgid"]) return {
			error: "param error"
		}

		dbapi[userid].blog.removeTag("", d["msgid"]);
		object.clearCache(userid, ["blog"]);
		return true;
	},
	list: function(id, list, tag, sort, order) {
		if (!getPower(id, "blog")) return {
			error: "noPower"
		};

		if (["blog"].indexOf(list) === -1 || tag === "" || (sort && isNaN(Number(sort)))) return {
			error: "param error"
		}

		var rs = dbapi[id][list].tags(tag, 10, sort, order);
		return object.load(rs, "block", function(r, d) {
			d["_tags"] = r["_tags"];
			return d;
		});
	}
}