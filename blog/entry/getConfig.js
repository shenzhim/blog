"use strict"

var util = require('util');
module.exports = function getConfByService(service, mod) {
	var fconfig = {},
		config = require("entry/config/" + mod + "/config");

	for (var k in config) {
		if (k === "runtime") {
			fconfig[k] = {};
			for (var k1 in config[k])
				if (k1.indexOf(service + ".") > -1 || k1.indexOf(".") === -1) {
					var lk = k1.split('.');
					lk = lk[lk.length - 1];
					fconfig[k][lk] = fconfig[k][lk] ? fconfig[k][lk] : {};
					if (util.isObject(config[k][k1])) {
						for (var i in config[k][k1]) fconfig[k][lk][i] = config[k][k1][i];
					} else fconfig[k][lk] = config[k][k1];
				}
		} else {
			if (k.indexOf(service + ".") > -1) {
				var lk = k.split('.');
				fconfig[lk[1]] = config[k];
			} else if (k.indexOf(".") === -1) fconfig[k] = fconfig[k] ? fconfig[k] : config[k];
		}
	}
	return fconfig;
};