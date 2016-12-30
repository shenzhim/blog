var express = require('express');
var webpack = require('webpack');
var path = require('path');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 3000);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());

// 编辑功能
app.get('/inputpublic/*', function(req, res, next) {
	var options = {
		root: __dirname,
		dotfiles: 'deny'
	};

	var fileName = req.originalUrl.split('?')[0];
	res.sendFile(fileName, options, function(err) {
		if (err) {
			res.status(err.status).end();
		}
	});
});

// rss
app.get('/rss', require('./apps/rss'));

// 兼容老路由
app.use((req, res, next) => {
	if (/^\/blog\/message\.\d+$/.test(req.path)) {
		return res.redirect('/blog/message/' + req.path.split('.')[1]);
	}
	next();
});
app.use(require('connect-history-api-fallback')({
	rewrites: [{
		from: /^\/blog\/me\.html$/, // 兼容老路由
		to: '/index.html'
	}]
}))
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
} else {
	app.use(express.static(path.join(__dirname, 'public/dist')));
}

app.use(compression());

try {
	require('./dispatch')(app);

	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handler
	app.use(function(err, req, res, next) {
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
		console.error(`error at path: ${req.url}`);
		console.error(err);
		res.status(err.status || 500).end();
	});
} catch (err) {
	console.error(err);
}

app.listen(app.get('port'), function() {
	console.log('blog server start on port: ', app.get('port'));
});