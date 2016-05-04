var util = require("util");
var fs = require("fs");
var coroutine = require("coroutine");
var object = require('modules/object').app;
var date = require("utils/date");
var juicer = require("utils/juicer");
var LRU = new util.LruCache(3, 0);

function getHtml(tmplname) {
	return LRU.get(tmplname, function(tmplname) {
		var tmpl = fs.readFile("./modules/tmpl/" + tmplname + ".html");
		return tmpl;
	});
}

module.exports = {
	api: {
		load: function(v) {
			var data = {},
				p = Array.prototype.slice.call(arguments, 1),
				tmplname = p[0],
				msgid = p[1];


			if (["index", "archive"].indexOf(tmplname) > -1) {
				data = {
					list: []
				};

				var fib = coroutine.current();
				var r = object.get(1, "blog");
				r.blog.list.forEach(function(d) {
					data.list.push({
						title: d.data.message.title,
						url: '/blog/message.' + d.data.message.id,
						time: date.format(new Date(d.data.message.created), "yyyy-MM-dd hh:mm"),
						summary: d.data.message.summary || ""
					})
				})
			} else if ("me" === tmplname) {
				tmplname = "message";
				data = {
					url: "/rest/object/get.2.block"
				}
			} else if ("message" === tmplname) {
				data = {
					url: "/rest/object/get." + msgid + ".block"
				}
			}
			return juicer(getHtml(tmplname), data);
		}
	}
}