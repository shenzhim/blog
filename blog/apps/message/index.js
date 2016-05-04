"use strict";

var message = require("./lib/class");

module.exports = {
	JOB: function(task) {
		return message.JOB[task.jobname](task);
	},
	EVENT: message.EVENT,
	root: {
		init: message.init,
		base: message.base.private
	},
	"": {
		api: message.API,
		object: {
			expire: message.base.expire,
			get: message.get,
			getIds: message.getIds,
			fill: message.fill,
			getPower: message.getPower
		}
	}
}