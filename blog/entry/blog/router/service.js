"use strict";

var rpc = require("rpc");
var encoding = require('encoding');
var util = require('util');

module.exports = {
	xhr: rpc.json(function(v) {
		//console.debug('api:value:%s;\nresult:%s;\nparams:%j\n', v.value, v.result, v.params.toJSON());
		var a = v.value.replace(/\//g, ".").split(".");
		console.error("xhr")
			//return callModule("xhr", v, a[0], a[1], v.params.toJSON());
	}),
	rest: function(v) {
		//console.debug('value:%s;\nresult:%s;\nparams:%j\n', v.value, v.result, v.params.toJSON());
		v.response.setHeader('Content-Type', 'application/x-javascript;charset=utf-8');
		var a = v.value.split("/");
		if (v.queryString) a.push(v.queryString);
		var b = a[a.length - 1].split(".");
		if (b.length > 1)
			a[a.length - 1] = b[0];

		b = b.slice(1);
		console.error("rest")
			//return callModule("amd", v, a[0], a[1], b);
	}
}