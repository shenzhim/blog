"use strict";
require("test").setup();

var parser = require("utils/uaparser");
var util = require("util");

describe("deviceinfo", function() {
	it("利用user-Agent获取设备系统和版本", function() {
		var result = [{
			"name": "iOS",
			"version": "8.2"
		}, {
			"name": "iOS",
			"version": "4.3.2"
		}, {
			"name": "iOS",
			"version": "4.3.2"
		}, {
			"name": "Android",
			"version": "2.3.3"
		}, {
			"name": "Android",
			"version": "2.3.3"
		}, {
			"name": "Symbian",
			"version": "9.3"
		}, {
			"name": "iOS",
			"version": "4.3.3"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Mac OS",
			"version": "10.7.2"
		}, {
			"name": "Mac OS",
			"version": "10.7.2"
		}, {
			"name": "iOS",
			"version": "5.0"
		}, {
			"name": "Windows",
			"version": "7"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "7"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "Windows",
			"version": "XP"
		}, {
			"name": "iOS",
			"version": "5.1"
		}, {
			"name": "Android",
			"version": "2.3.6"
		}, {
			"name": "Android",
			"version": "4.4"
		}, {
			"name": "Android",
			"version": "4.4.2"
		}, {
			"name": "Android",
			"version": "4.4.4"
		}]
		var ua = [
			"Appcelerator Titanium/3.4.0 (iPhone/8.2; iPhone OS; zh_CN;)",
			"Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_2 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5",
			"Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5",
			"MQQBrowser/25 (Linux; U; Android 2.3.3; zh-cn; HTC Desire S Build/GRI40;480*800)",
			"Mozilla/5.0 (Linux; U; Android 2.3.3; zh-cn; HTC_DesireS_S510e Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
			"Mozilla/5.0 (SymbianOS/9.3; U; Series60/3.2 NokiaE75-1 /110.48.125 Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/413 (KHTML, like Gecko) Safari/413",
			"Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile/8J2",
			"Mozilla/5.0 (Windows NT 5.2) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.122 Safari/534.30",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22",
			"Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A5313e Safari/7534.48.3",
			"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1",
			"Mozilla/5.0 (Windows NT 5.2) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.122 Safari/534.30",
			"Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0",
			"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2; Trident/4.0; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET4.0E; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C)",
			"Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2; .NET CLR 1.1.4322; .NET CLR 2.0.50727; .NET4.0E; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C)",
			"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727) ",
			"Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)",
			"Opera/9.80 (Windows NT 5.1; U; zh-cn) Presto/2.9.168 Version/11.50",
			"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)",
			"Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; .NET4.0E; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET4.0C)",
			"Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
			"Mozilla/5.0 (Windows; U; Windows NT 5.1; ) AppleWebKit/534.12 (KHTML, like Gecko) Maxthon/3.0 Safari/534.12",
			"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; TheWorld)",
			"Mozilla/5.0 (iPhone; CPU iPhone OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B176 MicroMessenger/4.3.2",
			"Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 MicroMessenger/4.5.255",
			"Mozilla/5.0 (Linux; U; Android 4.4; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 MicroMessenger/4.5.255",
			"Mozilla/5.0 (Linux; Android 4.4.2; SM705 Build/SANFRANCISCO) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36",
			"Mozilla/5.0 (Linux; U; Android 4.4.4; zh-CN; M351 Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.0.0.488 U3/0.8.0 Mobile Safari/534.30"
		]
		var rs = [];
		ua.forEach(function(o) {
			var rst = new parser().setUA(o).getResult();
			rs.push(rst.os);
		})
		assert.deepEqual(rs, result);
	})
});