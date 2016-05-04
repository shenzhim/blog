"use strict";

var uuid = require('uuid');
var hash = require('hash');
var dbSession = require("dbs/dbManager").session;
var encoding = require('encoding');
var coroutine = require('coroutine');
var response = require('utils/response');
var apps = require("apps");
var apploader = apps.apploader;
var util = require('util');
var object = require('modules/object').app;

function getSessionId() {
	var fib = coroutine.current();
	return fib.sessionid;
}

var session = {
	create: function() {
		var s = {};
		while (true) {
			var sid = uuid.random().toString();
			var r = dbSession.get(sid);
			if (!r) {
				dbSession.put(sid, s);
				return sid;
			}
		}
	},
	get: function(sid) {
		if (sid && sid.length === 36) {
			var s = dbSession.getJSON(sid);
			if (s) {
				s["id"] = sid;
				return s;
			}
		}
		return {};
	},
	put: function(sid, d) {
		if (sid && !d) {
			d = sid;
			sid = getSessionId();
		}
		return dbSession.put(sid, d);
	},
	clear: function() {
		dbSession.clear(7 * 24 * 60 * 60 * 1000);
	}
};

function initSession(v) {
	var sid = getSessionId();
	var host = v.headers["host"] || "";
	var domain = "";
	if (host) {
		host = host.split(":")[0];
		if (host.search(/shenzm\.cn/i) !== -1)
			domain = "; domain=shenzm.cn";
	}

	if (!sid) {
		sid = session.create();
		v.cookies.set("sessionid", sid);
		v.response.addHeader("set-cookie", "sessionid=" + sid + "; path=/" + domain);
	}
	if (host.search(/shenzm\.cn/i) !== -1) {
		v.response.addHeader("set-cookie", "sessionid=" + sid + "; Expires=" + new Date(0) + "; path=/" + "; domain=shenzm.cn");
	}
	v.response.addHeader("set-cookie", "sessionpid=" + sid + "; Expires=" + new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toGMTString() + "; path=/" + domain);
	v.response.addHeader("P3P", "CP=CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR");
	return sid;
}

function _session2userid(sid) {
	var fib = coroutine.current();
	var s = session.get(sid);
	fib.sessionid = s["id"] || "";
	fib.userid = Number(s["userid"]) || 0;
}

function resetSession() {
	_session2userid(coroutine.current().sessionid);
}

module.exports = {
	root: {
		create: session.create,
		get: session.get,
		put: session.put,
		getSessionId: getSessionId,
		resetSession: resetSession
	},
	app: {
		initSession: initSession,
		get: session.get,
		_session2userid: _session2userid,
		session2userid: function(v) {
			if (v.headers["host"])
				v.hostname = v.headers["host"].split(":")[0];
			coroutine.current().request = v;
			return _session2userid(v.cookies["sessionid"] || v.cookies["sessionpid"]);
		},
		getUpdate: function(sid, op, v1, v2) {
			return hash.md5(getSessionId()).digest().hex();
		}
	},
	api: {
		sync: function(v) {
			var r = {
				update: new Date()
			};

			var sid = initSession(v);

			var fib = coroutine.current();
			var id = fib.userid;
			if (id > 0) {
				r = object.get(id, "base").user;
			} else {
				r["id"] = 0;
			}

			r["session"] = !!sid;
			r["token"] = hash.md5(sid).digest().hex();
			return r;
		},
		signout: function(v) {
			var sid = getSessionId();
			var fib = coroutine.current();

			//new session
			fib.sessionid = "";
			fib.userid = 0;
			initSession(v);

			//clear Session 最终去掉
			session.put(sid, {
				"userid": 0
			});
			return 0;
		}
	}
}