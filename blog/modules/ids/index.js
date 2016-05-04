"use strict";

var ids = require("dbs/dbManager").ids;
var _name2ids = require("dbs/dbManager").name2Ids;
var util = require('util');
var _LRU = new util.LruCache(5000, 1 || 24 * 60 * 60 * 1000); //bug触发太多次了，我先删除掉.

//!!大小写的问题
var name2ids = {
	get: function(name) {
		name = name.toLowerCase();
		var r = _LRU.get(name, function(name) {
			return _name2ids.get(name);
		});

		if (!r) _LRU.remove(name);

		return r;
	},
	remove: function(id, name) {
		name = name.toLowerCase();
		_LRU.remove(name);
		_name2ids.remove(id, name);
	},
	put: function(id, name) {
		name = name.toLowerCase();
		_name2ids.put(id, name);
		_LRU.put(name, id);
	}
}

function get(v) {
	if (util.isArray(v)) {
		return v.map(function(v) {
			return get(v);
		});
	}
	if (util.isObject(v)) {
		for (var i in v)
			v[i] = get(i);
		return v;
	}
	return name2ids.get(v);
}

function put(id, v) {
	if (util.isObject(v)) {
		var a = [];
		for (var i in v) {
			if (put(id, v[i])) a.push(v[i]);
			else {
				for (var j in a) name2ids.remove(id, a[j]);
				return false;
			}
		}
		return true;
	}
	if (get(v) !== 0) return false;
	name2ids.put(id, v);
	return true;
}

function remove(id, v) {
	if (util.isArray(v)) {
		v.forEach(function(v) {
			remove(id, v);
		});
		return true;
	}

	if (util.isObject(v)) {
		for (var i in v)
			remove(id, v[i]);
		return true;
	}

	name2ids.remove(id, v);
	return true;
}

function check(v) {
	if (util.isObject(v)) {
		if (util.isEmpty(v)) return false;
		for (var i in v)
			if (!check(v[i])) return false;
		return true;
	}

	if (!v) return true;
	return get(v) !== 0;
}


module.exports = {
	genObjectId: function(v) {
		if (!v || check(v)) return 0;

		var id = ids.genId("object");
		if (!put(id, v)) return 0;
		return id;
	},
	genId: function(k) {
		return ids.genId(k);
	},
	check: check,
	get: get,
	put: put,
	remove: remove,
	maxId: function(k) {
		return ids.maxId(k || "object");
	}
}