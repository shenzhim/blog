"use strict";

require("test").setup();
var client = require("client");

describe("statistic", function() {
	var c,
		proxy,
		readyEnv,
		clearEnv,
		fns,
		base_1_object,
		base_1_page;

	before(function() {
		c = new client();
		proxy = function(o, fn) {
			return Proxy.create({
				get: function(receiver, name) {
					if (o && o[name]) return o[name];
					return fn(name);
				}
			});
		}

		base_1_object = {
			"id": 1,
			"name": "test"
		};

		base_1_page = {
			"id": 1,
			"base": {
				"root": "user",
				"tmpl": "base"
			},
			"user": base_1_object
		};

		function apploader() {
			var p = Array.prototype.slice.call(arguments);
			return new function() {
				if (p.length === 3) {
					var id = Number(p[1]);
					this.object = {
						getAppManage: function() {
							return {
								id2name: function(appId) {
									appId = Number(appId);
									switch (appId) {
										case 2:
											return "user";
									}
								}
							}
						},
						rootapp: function() {
							switch (id) {
								case 1:
									return "user";
							}
						},
						appids: function() {
							switch (id) {
								case 1:
									return {
										"2": 1
									};
							}
						}
					}

					if (p[2] === 'user') {
						this.object = {
							getPower: function(id, type) {
								return true;
							},
							get: function(id, type) {
								return base_1_object;
							},
							getIds: function(type, d) {
								return {};
							},
							fill: function(type, d, ds) {
								return d;
							},
							expire: function(t, type) {
								return 1;
							}
						}
					}
				}
				return proxy(this, function(param) {
					return apploader.apply(null, p.concat(param));
				});
			};
		}

		readyEnv = function() {
			var modules = {
				apps: {
					apploader: apploader("public")
				}
			};
			var sb = require("sb")(modules);
			var fns = {
				pageCache: sb.require("dbs/dbManager").pageCache,
				objectCache: sb.require("dbs/dbManager").objectCache,
				tsCache: sb.require("dbs/dbManager").tsCache,
				appCache: sb.require("dbs/dbManager").appCache,
				get: sb.require("modules/object").api.get
			};
			assert.equal(fns.pageCache.getJSON("base_1"), undefined);
			assert.equal(fns.objectCache.getJSON("base_1"), undefined);
			assert.equal(fns.tsCache.getJSON("base_1"), undefined);
			assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
			return fns;
		};

		clearEnv = function() {
			c.clearCache(1, "base", 2);
		};
	});

	after(function() {
		clearEnv();
	});

	beforeEach(function() {
		clearEnv();
	});

	it("pageCache 存在缓存且未过期", function() {
		fns = readyEnv();

		fns.pageCache.put("base_1", {
			data: base_1_page,
			ids: ["base_1"],
			ts: 1416207222078,
			tc: new Date().getTime() + 60 * 60
		});
		fns.tsCache.put("base_1", 1416207222078);
	});

	it("pageCache 存在缓存但过期，objectCache 存在缓存且未过期", function() {
		fns = readyEnv();

		fns.pageCache.put("base_1", {
			data: base_1_page,
			ids: ["base_1"],
			ts: 1416207222078,
			tc: new Date().getTime() - 60 * 60
		});
		fns.tsCache.put("base_1", 1416207222078);
		fns.objectCache.put("base_1", {
			data: base_1_page,
			ts: 1416207222078,
			tc: new Date().getTime() + 60 * 60
		});
	});

	it("pageCache 存在缓存但过期，objectCache 存在缓存但过期", function() {
		fns = readyEnv();

		fns.pageCache.put("base_1", {
			data: base_1_page,
			ids: ["base_1"],
			ts: 1416207222078,
			tc: new Date().getTime() - 60 * 60
		});
		fns.tsCache.put("base_1", 1416207222078);
		fns.objectCache.put("base_1", {
			data: base_1_page,
			ts: 1416207222078,
			tc: new Date().getTime() - 60 * 60
		});
		fns.appCache.put("base_1_2", {
			data: base_1_object
		});
	});

	it("pageCache 不存在缓存，objectCache 存在缓存且未过期", function() {
		fns = readyEnv();

		fns.objectCache.put("base_1", {
			data: base_1_page,
			ts: 1416207222078,
			tc: new Date().getTime() + 60 * 60
		});
	});

	it("pageCache 不存在缓存，objectCache 存在缓存但过期", function() {
		fns = readyEnv();

		fns.objectCache.put("base_1", {
			data: base_1_page,
			ts: 1416207222078,
			tc: new Date().getTime() - 60 * 60
		});
		fns.appCache.put("base_1_2", {
			data: base_1_object
		});
	});

	it("pageCache、objectCache 均不存在缓存", function() {
		fns = readyEnv();

		fns.appCache.put("base_1_2", {
			data: base_1_object
		});
	});
});