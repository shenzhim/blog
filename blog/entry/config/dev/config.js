'use strict';

var dbcfg = {
	sql: {
		name: 'root',
		Engine: 'sqlEngine',
		connString: 'mysql://root:123456@localhost/blog_dev',
		limit: 5
	}
};

module.exports = {
	runtime: {
		"blog.router": {
			static: {
				default: '',
				amdCache: false,
				webroot: '../www'
			}
		},
		database: {
			ids: dbcfg.sql,
			name2Ids: dbcfg.sql,
			dbTable: dbcfg.sql,
			inviteCode: dbcfg.sql,
			appIds: dbcfg.sql,
			tasks: dbcfg.sql,
			sms: dbcfg.sql,
			newstatdata: dbcfg.sql,
			attachinfo: dbcfg.sql,
			storage: dbcfg.sql,
			listsearch: dbcfg.sql,
			namesearch: dbcfg.sql,
			openids: dbcfg.sql
		},
		cache: {
			session: {
				engine: dbcfg.sql,
				name: "session",
				expire: 5 * 60 * 1000
			},
			objectCache: {
				engine: dbcfg.sql,
				name: "object",
				expire: 5 * 60 * 1000
			},
			tsCache: {
				engine: dbcfg.sql,
				name: "ts",
				expire: 5 * 60 * 1000
			},
			pageCache: {
				engine: dbcfg.sql,
				name: "page",
				expire: 5 * 60 * 1000
			},
			appCache: {
				engine: dbcfg.sql,
				name: "app",
				expire: 5 * 60 * 1000
			},
			dataCache: {
				engine: dbcfg.sql,
				name: "data",
				expire: 6 * 60 * 60 * 1000
			},
		},
		env: "dev",
		apps: {},
		modules: {},
		"blog.modules": {},
		"blog.refresh": {
			port: 9465
		}
	},
	"blog.services": [{
		type: "http",
		addr: "",
		port: 80,
		hdlr: "blog"
	}],
	daemon: 0,
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