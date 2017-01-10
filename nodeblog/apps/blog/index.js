var app = require('express')();
var model = require('./model');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

app.get('/list', function(req, res, next) {
	model.getList().then(function(data) {
		res.json(data);
	}).catch(next)
});

app.post('/postimg', multipartMiddleware, function(req, res, next) {
	var files = req.files && req.files.imgfile || [];
	if (Array.isArray(files)) {
		files = [files];
	}


	res.end("{'code':'1','id':'imgID','src':'test.jpg'}")
});

module.exports = app;