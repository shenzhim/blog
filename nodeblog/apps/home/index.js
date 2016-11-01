var app = require('express')();

app.get('/test', function(req, res, next) {
	res.json("home test2");
});


module.exports = app;