'use strict';

var dbcfg = {
	sql: {
		name: 'root',
		Engine: 'sqlEngine',
		connString: 'mysql://root:123456@localhost/zm_blog',
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
			appIds: dbcfg.sql
		},
		env: "dev",
		modules: {},
		"blog.modules": {},
		"blog.refresh": {
			port: 9465
		}
	},
	"blog.services": [{
		type: "http",
		addr: "",
		port: 82,
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