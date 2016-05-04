'use strict';

var dbcfg = {
	data: {
		name: 'mysql_reborn',
		Engine: 'sqlEngine',
		connString: 'mysql://root:123456@localhost/blog_prod',
		limit: 10
	}
};

module.exports = {
	runtime: {
		"blog.router": {
			static: {
				default: "",
				amdCache: false,
				webroot: '../www'
			}
		},
		database: {
			ids: dbcfg.data,
			name2Ids: dbcfg.data,
			dbTable: dbcfg.data,
			appIds: dbcfg.data,
			attachinfo: dbcfg.data,
			storage: dbcfg.data
		},
		cache: {
			session: {
				engine: dbcfg.data,
				name: "session",
				expire: 5 * 60 * 1000
			},
			objectCache: {
				engine: dbcfg.data,
				name: "object",
				expire: 0
			},
			tsCache: {
				engine: dbcfg.data,
				name: "ts",
				expire: 0
			},
			pageCache: {
				engine: dbcfg.data,
				name: "page",
				expire: 0
			},
			appCache: {
				engine: dbcfg.data,
				name: "app",
				expire: 0
			},
			dataCache: {
				engine: dbcfg.data,
				name: "data",
				expire: 0
			},
		},
		env: "prod",
		apps: {},
		modules: {},
		"blog.refresh": {
			port: 9465
		}
	},
	"blog.services": [{
		type: "http",
		addr: "",
		port: 8080,
		hdlr: "blog"
	}],
	daemon: 1,
	logger: [{
		type: "console",
		levels: [console.ERROR, console.WARN, console.NOTICE],
	}, {
		type: "file",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN],
		path: "../log/error/error.log",
		split: "hour",
		count: 48
	}, {
		type: "file",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.INFO],
		path: "../log/access/access.log",
		split: "minute",
		count: 128
	}, {
		type: "syslog",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.INFO]
	}]
};