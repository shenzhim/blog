"use strict";

require("test").setup();

var client = require('client');
var util = require("util");

describe("cache", function() {
	var c;
	var proxy;

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
	});

	describe("单维度：appCache、objectCache、pageCache 缓存规则", function() {
		var readyEnv,
			clearEnv,
			fns,
			base_1_object,
			base_1_page,
			define,
			checkFn;

		before(function() {
			base_1_object = {
				"id": 1,
				"name": "test"
			};

			base_1_page = {
				"id": 1,
				"base": {
					"root": "user",
					"tmpl": "base",
					"app": "user"
				},
				"user": base_1_object
			};

			define = {
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
				}
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
						};
						if (p[2] === 'user') {
							for (var k in define) {
								this.object[k] = define[k];
							}
						}
					}
					return proxy(this, function(param) {
						return apploader.apply(null, p.concat(param));
					});
				};
			}

			readyEnv = function(define, checkFn) {
				var modules = {
					apps: {
						apploader: apploader("public")
					}
				}
				var sb = require("sb")(modules);
				var fns = {
					pageCache: sb.require("dbs/dbManager").pageCache,
					objectCache: sb.require("dbs/dbManager").objectCache,
					tsCache: sb.require("dbs/dbManager").tsCache,
					appCache: sb.require("dbs/dbManager").appCache,
					get: sb.require("modules/object").app.get
				}
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);

				fns.check = checkFn;
				return fns;
			};

			clearEnv = function() {
				c.clearCache(1, "base", 2);
			};
		});

		afterEach(function() {
			clearEnv();
		});

		describe("appCache、objectCache、pageCache 均不缓存", function() {

			before(function() {
				checkFn = function() {
					assert.equal(fns.pageCache.getJSON("base_1"), undefined);
					assert.equal(fns.objectCache.getJSON("base_1"), undefined);
					assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				};
			});

			beforeEach(function() {
				clearEnv();
			});

			it("appCache 不允许缓存，objectCache、pageCache 不允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 0;
						case "get":
							return 0;
						case "appcache":
							return 0;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});

			it("appCache 不允许缓存，objectCache 不允许缓存，pageCache 允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 1;
						case "get":
							return 0;
						case "appcache":
							return 0;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});

			it("appCache 不允许缓存，objectCache 允许缓存，pageCache 不允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 0;
						case "get":
							return 1;
						case "appcache":
							return 0;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});

			it("appCache 不允许缓存，objectCache、pageCache 允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 1;
						case "get":
							return 1;
						case "appcache":
							return 0;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});
		});

		describe("appCache 缓存，objectCache、pageCache 不缓存", function() {

			before(function() {
				checkFn = function() {
					assert.equal(fns.pageCache.getJSON("base_1"), undefined);
					assert.equal(fns.objectCache.getJSON("base_1"), undefined);
					assert.deepEqual(fns.appCache.getJSON("base_1_2").data, base_1_object);
				};
			});

			beforeEach(function() {
				clearEnv();
			});

			it("appCache 允许缓存，objectCache 不允许缓存，pageCache 不允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 0;
						case "get":
							return 0;
						case "appcache":
							return 1;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});

			it("appCache 允许缓存，objectCache 不允许缓存，pageCache 允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 1;
						case "get":
							return 0;
						case "appcache":
							return 1;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();
			});
		});

		describe("appCache、objectCache 缓存，pageCache 自定义是否缓存", function() {

			before(function() {
				checkFn = function() {
					assert.deepEqual(fns.objectCache.getJSON("base_1").data, base_1_page);
					assert.deepEqual(fns.appCache.getJSON("base_1_2").data, base_1_object);
				};
			});

			beforeEach(function() {
				clearEnv();
			});

			it("appCache 允许缓存，objectCache 允许缓存，pageCache 不允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 0;
						case "get":
							return 1;
						case "appcache":
							return 1;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();

				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
			});

			it("appCache 允许缓存，objectCache 允许缓存，pageCache 允许缓存", function() {
				define.expire = function(t, type) {
					switch (t) {
						case "fill":
							return 1;
						case "get":
							return 1;
						case "appcache":
							return 1;
					}
				};
				fns = readyEnv(define, checkFn);

				assert.deepEqual(fns.get(1, "base"), base_1_page);
				fns.check();

				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
			});
		});
	});

	describe("多维度：当前 pageCache 与依赖的 pageCache 缓存规则", function() {
		var readyEnv,
			clearEnv,
			fns,
			base_1_object,
			base_1_page,
			block_5_object,
			block_5_page,
			userDefine,
			messageDefine,
			checkFn;

		before(function() {
			base_1_object = {
				"id": 1,
				"name": "test"
			};

			base_1_page = {
				"id": 1,
				"base": {
					"root": "user",
					"tmpl": "base",
					"app": "user"
				},
				"user": base_1_object
			};

			block_5_object = {
				"id": 5,
				"title": "aaaaa",
				"content": "bbbbb"
			};

			block_5_page = {
				"id": 5,
				"base": {
					"root": "message",
					"tmpl": "block",
					"app": "message"
				},
				"message": block_5_object
			};

			userDefine = {
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
				}
			};

			messageDefine = {
				getPower: function(id, type) {
					return true;
				},
				get: function(id, type) {
					return block_5_object;
				},
				getIds: function(type, d) {
					return {
						base: [1],
						block: [5]
					};
				},
				fill: function(type, d, ds) {
					return d;
				}
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
											case 14:
												return "message";
										}
									}
								}
							},
							rootapp: function() {
								switch (id) {
									case 1:
										return "user";
									case 5:
										return "message";
								}
							},
							appids: function() {
								switch (id) {
									case 1:
										return {
											"2": 1
										};
									case 5:
										return {
											"14": 1
										};
								}
							}
						}

						if (p[2] === 'user') {
							for (var k in userDefine) {
								this.object[k] = userDefine[k];
							}
						} else if (p[2] === 'message') {
							for (var k in messageDefine) {
								this.object[k] = messageDefine[k];
							}
						}
					}
					return proxy(this, function(param) {
						return apploader.apply(null, p.concat(param));
					});
				};
			}

			readyEnv = function(userDefine, messageDefine, checkFn) {
				var modules = {
					apps: {
						apploader: apploader("public")
					}
				}
				var sb = require("sb")(modules);
				var fns = {
					pageCache: sb.require("dbs/dbManager").pageCache,
					objectCache: sb.require("dbs/dbManager").objectCache,
					tsCache: sb.require("dbs/dbManager").tsCache,
					appCache: sb.require("dbs/dbManager").appCache,
					get: sb.require("modules/object").app.get
				}
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);

				fns.check = checkFn;
				return fns;
			};

			clearEnv = function() {
				c.clearCache(1, "base", 2);
				c.clearCache(5, "block", 14);
			};
		});

		beforeEach(function() {
			clearEnv();
		});

		after(function() {
			clearEnv();
		});

		it("当前 pageCache 不允许缓存，依赖的 pageCache 不允许缓存", function() {
			userDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 0;
					case "get":
						return 0;
					case "appcache":
						return 0;
				}
			};
			messageDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 0;
					case "get":
						return 0;
					case "appcache":
						return 0;
				}
			};

			checkFn = function() {
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
			};
			fns = readyEnv(userDefine, messageDefine, checkFn);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("当前 pageCache 不允许缓存，依赖的 pageCache 允许缓存", function() {
			userDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 1;
					case "get":
						return 1;
					case "appcache":
						return 1;
				}
			};
			messageDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 0;
					case "get":
						return 0;
					case "appcache":
						return 0;
				}
			};

			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.deepEqual(fns.objectCache.getJSON("base_1").data, base_1_page);
				assert.deepEqual(fns.appCache.getJSON("base_1_2").data, base_1_object);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
			};
			fns = readyEnv(userDefine, messageDefine, checkFn);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("当前 pageCache 允许缓存，依赖的 pageCache 不允许缓存", function() {
			userDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 0;
					case "get":
						return 0;
					case "appcache":
						return 0;
				}
			};
			messageDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 1;
					case "get":
						return 1;
					case "appcache":
						return 1;
				}
			};

			checkFn = function() {
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(userDefine, messageDefine, checkFn);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("当前 pageCache 允许缓存，依赖的 pageCache 允许缓存", function() {
			userDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 1;
					case "get":
						return 1;
					case "appcache":
						return 1;
				}
			};
			messageDefine.expire = function(t, type) {
				switch (t) {
					case "fill":
						return 1;
					case "get":
						return 1;
					case "appcache":
						return 1;
				}
			};

			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.deepEqual(fns.objectCache.getJSON("base_1").data, base_1_page);
				assert.deepEqual(fns.appCache.getJSON("base_1_2").data, base_1_object);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(userDefine, messageDefine, checkFn);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});
	});

	describe("appCache、objectCache、pageCache 缓存是否过期", function() {
		var readyEnv,
			clearEnv,
			fns,
			base_1_object,
			base_1_page,
			block_5_object,
			block_5_page,
			checkFn;

		before(function() {
			base_1_object = {
				"id": 1,
				"name": "test"
			};

			base_1_page = {
				"id": 1,
				"base": {
					"root": "user",
					"tmpl": "base",
					"app": "user"
				},
				"user": base_1_object
			};

			block_5_object = {
				"id": 5,
				"title": "aaaaa",
				"content": "bbbbb"
			};

			block_5_page = {
				"id": 5,
				"base": {
					"root": "message",
					"tmpl": "block",
					"app": "message"
				},
				"message": block_5_object
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
											case 14:
												return "message";
										}
									}
								}
							},
							rootapp: function() {
								switch (id) {
									case 1:
										return "user";
									case 5:
										return "message";
								}
							},
							appids: function() {
								switch (id) {
									case 1:
										return {
											"2": 1
										};
									case 5:
										return {
											"14": 1
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
									switch (t) {
										case "fill":
											return 1;
										case "get":
											return 1;
										case "appcache":
											return 1;
									}
								}
							}
						} else if (p[2] === 'message') {
							this.object = {
								getPower: function(id, type) {
									return true;
								},
								get: function(id, type) {
									return block_5_object;
								},
								getIds: function(type, d) {
									return {
										base: [1],
										block: [5]
									};
								},
								fill: function(type, d, ds) {
									return d;
								},
								expire: function(t, type) {
									switch (t) {
										case "fill":
											return 1;
										case "get":
											return 1;
										case "appcache":
											return 1;
									}
								}
							}
						}
					}
					return proxy(this, function(param) {
						return apploader.apply(null, p.concat(param));
					});
				};
			}

			readyEnv = function(checkFn) {
				var modules = {
					apps: {
						apploader: apploader("public")
					}
				}
				var sb = require("sb")(modules);
				var fns = {
					pageCache: sb.require("dbs/dbManager").pageCache,
					objectCache: sb.require("dbs/dbManager").objectCache,
					tsCache: sb.require("dbs/dbManager").tsCache,
					appCache: sb.require("dbs/dbManager").appCache,
					get: sb.require("modules/object").app.get
				}
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);

				fns.check = checkFn;
				return fns;
			};

			clearEnv = function() {
				c.clearCache(1, "base", 2);
				c.clearCache(5, "block", 14);
			};
		});

		afterEach(function() {
			clearEnv();
		});

		after(function() {
			clearEnv();
		});

		it("pageCache 存在且未过期", function() {
			checkFn = function() {
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: block_5_page,
				ids: ["block_5"],
				ts: 1416207222077,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222076);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在但自身缓存过期，objectCache 存在且未过期", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在且自身缓存未过期，但依赖过期，objectCache 存在且未过期", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222077,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在但自身缓存过期，objectCache 存在但过期，appCache 存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.appCache.put("block_5_14", {
				data: block_5_object,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在且自身缓存未过期，但依赖过期，objectCache 存在但过期，appCache 存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222077,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.appCache.put("block_5_14", {
				data: block_5_object,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在但自身缓存过期，objectCache 不存在，appCache 存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.appCache.put("block_5_14", {
				data: block_5_object,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在且自身缓存未过期，但依赖过期，objectCache 不存在，appCache 存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222077,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.appCache.put("block_5_14", {
				data: block_5_object,
				tc: new Date().getTime() + 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在但自身缓存过期，objectCache 不存在，appCache 不存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在且自身缓存未过期，但依赖过期，objectCache 不存在，appCache 不存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在但自身缓存过期，objectCache 存在但过期，appCache 不存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});

		it("pageCache 存在且自身缓存未过期，但依赖过期，objectCache 存在但过期，appCache 不存在", function() {
			checkFn = function() {
				assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
				assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);
			};
			fns = readyEnv(checkFn);

			fns.pageCache.put("block_5", {
				data: {
					"id": 5,
					"base": {
						"root": "message",
						"tmpl": "block"
					},
					"message": {
						"id": 5,
						"title": "kkkkkk",
						"content": "jshsgsh"
					}
				},
				ids: ["block_5"],
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078,
				tc: new Date().getTime() - 60 * 60
			});
			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078,
				tc: new Date().getTime() + 60 * 60
			});
			fns.tsCache.put("base_1", 1416207222078);

			assert.deepEqual(fns.get(5, "block"), block_5_page);
			fns.check();
		});
	});

	describe("clear cache", function() {
		var readyEnv,
			clearEnv,
			fns,
			base_1_object,
			base_1_page,
			block_5_object,
			block_5_page,
			checkFn;

		before(function() {
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

			block_5_object = {
				"id": 5,
				"title": "aaaaa",
				"content": "bbbbb"
			};

			block_5_page = {
				"id": 5,
				"base": {
					"root": "message",
					"tmpl": "block"
				},
				"message": block_5_object
			};

			readyEnv = function() {
				var sb = require("sb")({});
				var fns = {
					pageCache: sb.require("dbs/dbManager").pageCache,
					objectCache: sb.require("dbs/dbManager").objectCache,
					tsCache: sb.require("dbs/dbManager").tsCache,
					appCache: sb.require("dbs/dbManager").appCache,
					get: sb.require("modules/object").app.get
				}
				assert.equal(fns.pageCache.getJSON("base_1"), undefined);
				assert.equal(fns.objectCache.getJSON("base_1"), undefined);
				assert.equal(fns.tsCache.get("base_1"), undefined);
				assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
				assert.equal(fns.pageCache.getJSON("block_5"), undefined);
				assert.equal(fns.objectCache.getJSON("block_5"), undefined);
				assert.equal(fns.tsCache.get("block_5"), undefined);
				assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
				return fns;
			};

			clearEnv = function() {
				c.clearCache(1, "base", 2);
				c.clearCache(5, "block", 14);
			};
		});

		it("clearCache", function() {
			fns = readyEnv();

			fns.pageCache.put("block_5", {
				data: block_5_page,
				ids: ["block_5"],
				ts: 1416207222078
			});
			fns.objectCache.put("block_5", {
				data: block_5_page,
				ts: 1416207222078
			});
			fns.tsCache.put("block_5", 1416207222078);
			fns.appCache.put("block_5_14", {
				data: block_5_object
			});

			fns.pageCache.put("base_1", {
				data: base_1_page,
				ids: ["base_1"],
				ts: 1416207222078
			});
			fns.objectCache.put("base_1", {
				data: base_1_page,
				ts: 1416207222078
			});
			fns.tsCache.put("base_1", 1416207222078);
			fns.appCache.put("base_1_2", {
				data: base_1_object
			});

			assert.deepEqual(fns.pageCache.getJSON("base_1").data, base_1_page);
			assert.deepEqual(fns.objectCache.getJSON("base_1").data, base_1_page);
			assert.equal(fns.tsCache.get("base_1"), "1416207222078");
			assert.deepEqual(fns.appCache.getJSON("base_1_2").data, base_1_object);
			assert.deepEqual(fns.pageCache.getJSON("block_5").data, block_5_page);
			assert.deepEqual(fns.objectCache.getJSON("block_5").data, block_5_page);
			assert.equal(fns.tsCache.get("block_5"), "1416207222078");
			assert.deepEqual(fns.appCache.getJSON("block_5_14").data, block_5_object);

			clearEnv();

			assert.equal(fns.pageCache.getJSON("base_1"), undefined);
			assert.equal(fns.objectCache.getJSON("base_1"), undefined);
			assert.equal(fns.tsCache.get("base_1"), undefined);
			assert.equal(fns.appCache.getJSON("base_1_2"), undefined);
			assert.equal(fns.pageCache.getJSON("block_5"), undefined);
			assert.equal(fns.objectCache.getJSON("block_5"), undefined);
			assert.equal(fns.tsCache.get("block_5"), undefined);
			assert.equal(fns.appCache.getJSON("block_5_14"), undefined);
		});
	});
});