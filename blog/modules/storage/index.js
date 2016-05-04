"use strict";

var hash = require('hash');
var storage = require("dbs/dbManager").storage;
var attachinfo = require("dbs/dbManager").attachinfo;
var image = require('utils/image');
var response = require("utils/response");
var encoding = require('encoding');
var coroutine = require('coroutine');
var http = require("http");
var gd = require("gd");
var fs = require("fs");
var process = require("process");

function HASH(v) {
	return hash.md5(v).digest().hex()
}

function addValue(f, userid, type) {
	var t,
		k,
		h,
		w;
	if (type === "mp4") {
		t = "mp4";
		h = 0;
		w = 0;
	} else {
		var img = image.init(f, type);
		if (!img) return;

		h = img.height;
		w = img.width;
		if (!type && img.format === image.GIF) {
			t = "gif";
		} else {
			f = image.getData(img, image.JPEG, 85);
			t = "jpeg";
			if (img.format === image.PNG) {
				var pf = image.getData(img, image.PNG);
				if (pf.length < f.length) {
					f = pf;
					t = "png";
				}
			}
		}
	}

	k = HASH(f);
	storage.addValue(k, f);
	attachinfo.addInfo(k, f.length, h, w, t, userid);
	return {
		source: k,
		height: h,
		width: w,
		type: t
	};
}

function getValue(k) {
	return storage.getValue(k);
}

function getInfo(k) {
	return attachinfo.getInfo(k);
}

function getFile(v) {
	var f;
	v.response.setHeader('Content-Type', 'text/html');
	if (v.headers["Content-type"] === "application/octet-stream" || v.headers["Content-type"] === "video/mpeg4") {
		f = v.body.readAll();
	} else {
		if (!v.form["file"] || !v.form["file"].fileName) {
			write(v, {
				error: "file is null"
			});
			return;
		}
		f = v.form["file"].body.readAll();
		if (v.form["file"].contentTransferEncoding === "base64") f = encoding.base64Decode(f);
	}
	return f;
}

function write(v, r) {
	if (v.headers["Content-type"] === "application/octet-stream" || v.headers["Content-type"] === "video/mpeg4")
		response.write(v, JSON.stringify(r));
	else
		response.write(v, "<script>window.name='" + JSON.stringify(r) + "';</script>");
}

function savefile(url, userid) {
	if (!url || !userid) return {
		error: "param error"
	};
	var f = http.get(url).body.readAll(),
		k = HASH(f);
	f = gd.load(f).resample(300, 300).getData();
	return addValue(f, userid);
}

function handlevideo(f, k, option) {
	//save the video;
	var filename = '/tmp/' + k + '.mp4',
		output_filename = '/tmp/' + k + '_output.mp4',
		output_filename2 = '/tmp/' + k + '_output2.mp4',
		output_filename3 = '/tmp/' + k + '_output3.mp4',
		file = fs.open(filename, 'w'),
		cmd,
		ret,
		tmpfile = '/tmp/output.txt';

	file.write(f);
	file.close();

	for (var i in option) {
		switch (i) {
			case 'rotation':
				var angle = option['rotation'] || 0;

				if (!angle) //ios;
					cmd = 'ffmpeg -y -i ' + filename + ' -r 10 -b:v 1000k -an ' + output_filename + ' 1>/dev/null 2>&1';
				else //android;
					cmd = 'ffmpeg -y -i ' + filename + ' -r 10 -b:v 1000k -metadata:s:v:0 rotate=' + angle + ' -strict -2 -an ' + output_filename + ' 1>/dev/null 2>&1';

				if ((ret = process.system(cmd)) !== 0) throw new Error('process system call: ffmpeg execed faild: rotation failed');

				process.system('rm -f ' + filename);
				break;
			default:
				break;
		}
	}

	//crop the video to square
	cmd = 'ffmpeg -i ' + output_filename + ' 2>&1 | perl -lane \'print $1 if /(\\d{2,}x\\d+)/\' > ' + tmpfile;
	if ((ret = process.system(cmd)) !== 0) throw new Error('process system call: ffmpeg execed faild: get video\'s size failed');
	if (!fs.exists(tmpfile)) return f;
	var line = fs.readFile(tmpfile);
	if (!/^\d+x\d+/.test(line)) return f;
	var w = Number(line.split('x')[0]),
		h = Number(line.split('x')[1]);
	if (w > h) {
		//android
		cmd = 'ffmpeg -y -i ' + output_filename + ' -strict -2 -vf crop=' + h + ':' + h + ':' + Math.floor(w / 2 - h / 2) + ':' + 0 + ' ' + output_filename2 + ' 1>/dev/null 2>&1';
	} else if (w < h) {
		//ios
		cmd = 'ffmpeg -y -i ' + output_filename + ' -strict -2 -vf crop=' + w + ':' + w + ':' + 0 + ':' + Math.floor(h / 2 - w / 2) + ' ' + output_filename2 + ' 1>/dev/null 2>&1';
	} else output_filename2 = output_filename;

	if (w !== h) {
		if ((ret = process.system(cmd)) !== 0) throw new Error('process system call: ffmpeg execed faild: crop the video to square failed');
	}

	//trim non-keyframes before first keyframe out
	cmd = 'ffprobe -select_streams v -show_frames ' + output_filename2 + ' 1>/dev/null 2>&1 > ' + tmpfile;
	if ((ret = process.system(cmd)) !== 0) throw new Error('process system call: ffprobe execed faild: findkeyframes failed');

	if (!fs.exists(tmpfile)) return f;
	var lines = fs.readLines(tmpfile),
		fkft = lines[5] && lines[5].indexOf('pkt_pts_time') > -1 ? lines[5].split('=')[1] : 0;

	if (Number(fkft)) {
		cmd = 'ffmpeg -y -ss ' + fkft + ' -i ' + output_filename2 + ' -vcodec copy -acodec copy ' + output_filename3 + ' 1>/dev/null 2>&1';
		if ((ret = process.system(cmd)) !== 0) throw new Error('process system call: ffmpeg execed faild: trim out non-keyframes failed');
		file = fs.open(output_filename3, 'r');
	} else
		file = fs.open(output_filename2, 'r');

	f = file.readAll();
	file.close();
	process.system('rm -f ' + output_filename + ' ' + output_filename2 + ' ' + output_filename3 + ' ' + tmpfile);

	return f;
}

module.exports = {
	root: {
		getValue: getValue,
		addValue: addValue,
		getInfo: getInfo,
		savefile: savefile
	},
	app: {
		getValue: getValue,
		getInfo: getInfo
	},
	api: {
		photo: function(v, d) {
			var userid = coroutine.current().userid;
			if (!userid) return {
				error: "no login"
			};

			var f = getFile(v);
			if (!f) return {
				error: "file is null"
			};
			var k = HASH(f);
			if (!storage.hasKey(k)) {
				var r = addValue(f, userid, image.JPEG);

				if (!r) return {
					error: "image is invaild"
				}

				k = r.source;
			}
			write(v, {
				id: k
			});
		},
		attachment: function(v, d) {
			var userid = coroutine.current().userid;

			if (!userid) userid = 0;

			var f = getFile(v);
			if (!f) return {
				error: "file is null"
			};
			var k = HASH(f),
				info = getInfo(k);
			if (info) {
				write(v, {
					source: k,
					type: info.type,
					height: info.height,
					width: info.width
				});
			} else {
				var r = addValue(f, userid);

				if (!r) return {
					error: "image is invalid"
				}

				write(v, r);
			}
		},
		video: function(v, d) {
			var userid = coroutine.current().userid,
				ismp4 = v.headers["Content-type"] === "video/mpeg4" ? "mp4" : "";

			if (!userid) return {
				error: "no login"
			};

			if (!ismp4) {
				write(v, {
					error: "invalid content-type"
				});
				return;
			}


			var f = getFile(v);
			if (!f) return {
				error: "file is null"
			};
			var k = HASH(f),
				info = getInfo(k);
			if (info) {
				write(v, {
					source: k,
					type: info.type,
					height: info.height,
					width: info.width
				});
			} else {
				try {
					f = handlevideo(f, k, {
						rotation: v.headers['rotation']
					});
				} catch (e) {
					write(v, {
						error: e.toString()
					});
					return;
				}

				var r = addValue(f, userid, ismp4);

				if (!r) return {
					error: "video is invalid"
				}

				write(v, r);
			}
		}
	}
}