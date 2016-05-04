"use strict";
var appIds = require("dbs/dbManager").appIds;
var util = require('util');

function put(appid, version, id) {
	if (!version || !util.isNumber(appid) || !util.isNumber(version) || !util.isNumber(id))
		throw new Error("put: appid or version or id Error");

	try {
		return appIds.put(appid, version, id);
	} catch (e) {
		console.error("put error:%s appid:%s version:%s id:%s", e, appid, version, id);
		return false;
	}
}

function get(appid, version, limit, range, order) {
	if (!version || !util.isNumber(appid) || !util.isNumber(version) || (limit && !util.isNumber(limit)))
		throw new TypeError("get: appid or version Error");

	if (range && !util.isArray(range)) {
		if (order == "desc")
			range = [undefined, range];
		else
			range = [range, undefined];
	}

	return appIds.get(appid, version, limit, range, order);
}

function count(appid, version, id) {
	if (!version || !util.isNumber(appid) || !util.isNumber(version) || (id != null && !util.isNumber(id)))
		throw new TypeError("count: appid or version Error");

	return appIds.count(appid, version, id);
}

function update(appid, version, id, nversion) {
	if (!version || !nversion || !util.isNumber(appid) || !util.isNumber(version) || !util.isNumber(nversion) || !util.isNumber(id))
		throw new TypeError("update: appid or id or version Error");
	return appIds.update(appid, id, version, nversion);
}

function remove(appid, version, id) {
	if (!version || !util.isNumber(appid) || !util.isNumber(version) || !util.isNumber(id))
		throw new Error("remove: appid or version or id Error");

	return appIds.remove(appid, version, id);
}

module.exports = {
	app: {
		put: put,
		get: get,
		count: count,
		update: update,
		remove: remove
	}
}