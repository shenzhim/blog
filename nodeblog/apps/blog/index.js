var app = require('express')();
var model = require('./model');
var qiniu = require('../../utils/uploadqiniu');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

app.get('/list', function(req, res, next) {
	model.getList().then(function(data) {
		res.json(data);
	}).catch(next)
});

app.post('/postimg', multipartMiddleware, function(req, res, next) {
	if (req.files && req.files.imgfile) {
		qiniu.uploadFile({
			key: req.files.imgfile.originalFilename,
			filePath: req.files.imgfile.path
		}).then(function(r){
			res.end(JSON.stringify(r));
		}).catch(function(){
			res.end(JSON.stringify({}));
		});
	}
});

module.exports = app;