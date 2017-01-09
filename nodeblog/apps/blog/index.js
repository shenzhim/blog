var app = require('express')();
var model = require('./model');

app.get('/list', function(req, res, next) {
	model.getList().then(function(data) {
		res.json(data);
	}).catch(next)
});

app.post('/postimg', function(req, res, next) {
	res.end("{'code':'1','id':'imgID','src':'test.jpg'}")
});

module.exports = app;