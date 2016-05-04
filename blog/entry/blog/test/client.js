"use strict";
require("test").setup();

var http = require('http');
var mq = require('mq');
var db = require("db");
var util = require('util');
var coroutine = require("coroutine");
var ids = require('modules/ids')
var dbapi = require('modules/dbapi');
var apps = require("apps");
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var appIdsManage = apploader[0].root.object.getAppIdsManage();

var conn = db.open(require('application').database.dbTable.connString);
module.exports = function(handler) {
	function invoke(url, method, params, headers, d) {
		if (method && !params && !headers) {
			headers = method;
			method = null;
		}

		var req = new http.Request();
		req.address = req.value = url;
		if (headers) req.setHeader(headers);

		if (d) {
			req.body.write(d);
			req.body.rewind();
			req.method = 'POST';
		} else if (method || params) {
			req.setHeader("Content-Type", "application/json, charset=utf-8;");
			req.body.write(new Buffer(JSON.stringify({
				method: method,
				params: params,
				id: 1234
			})));
		}

		mq.invoke(handler, req);

		req.response.body.rewind();

		function hander(req) {
			var s1 = req.response.body.readAll() || String("");
			var s = s1.toString();
			var extend = {
				toBuffer: function() {
					return s1;
				},
				toString: function() {
					return s;
				},
				toJSON: function() {
					return JSON.parse(s);
				},
				toName: function() {
					return s.substr(21, s.length - 21 - 11);
				},
				toNameJSON: function() {
					return JSON.parse(s.substr(21, s.length - 21 - 11));
				},
				toDefine: function() {
					var result;
					new Function("define", s)(function(val) {
						result = val;
					});
					return result;
				}
			}

			return {
				get: function(receiver, name) {
					return extend[name] || req.response[name];
				}
			}
		}

		return Proxy.create(hander(req));
	}

	return function() {
		var o = this;
		var r = invoke('/xhr/session', 'sync', []);
		o.sid = r.headers["set-cookie"].substr(10, 36);
		o.maxid = ids.maxId("object");

		this.initUser = function(id) {
			dbapi(2)[id].getObject().save({
				phone: "13812345678"
			});
		}

		function rest() {
			//	/module/fn
			//	/id/app/fn
			var url = Array.prototype.slice.call(arguments).join("/");
			return function(params) {
				url = url + "." + Array.prototype.slice.call(arguments).join(".");
				return invoke('/rest/' + url, {
					"cookie": "sessionid=" + o.sid
				}).toDefine();
			};
		}

		function xhr() {
			//	/module
			//	/id/app
			var a = Array.prototype.slice.call(arguments);
			var url = a.slice(0, a.length - 1).join("/");
			var fn = a[a.length - 1];
			return function(params) {
				return invoke('/xhr/' + url, fn, params ? [params] : [], {
					"cookie": "sessionid=" + o.sid
				}).toJSON();
			}
		}

		this.module = {
			xhr: xhr,
			rest: rest
		}

		this.app = {
			xhr: xhr,
			rest: rest
		}

		this.notify = {
			action: function(pid) {
				return function(params) {
					return invoke('/notify2/' + pid, "action", params ? [params] : [], {
						"cookie": "sessionid=" + o.sid
					}).toJSON();
				}
			},
			sync: function(pid) {
				return function(syncid) {
					return invoke('/notify2/' + pid + "/" + syncid, {
						"cookie": "sessionid=" + o.sid
					});
				}
			}
		}

		this.stream = function(url, ct) {
			return function(d) {
				if (ct === "video/mpeg4") {
					return invoke('/rest/storage/' + url, '', '', {
						"Content-type": "video/mpeg4",
						"cookie": "sessionid=" + o.sid
					}, d).toJSON();
				}
				return invoke('/rest/storage/' + url, '', '', {
					"Content-type": "application/octet-stream",
					"cookie": "sessionid=" + o.sid
				}, d).toJSON();
			};
		};

		this.storage = function(url) {
			return function(d) {
				return invoke('/rest/storage/' + url, '', '', {
					"Content-type": "multipart/form-data;boundary=7d33a816d302b6",
					"cookie": "sessionid=" + o.sid
				}, d).toNameJSON();
			};
		};

		this.file = function(url) {
			return invoke('/f/' + url);
		};

		this.appcheck = function(id) {
			var obj = dbapi(1)[id].getObject(),
				allowapps = util.keys(obj.apps);

			var callback = function(info) {
				console.error(info);
			};
			allowapps.forEach(function(appid) {
				appid = Number(appid);
				var appname = appManage.id2name(appid)
				var cfg = appManage.getconfig(appname);
				assert.ok(appIdsManage.count(Number(appid), cfg.version, id));
				assert.ok(apps(appname).root.base.appcheck(cfg, id, callback));
			});
			this.clearappIds(id);
		}

		var isCheck;

		this.clear = function(id) {
			while (apps.getPending()) {
				coroutine.sleep(1);
			}
			var o = this;
			if (!isCheck) {
				isCheck = true;
				var checkids = util.isArray(id) ? id : [id];
				checkids.forEach(o.appcheck.bind(o));
			}
			if (util.isArray(id)) {
				id.forEach(function(id) {
					o.clear(id);
				});
				return;
			};

			var c = dbapi(1)[id].getObject();
			switch (c["root"]) {
				case 2:
				case 21:
					var obj = dbapi(1)[id].getJSON();
					var name = obj.names.name;
					if (name) ids.remove(id, name);
					var phonenumber = obj.names.phonenumber;
					if (phonenumber) ids.remove(id, phonenumber);
					var mail = obj.names.mail;
					var snskey = obj.names.snskey;
					if (mail) ids.remove(id, mail);
					if (snskey) ids.remove(id, snskey);
					break;
				case 3:
					ids.remove(id, dbapi(3)[id].getObject().name);
					break;
				case 7:
					ids.remove(id, dbapi(7)[id].getObject().name);
					break;
			}
			conn.execute("DELETE FROM data WHERE id=?;", id);
		}

		this.wait = function() {
			coroutine.sleep(1);
			while (apps.getPending()) {
				coroutine.sleep(1);
			}
		}

		this.clearAttachment = function(k) {
			var o = this;
			if (util.isArray(k)) {
				k.forEach(function(k) {
					o.clearAttachment(k);
				});
				return;
			};
			conn.execute("DELETE FROM attachment WHERE k=?;", k);
			conn.execute("DELETE FROM attachinfo WHERE k=?;", k);
		}

		this.clearappIds = function(id) {
			var o = this;
			if (util.isArray(id)) {
				id.forEach(function(id) {
					o.clearappIds(id);
				});
				return;
			}
			conn.execute("DELETE FROM appIds WHERE id=?;", id)
		}

		this.clearInvitecode = function(code) {
			var o = this;
			if (util.isArray(code)) {
				code.forEach(function(code) {
					o.clearInvitecode(code);
				});
				return;
			};
			conn.execute("DELETE FROM invitecode WHERE code=?;", code);
		}

		this.clearCache = function(id, type, appid) {
			var object = require("modules/object").app;
			if (appid && util.isArray(appid)) {
				appid.forEach(function(a) {
					object.clearCache(id, type, a);
				});
				return;
			} else {
				object.clearCache(id, type, appid);
			}
		}

		this.clearDataCache = function(k) {
			var o = this;
			if (util.isArray(k)) {
				k.forEach(function(_k) {
					o.clearDataCache(_k);
				});
				return;
			}
			var dataCache = require("dbs/dbManager").dataCache;
			dataCache.remove(k);
		}
	}
}