"use strict";

var db = require('db');
var util = require("util");
var Pool = require('utils/pool');

var poolCache = new util.LruCache(32, 0);
var linkdic = {};
var n = 0;

function _open(config) {
	var t = new Date();
	var conn = db.open(config);
	if (conn.txBufferSize) conn.txBufferSize = 16777220;
	if (conn.rxBufferSize) conn.rxBufferSize = 16777220;
	conn.connid = ++n;

	if (linkdic[config] === undefined) linkdic[config] = 0;
	linkdic[config]++;
	return conn;
}

module.exports = function(name, engine, connString, limit) {

	var pool = poolCache.get(connString, function() {
		return Pool(name, function() {
			var t = new Date();
			var conn = _open(connString);
			//附件表内图片太大不记录日志了
			if (engine === "storage")
				return conn;
			return {
				dispose: function() {
					conn.dispose();
					if (linkdic[connString] !== undefined) linkdic[connString]--;
					conn.error = (new Error("Dispose error stack")).stack;
				},
				getconnid: function(str) {
					return conn.connid;
				},
				begin: function() {
					conn.begin();
				},
				commit: function() {
					conn.commit();
				},
				rollback: function() {
					conn.rollback();
				},
				execute: function() {
					var params = Array.prototype.slice.call(arguments);
					var t = new Date();
					if (conn.error) console.error(conn.error);
					var rs = conn.execute.apply(conn, params);
					return rs;
				},
				format: function() {
					return conn.format.apply(conn, Array.prototype.slice.call(arguments));
				}
			}
		}, limit);
	});
	return require("./" + engine)(pool);
}