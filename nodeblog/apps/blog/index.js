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
		} else if (req.files && req.files.file) {
			qiniu.uploadFile({
				key: req.files.file.originalFilename,
				filePath: req.files.file.path
			}).then(function(r){
				// 删除临时文件
				fs.unlink(req.files.file.path);

				r.success = 1;
				r.url = '//img.shenzm.cn/' + r.key;
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
			if (req.body.id) {
				// 编辑
				model.editBlog(req.body).then(function(data) {
					res.json(data);
				}).catch(next)
			} else {
				// 新增
				model.postBlog(req.body).then(function(data) {
					res.json(data);
				}).catch(next)
			}
		}
	})
});

module.exports = app;