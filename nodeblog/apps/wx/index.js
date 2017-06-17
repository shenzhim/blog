var app = require('express')();
var config = require('./config');
var fetch = require('node-fetch');
var sha1 = require('sha1');

var getAccessToken = function() {
	return new Promise(function(reslove, reject) {
		var accessToken = config.accessToken;
		if (!accessToken || new Date().getTime() - accessToken.time >= accessToken.expires * 1000) {
			fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`)
			.then(res => res.json())
			.then(json => {
				config.accessToken = {
					token: json.access_token,
					expires: json.expires_in,
					time: new Date().getTime()
				}
				reslove(json.access_token);
			});	
		} else {
			reslove(accessToken.token);
		}
	})
}

var getTicket = function(token) {
	return new Promise(function(reslove, reject) {
		var ticketInfo = config.ticketInfo;
		if (!ticketInfo || new Date().getTime() - ticketInfo.time >= ticketInfo.expires * 1000) {
			fetch(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`)
			.then(res => res.json())
			.then(json => {
				config.ticketInfo = {
					ticket: json.ticket,
					expires: json.expires_in,
					time: new Date().getTime()
				}
				reslove(json.ticket);
			});	
		} else {
			reslove(ticketInfo.ticket);
		}
	})	
}

app.get('/config', function(req, res, next){
	getAccessToken().then(token => {
		return getTicket(token).then(ticket => {
			var url =  req.query.url;
			var timestamp = Math.floor(new Date().getTime() / 1000);
			var str = `jsapi_ticket=${ticket}&noncestr=${config.noncestr}&timestamp=${timestamp}&url=${url}`;

			res.json({
				appId: config.appid,
				timestamp: timestamp,
				nonceStr: config.noncestr,
				signature: sha1(str)
			});
		})
	}).catch(next)
});

module.exports = app;