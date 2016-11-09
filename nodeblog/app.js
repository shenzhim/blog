var express = require('express');
var webpack = require('webpack');
var path = require('path');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(require('connect-history-api-fallback')())
if (app.get('env') === 'development') {
	var compiler = webpack(require('./public/webpack.config'))
	var devMiddleware = require('webpack-dev-middleware')(compiler, {
		publicPath: '/',
		stats: {
			colors: true,
			chunks: false
		}
	})
	app.use(devMiddleware);
}

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/dist')));
app.use(compression());

// dispatcher
try {
	require('./dispatch')(app);

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handler
	app.use(function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error');
	});
} catch (err) {
	console.error(err);
}

// listener
app.listen(app.get('port'), function() {
	console.log('blog server start on port: ', app.get('port'));
});