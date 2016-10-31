"use strict";

exports.reMail = "^[\\w-]+(\\.[\\w-]+)*@([\\w-]+(\\.[\\w-]+)*?\\.[a-z]{2,6}|(\\d{1,3}\\.){3}\\d{1,3})(:\\d{1,5})?$";
exports.reName = "^[A-Za-z\u3041-\u3096\u3099-\u30ff\u3400-\u4db5\u4e00-\u9fbf][0-9A-Za-z\u3041-\u3096\u3099-\u30ff\u3400-\u4db5\u4e00-\u9fbf]*$";
exports.rePhone = "^(13[0-9]|14[57]|15[0-9]|17[0-9]|18[0-9])\\d{8}$";
exports.reIp = "^((25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d|\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d|\\d)$";
exports.retofloor = /TO [0-9]+L [@][A-Za-z\u4e00-\u9fb5][0-9A-Za-z\u4e00-\u9fb5]* ：/g;

exports.validate = function(v, m, minSize, maxSize) {
	if (!v) v = "";
	var l = v.length;
	if (l < minSize) return l === 0 ? "empty" : "short";

	if (maxSize > 0 && l > maxSize) return "long";

	if (m)
		if (!(new RegExp(m, "i")).test(v)) return "error";
}

exports.filter = function(s) {
	if (!s) return s;
	return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

exports.clean = function(s) {
	if (!s) return s;
	return s.replace(/[\ud800-\udfff\ufeff]*/gi, "");
};