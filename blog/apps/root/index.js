"use strict";

var root = require("./lib/root");

module.exports = {
	root: {
		base: root.base.private,
		getAppManage: root.getAppManage
	},
	bbs: {
		install: root.install
	},
	bind: {
		rootapp: root.rootapp
	},
	buy: {
		install: root.install
	},
	course: {
		install: root.install
	},
	comments: {
		rootapp: root.rootapp,
		install: root.install
	},
	follows: {
		rootapp: root.rootapp
	},
	fishpondmanage: {
		install: root.install
	},
	device: {
		install: root.install,
		getAppManage: root.getAppManage
	},
	general: {
		install: root.install
	},
	group: {
		rootapp: root.rootapp,
		install: root.install
	},
	groupman: {
		rootapp: root.rootapp,
		install: root.install
	},
	label: {
		rootapp: root.rootapp
	},
	link: {
		getAppManage: root.getAppManage
	},
	user: {
		rootapp: root.rootapp,
		install: root.install
	},
	groupstat: {
		getAppManage: root.getAppManage
	},
	ordermanage: {
		getAppManage: root.getAppManage
	},
	mail: {
		install: root.install
	},
	message: {
		appids: root.appids,
		getAppManage: root.getAppManage,
		checkAppInstalled: root.checkAppInstalled
	},
	store: {
		install: root.install
	},
	wallet: {
		install: root.install,
		getAppManage: root.getAppManage
	},
	withdrawmanage: {
		getAppManage: root.getAppManage,
		install: root.install
	},
	activity: {
		getAppManage: root.getAppManage,
		install: root.install
	},
	promotion: {
		install: root.install
	},
	vipcard: {
		getAppManage: root.getAppManage
	},
	lesson: {
		getAppManage: root.getAppManage
	},
	"": {
		object: {
			check: root.check,
			create: root.create,
			appids: root.appids,
			rootapp: root.rootapp,
			expire: root.base.expire,
			getPower: root.getPower,
			get: root.get,
			getIds: root.getIds,
			fill: root.fill,
			rename: root.rename,
			addAuth: root.addAuth,
			removeAuth: root.removeAuth,
			getAppManage: root.getAppManage,
			getAppIdsManage: root.getAppIdsManage
		}
	}
}