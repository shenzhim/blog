"use strict";

var rpc = require("rpc");
var encoding = require('encoding');
var util = require('util');

var apps = require('apps');
var apploader = apps.apploader;
var appManage = apploader[0].root.object.getAppManage();
var response = require('utils/response');
var session = require('modules/session').app;
var object = require('modules/object').app;
var coroutine = require('coroutine');


function is_numeric(a) {
	return a - parseFloat(a) >= 0;
}

function check(p) {
	if (util.isArray(p))
		return p.some(check);
	else if (util.isObject(p))
		return util.values(p).some(check);
	else
		return /([\u0300-\u036f]{2,})|([\ud800-\udfff\ufeff\ufffd])/i.test(p);
}

var errorTip = "invalid unicode found at router!";

function callApp(method, v, sid, app, fns, p) {
	var r = check(p);
	if (r) {
		return {
			error: errorTip
		};
	}

	var id = 0;
	if (is_numeric(sid)) {
		id = Number(sid) || 0;
	} else {
		id = object.getid(encoding.decodeURI(sid));
		if (!id) {
			r = {
				"result": {
					"error": {
						"msg": "id is null"
					}
				}
			};

			if (method === "xhr") {
				return r;
			} else {
				return response.amd(v, r);
			}
		}
	}

	if (!app || !fns.length) {
		console.warn("empty! app:%s,fn%s", app, fn);
		return -1;
	}

	if (id > 0 && !object.isinstall(id, app)) {
		console.warn("callApp id:%d, not install apps:%s", id, app);
		return -1;
	}
	var appmod = apploader[id][app].api;
	for (var i in fns) {
		var fn = fns[i];
		appmod = appmod[fn];
		if (!appmod) {
			console.warn("app:%s, not have function:%s", app, fn);
			return -1;
		}
	}

	session.session2userid(v);

	if (p && p.length > 0) {
		// console.debug("\t%s.callApp:%s[%s](%d, %j)", method, app, fns, id, p);
		r = appmod.apply(null, p);
	} else {
		// console.debug("\t%s.callApp:%s[%s](%d)", method, app, fns, id);
		r = appmod();
	}

	if (method === "xhr") {
		if (r === true) r = 0;
		if (r === false) r = -1;
		return r;
	} else if (method === "amd") {
		if (r) response.amd(v, r);
	} else if (method === "raw") {
		response.write(v, r);
	}
}

function callModule(method, v, module, fn, p) {
	var r = check(p);
	if (r) {
		return {
			error: errorTip
		};
	}

	response = require('utils/response');
	if (!module || !fn) {
		console.warn("empty! module:%s,fn%s", module, fn);
		return;
	}

	var mod = require("modules/" + module).api;
	if (!mod[fn]) {
		console.warn("module:%s, not have function:%s", module, fn);
		return;
	}

	session.session2userid(v);

	if (p && p.length > 0) {
		// console.debug("\t%s.callModlue:%s[%s](%j)", method, module, fn, p);
		p.unshift(v);
		r = mod[fn].apply(null, p);
	} else {
		// console.debug("\t%s.callModlue:%s[%s](%d)", method, module, fn);
		r = mod[fn](v);
	}

	if (method === "xhr") {
		if (r === true) r = 0;
		if (r === false) r = -1;

		return r;
	} else if (method === "amd") {
		if (r) response.amd(v, r);
	} else if (method === "raw") {
		response.write(v, r);
	}
}

module.exports = {
	tmpl: function(v) {
		v.response.setHeader('Content-Type', 'text/html;charset=utf-8');
		var a = v.value.replace(/\//g, ".").split(".");
		return callModule("raw", v, "tmpl", "load", a);
	},
	raw: function(v) {
		v.response.setHeader('Content-Type', 'text/html;charset=utf-8');
		// console.notice('raw, api:value:%s;\nresult:%s;\nparams:%j\n', v.value, v.result, v.params.toJSON());
		var a = v.value.replace(/\//g, ".").split(".");
		if (a.length === 2) return callModule("raw", v, a[0], a[1], v.params.toJSON());
		else return callApp("raw", v, a[0], a[1], [a[2]], [a.slice(3)]);
	},
	xhr: rpc.json(function(v) {
		//console.debug('api:value:%s;\nresult:%s;\nparams:%j\n', v.value, v.result, v.params.toJSON());
		var a = v.value.replace(/\//g, ".").split(".");
		if (a.length === 2) return callModule("xhr", v, a[0], a[1], v.params.toJSON());
		else return callApp("xhr", v, a[0], a[1], a.slice(2), v.params.toJSON());
	}),
	rest: function(v) {
		v.response.setHeader('Content-Type', 'application/x-javascript;charset=utf-8');

		//console.debug('value:%s;\nresult:%s;\nparams:%j\n', v.value, v.result, v.params.toJSON());
		var a = v.value.split("/");
		if (v.queryString) a.push(v.queryString);
		var b = a[a.length - 1].split(".");
		if (b.length > 1)
			a[a.length - 1] = b[0];

		b = b.slice(1);

		if (appManage.check(a[1])) return callApp("amd", v, a[0], a[1], a.slice(2), b);
		else return callModule("amd", v, a[0], a[1], b);
	}
}