var app = require('express')();
var model = require('./model');

app.post('/login', function(req, res, next) {
	model.auth(req.body.token).then(function(data) {
		res.json(data);
	}).catch(next)
});

module.exports = app;