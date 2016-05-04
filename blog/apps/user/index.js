"use strict";

var user = require("./lib/class");

module.exports = {
	JOB: function(task) {
		return user.JOB[task.jobname](task);
	},
	EVENT: user.EVENT,
	root: {
		init: user.init,
		check: user.check,
		base: user.base.private
	},
	"": {
		api: user.API,
		object: {
			get: user.get,
			getIds: user.getIds,
			fill: user.fill,
			getPower: user.getPower,
			expire: user.base.expire
		}
	}
}