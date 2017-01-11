var fs = require('fs');
var app = require('express')();
var model = require('./model');
var auth = require('../../utils/auth');
var qiniu = require('../../utils/uploadqiniu');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

app.get('/list', function(req, res, next) {
	model.getList().then(function(data) {
		res.json(data);
	}).catch(next)
});

app.post('/postimg', multipartMiddleware, function(req, res, next) {
	var token = req.body.token || req.cookies.blogtoken;
	auth(token).then(function(data){
		if (!data.res) {
			return res.json(data);
		} else if (req.files && req.files.imgfile) {
			qiniu.uploadFile({
				key: req.files.imgfile.originalFilename,
				filePath: req.files.imgfile.path
			}).then(function(r){
				// 删除临时文件
				fs.unlink(req.files.imgfile.path);
				res.end(JSON.stringify(r));
			});
		} else {
			next();	
		}
	})
});

app.post('/postblog', function(req, res, next) {
	var token = req.body.token || req.cookies.blogtoken;
	auth(token).then(function(data){
		if (!data.res) {
			res.json(data);
		} else {
			model.postBlog(req.body).then(function(data) {
				res.json(data);
			}).catch(next)		
		}
	})
});

module.exports = app;