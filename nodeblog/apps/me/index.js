var app = require('express')();

app.get('/data', function(req, res, next) {
	res.json("me test2");
});

module.exports = app;