"use strict";

var util = require('util');
var coroutine = require('coroutine');
var env = require("application").env;
var batchEraseLRU = new util.LruCache(5000, env === "dev" ? 1 : 9 * 60 * 60 * 1000);

/*
db('appid')(ids[,hits])
		.put(key, value)
		.put({object})
		.get(tag)
		.inc(tag)
		.dec(tag)
		.getJSON([tag])
		.getObject([tag])
		.erase(tag)

		.count(tag, bindid)
		.all()
			.save({})
			.erase();
		.list(bindid, tag)
			.save({})
			.erase();
		.tags(tag, limit, range, order)
			.save({})
			.erase();

		}
*/

function proxy(o, fn) { //o访问器重载：[]或.访问时如果存在该属性则直接返回，否则调用fn返回
	return Proxy.create({
		get: function(receiver, name) {
			if (o && o[name]) return o[name];
			return fn(name);
		}
	});
}

function omitPK(v) {
	var PK = ["appid", "id", "list", "tag", "bindid", "sort", "created", "changed"];
	return util.omit(v, PK);
}

function isPositive(num) {
	return util.isNumber(num) ? Number(num) > 0 : util.isNumber(num);
}

function genModify(modify) {
	if (modify == null)
		return 1;
	else if (!isPositive(modify))
		throw new TypeError("inc param error: modify:" + modify);
	return modify;
}

function checkPower(dbTable, id, appid) {
	if (appid === 1) return true;
	var dbapi = new module.exports(1, dbTable);
	var c = dbapi[id].getJSON();
	if (c["apps"] && (c.root === appid || c["apps"][appid] !== undefined)) return true;
	throw new Error("dbapi.check id[" + id + "] have not install app[" + appid + "]");
	return false;
}

var handlerMaker = function(obj) {
	var objChange = {},
		objDelete = [],
		k = ["appid", "id", "list", "tag", "bindid", "created", "changed", "save", "erase", "toJSON", "oldsort", "sort"];

	objDelete.remove = function(v) {
		var len = this.length;
		for (var i = 0; i < len; i++) {
			if (this[i] === v) {
				this.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	return {
		enumerate: function() {
			var result = [];
			for (var name in obj) {
				if (["appid", "save", "erase", "valueOf"].indexOf(name) === -1) result.push(name);
			};
			for (var name in objChange) {
				result.push(name);
			};
			// return result[Symbol.iterator]();
			return result;
		},
		deleteProperty: function(receiver, name) {
			if (name in k) return false;
			if (util.has(obj, name)) objDelete.push(name);
			delete objChange[name];
			return true;
		},
		delete: function(name) {
			if (name in k) return false;
			if (util.has(obj, name)) objDelete.push(name);
			delete objChange[name];
			return true;
		},
		get: function(receiver, name) {
			if (name === "toString") return function() {
				return "[object DBROW]";
			}
			if (name === "toJSON") return function() {
				var v = obj.valueOf.call(obj, objChange, objDelete);
				return v;
			};
			if (["save", "erase"].indexOf(name) > -1) return obj[name].bind(obj, objChange, objDelete);
			var d = objChange[name];
			if (d !== undefined) return d;
			if (objDelete.indexOf(name) > -1) return undefined;
			return obj[name];
		},
		set: function(receiver, name, val) {
			if (k.slice(0, -1).indexOf(name) > -1) return true;
			objDelete.remove(name);
			objChange[name] = val;
			return true;
		}
	};
}

var fn = {
	valueOf: function(objChange, objDelete, objChange2) {
		var k = ["appid", "id", "list", "tag", "bindid", "created", "changed", "oldsort"];
		var v = this;
		if (objDelete.length > 0) {
			objDelete = util.without(objDelete, k);
			v = util.omit(v, objDelete);
		}

		if (!util.isEmpty(objChange)) {
			objChange = util.omit(objChange, k);
			v = util.extend(v, objChange);
		}

		if (util.isObject(objChange2)) {
			objChange2 = util.omit(objChange2, k);
			v = util.extend(v, objChange2);
		}
		return v;
	},
	save: function(dbTable, objChange, objDelete, objChange2) {
		if (!checkPower(dbTable, this.id, this.appid)) return;

		var r,
			v = this.valueOf(objChange, objDelete, objChange2),
			oldsort = v["oldsort"];

		var isOld = (v["created"] || v["changed"]) ? true : false;

		if (oldsort !== undefined) delete v["oldsort"];

		if (isOld) {
			var newChanged = new Date();
			r = dbTable.save(v["id"], v["appid"], v["list"], v["tag"], v["bindid"], v["sort"], JSON.stringify(omitPK(v)), newChanged, oldsort);
		} else {
			var newCreated = new Date();
			r = dbTable.insert(v["id"], v["appid"], v["list"], v["tag"], v["bindid"], v["sort"], JSON.stringify(omitPK(v)), newCreated);
		}

		if (r) this.oldsort = v["sort"];
		return r;
	},
	erase: function(dbTable) {
		var v = this;
		return dbTable.delete(v["id"], v["appid"], v["list"], v["bindid"], v["tag"], v["sort"]);
	}
}

function Table(dbTable, appid, id, hits, table) {
	if (!table) table = "";

	function mix(m) {
		if (m["created"] || m["changed"]) {
			m.oldsort = m.sort;
		}
		m.valueOf = fn.valueOf;
		m.save = fn.save.bind(m, dbTable);
		m.erase = fn.erase.bind(m, dbTable);
		return Proxy.create(handlerMaker(m));
	}

	function mixlist(rs) {
		if (rs.length === 0) return [];
		rs = rs.toJSON();
		rs = rs.map(function(m) {
			m = m.toJSON();
			var v = JSON.parse(m["value"]);
			v["id"] = m["id"];
			v["appid"] = m["appid"];
			v["list"] = m["list"];
			v["tag"] = m["tag"];
			v["bindid"] = m["bindid"];
			v["sort"] = m["sort"];
			if (m["created"] || v["created"])
				v["created"] = new Date(m["created"] || v["created"]);
			if (m["changed"] || v["changed"])
				v["changed"] = new Date(m["changed"] || v["changed"]);
			return mix(v);
		});
		return rs;
	}

	//mod: KV、list
	this.put = function(tag, value) {
		if (!checkPower(dbTable, id, appid))
			return;
		if (!util.isObject(tag)) {
			if (!tag || value == null)
				throw new TypeError("put(k-v) param error.");

			if (util.isObject(value)) {
				if (!util.isArray(value)) value = omitPK(value);
				value = JSON.stringify(value);
			}

			return dbTable.insert(id, appid, table, tag, 0, 0, value, new Date());
		} else {
			if (value != null)
				throw new TypeError("put(list) param error(value): value should be null!");

			var v = tag;
			if (v["oldsort"] || v["_tags"])
				throw new TypeError("put(list) param error(object): oldsort and _tags is forbidden!");

			var bindid = v["bindid"],
				sort = v["sort"],
				tag = v["tag"];
			if (tag == null || !util.isNumber(bindid) || Number(bindid) < 0)
				throw new TypeError("put(list) param error(object): tag or bindid is wrong!");

			if (sort == null) {
				sort = this.inc("sorts");
			} else if (!Number(sort)) { //sort非数字或为0
				throw new TypeError("put(list) param error(object): sort!");
			}
			return dbTable.insert(id, appid, table, tag, bindid, sort, JSON.stringify(omitPK(v)), new Date()) ? sort : 0;
		}
	}

	this.get = function(tag) {
		tag = tag || "";
		var v = {};
		var rs = dbTable.getKV(id, appid, table, tag);
		rs.forEach(function(r) {
			r = r.toJSON();
			v[r.tag] = r.value.toString();
		});
		return util.isArray(tag) ? v : v[tag];
	}

	this.getJSON = function(tag) {
		var rs = dbTable.tags(id, appid, table, tag || "", 1),
			v;

		if (rs.length === 1) {
			rs = rs[0];
			v = JSON.parse(rs["value"].toString()); //mysql is buffer can't jsonEncode

			v["id"] = id;
			v["appid"] = appid;
			v["list"] = table;
			v["tag"] = tag || "";
			v["bindid"] = v["bindid"] || 0;
			v["sort"] = v["sort"] || 0;
			if (rs["created"] || v["created"])
				v["created"] = new Date(rs["created"] || v["created"]);
			if (rs["changed"] || v["changed"])
				v["changed"] = new Date(rs["changed"] || v["changed"]);
		}
		return v || {};
	}

	this.getObject = function(tag) {
		var v = this.getJSON(tag);
		if (util.isEmpty(v)) {
			v["id"] = id;
			v["appid"] = appid;
			v["list"] = table;
			v["tag"] = tag || "";
			v["bindid"] = 0;
			v["sort"] = 0;
		}
		return mix(v);
	}

	this.createObject = function(tag) {
		var v = {};
		v["id"] = id;
		v["appid"] = appid;
		v["list"] = table;
		v["tag"] = tag || "";
		v["bindid"] = v["bindid"] || 0;
		v["sort"] = v["sort"] || 0;
		return mix(v);
	}

	this.distinct = function(field) {
		return dbTable.distinct(field, id, appid).toJSON().map(function(m) {
			return m[field];
		}).filter(function(m) {
			return m !== "";
		});
	}

	this.all = function() {
		var rs = dbTable.all(id, appid, table);
		return mixlist(rs);
	}

	this.ptags = function(limit, range, order) {
		if (range && !util.isArray(range)) {
			if (order == "desc")
				range = [undefined, range];
			else
				range = [range, undefined];
		}
		var rs = dbTable.ptags(id, appid, table, limit, range, order);
		return mixlist(rs);
	}

	this.list = function(bindid, tag, sort) {
		if (bindid == null) {
			throw new TypeError("list param error: bindid is null");
		}

		if (sort && !Number(sort)) throw new TypeError("list param error: sort is null");
		var rs = dbTable.list(id, appid, table, bindid, tag, sort);
		return mixlist(rs);
	}

	this.tags = function(tag, limit, range, order) {
		if (tag == null) {
			throw new TypeError("tags param error: tag is null");
		}
		if (range && !util.isArray(range)) {
			if (order == "desc")
				range = [undefined, range];
			else
				range = [range, undefined];
		}
		var rs = dbTable.tags(id, appid, table, tag, limit, range, order);
		return mixlist(rs);
	}

	this.batchErase = function(tag, max, need, order) {
		max = Number(max);
		need = Number(need);
		if (tag == null || !max || !need) throw new TypeError("batchErase param error");

		order = order === "desc" ? "desc" : "asc";

		var k = [id, appid, table, tag].join("_"),
			_this = this;

		batchEraseLRU.get(k, function(k) {
			var _count = _this.count(tag);
			if (_count < max) return 1;

			if (env === "prod") {
				dbTable.batchErase(id, appid, table, tag, order, _count - need);
			} else {
				_this.tags(tag, _count - need).forEach(function(o) {
					o.erase();
				});
			}
			return 1;
		});

		return true;
	}

	this.erase = function(tag, bindid, sort) {
		if (tag == null || bindid == null)
			throw new TypeError("erase param error: tag or bindid is null");

		if (Number(bindid) === 0 && Number(sort) !== 0)
			throw new TypeError("erase(k-v) param error: sort should be 0!");

		var r;
		if (sort != null) {
			r = dbTable.delete(id, appid, table, bindid, tag, sort);
		} else {
			r = this.list(bindid, tag).every(function(o) { //存在仅有sort不同的多条记录
				return o.erase();
			});
		}

		return r;
	}

	this.count = function(tag, bindid) {
		return dbTable.count(id, appid, table, tag || "", bindid);
	}

	this.inc = function(tag, modify) {
		if (!tag) throw new TypeError("inc param error: tag is null!");
		return dbTable.inc(id, appid, table, tag, new Date());
	}

	this.dec = function(tag, modify) {
		if (!tag) throw new TypeError("dec param error: tag is null!");
		return dbTable.counter(id, appid, table, tag, "-", genModify(modify), new Date());
	}

	this.incMore = function(tag, modify) {
		if (!tag) throw new TypeError("incMore param error: tag is null!");
		return dbTable.counter(id, appid, table, tag, "+", genModify(modify), new Date());
	}

	this.decMore = function(tag, modify) {
		if (!tag) throw new TypeError("decMore param error: tag is null!");
		return dbTable.counter(id, appid, table, tag, "-", genModify(modify), new Date());
	}

	this.addTag = function(tag, bindid) {
		if (!tag || !Number(bindid))
			throw new TypeError("addTag param error: tag is null or bindid not number!");

		var rs = this.list(bindid, "");
		if (rs.length !== 1)
			throw new TypeError("addTag execute error: list data not exist! tag:" + tag + " bindid:" + bindid);

		var obj = rs[0],
			_tags = obj._tags || [];

		var tags = util.isArray(tag) ? tag : [tag];
		tags = tags.filter(function(t) {
			return _tags.indexOf(t) === -1
		});

		if (!tags.length) return true;

		if (obj.save({
				_tags: _tags.concat(tags)
			})) {

			return tags.every(function(t) {
				var v = {
					id: id,
					appid: appid,
					list: table,
					tag: t,
					sort: obj.sort,
					bindid: bindid
				};

				return dbTable.addTag(id, appid, table, t, bindid, JSON.stringify(omitPK(v)), new Date());
			})
		}
	}

	this.removeTag = function(tag, bindid) {
		if (tag == null || !Number(bindid))
			throw new TypeError("removeTag param error: tag is null or bindid not number!");

		if (tag === "") {
			return dbTable.delete(id, appid, table, bindid);
		} else {
			var rs = this.list(bindid, "");
			if (rs.length !== 1)
				throw new Error("removeTag execute error: list data not exist!");

			var _tags = rs[0]._tags;
			if (!util.isArray(_tags)) return true;

			var tags = util.isArray(tag) ? tag : [tag];
			tags = tags.filter(function(t) {
				return _tags.indexOf(t) !== -1;
			})

			if (!tags.length) return true;

			if (rs[0].save({
					_tags: util.difference(rs[0]._tags, tags)
				})) {

				var _this = this;
				return tags.every(function(t) {
					rs = _this.list(bindid, t);
					if (rs.length !== 1) throw new Error("removeTag execute error: tag data not exist!");
					return rs[0].erase();
				})
			}
		}
	}

	this.listTag = function(tag, limit, range, order) {
		if (!tag) {
			throw new TypeError("listTag param error: tag is null");
		}
		if (range && !util.isArray(range)) {
			if (order == "desc")
				range = [undefined, range];
			else
				range = [range, undefined];
		}
		if (util.isArray(tag) && !tag.length) return [];
		var rs = dbTable.listTag(id, appid, table, tag, limit, range, order);
		if (rs.length === 0) return [];

		rs = rs.toJSON();
		rs = rs.map(function(m) {
			m = m.toJSON();
			var v = JSON.parse(m["value"]);
			v["id"] = m["id"];
			v["appid"] = m["appid"];
			v["list"] = m["list"];
			v["tag"] = m["tag"];
			v["bindid"] = m["bindid"];
			v["sort"] = m["sort"];
			if (m["created"] || v["created"])
				v["created"] = new Date(m["created"] || v["created"]);
			if (m["changed"] || v["changed"])
				v["changed"] = new Date(m["changed"] || v["changed"]);
			return v;
		});
		return rs;
	}

	this.updateTag = function(tag, bindid) {
		if (!tag || !Number(bindid))
			throw new TypeError("updateTag param error: tag is null or bindid not number");
		return dbTable.updateTag(id, appid, table, tag, bindid, new Date());
	}

	this.updateSort = function(bindid, s) {
		if (!Number(bindid))
			throw new TypeError("updateSort param error: bindid not number");

		var sort = s ? this.incMore("sorts", s) : this.inc("sorts");

		return dbTable.updateSort(id, appid, table, bindid, sort, new Date()) ? sort : 0;
	}

	return proxy(this, function(table) {
		if (!table) {
			throw new Error('Table Name Can\'t Set ""');
		}
		return (new Table(dbTable, appid, id, hits, table));
	});
}

module.exports = function(appid, dbTableTrans) {

	var dbTable = dbTableTrans;
	if (!dbTable)
		dbTable = require("dbs/dbManager").dbTable;

	return new function() {
		this.ids = function(id, hits) {
			if (util.isString(id)) {
				id = id.split(",");
				if (id.length === 1) id = id[0]
			}
			if (!hits) hits = id;
			return (new Table(dbTable, appid, id, hits));
		}

		this.transaction = function(func) {
			return dbTable.transaction(appid,
				function(dbTable) {
					var dbapi = new module.exports(appid, dbTable);
					return func(dbapi);
				}, Array.prototype.slice.call(arguments, 1)
			)
		}

		return proxy(this, function(id) {
			if (util.isString(id)) {
				id = id.split(",").map(function(k) {
					return Number(k)
				});
				if (id.length === 1) id = id[0]
			}
			return (new Table(dbTable, appid, id, id));
		});
	}
}