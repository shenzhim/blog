var app = require('express')();
var auth = require('../../utils/auth');

app.post('/auth', function(req, res, next){
	var token = req.body.token || req.cookies.blogtoken;
	
	auth(token).then(function(data){
		res.json(data);
	})
});

module.exports = app;