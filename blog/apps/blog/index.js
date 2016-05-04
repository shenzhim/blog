"use strict";

var blog = require("./lib/class");

module.exports = {
	EVENT: blog.EVENT,
	root: {
		init: blog.init,
		base: blog.base.private
	},
	"": {
		api: blog.API,
		object: {
			expire: blog.base.expire,
			get: blog.get,
			getIds: blog.getIds,
			fill: blog.fill,
			getPower: blog.getPower,
		}
	}
}