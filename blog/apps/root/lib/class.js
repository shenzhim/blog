var fib = require("fib");
var util = require("util");
var dbapi = require("modules/dbapi");
var idsNamesLRU = new util.LruCache(1000, 6 * 60 * 60 * 1000);


exports.name2id = function(appname) {
	if (!appname || !util.isString(appname)) return;

	return idsNamesLRU.get("name2id_" + appname, function() {
		var rs = dbapi[0].app.tags(appname);
		if (rs.length === 1) return Number(rs[0].bindid);
	});
}

exports.id2name = function(appid) {
	appid = Number(appid);
	if (isNaN(appid)) return;

	return idsNamesLRU.get("id2name_" + appid, function() {
		var rs = dbapi[0].app.list(appid);
		if (rs.length === 1) return rs[0].tag;
	});
},