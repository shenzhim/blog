var net = require("net");
var websocket = require("websocket");
var io = require("io");
var Pool = require("utils/pool");

var slice = Array.prototype.slice;

exports.ws_connect = function(url, nm) {
	var pool = Pool(url, function() {
			return websocket.connect(url);
		},
		nm);

	return function(id) {
		return function() {
			var jss = [];

			jss.push('{"method":"');
			jss.push(id);

			if (arguments.length > 0) {
				jss.push('","params":');
				jss.push(JSON.stringify(slice.call(arguments, 0)));
				jss.push("}");
			} else jss.push('"}');

			var ps = new Buffer(jss.join(""));
			var ret = JSON.parse(pool(function(conn) {
				var msg = new websocket.Message();
				msg.type = websocket.TEXT;
				msg.body.write(ps);

				msg.sendTo(conn);

				var msg = new websocket.Message();
				msg.readFrom(conn);

				return msg.body.readAll().toString();
			}));

			if (ret.error)
				throw ret.error.message;

			return ret.result;
		};
	};
};