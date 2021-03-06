var app = require('express')();
var model = require('./model');

app.get('/data', function(req, res, next) {
	model.getWholeData(req.query.msgid).then(function(data) {
		res.json(data);
	}).catch(next)
});

app.post('/editdata', function(req, res, next) {
	model.getWholeData(req.body.msgid, 'edit').then(function(data) {
		res.json(data);
	}).catch(next)
});

module.exports = app;