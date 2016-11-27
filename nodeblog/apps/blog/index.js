var app = require('express')();
var model = require('./model');

app.get('/list', function(req, res, next) {
	model.getList().then(function(data) {
		res.json(data);
	}).catch(next)
});

module.exports = app;