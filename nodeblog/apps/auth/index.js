var app = require('express')();
var model = require('./model');

app.get('/login', function(req, res, next) {
	model.auth(req.query.token).then(function(data) {
		res.json(data);
	}).catch(next)
});

module.exports = app;