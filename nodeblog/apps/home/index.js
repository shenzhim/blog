var express = require('express'),
	path = require('path');

var app = express();

// set view engin
var doraemon = path.join(__dirname, '../../doraemon/views'); // parent view root

app.on('mount', function(parent) {
	delete parent.locals.settings; // 不继承父 App 的设置
	Object.assign(app.locals, parent.locals);
});

app.use(global.yoho.hbs({
	extname: '.hbs',
	defaultLayout: 'layout',
	layoutsDir: doraemon,
	partialsDir: path.join(__dirname, './views/partial'),
	views: path.join(__dirname, 'views/action'),
	helpers: global.yoho.helpers
}));

// router
app.use(require('./router'));

const router = express.Router(); // eslint-disable-line
router.get('/user/qrcode', userQrcode.index);

module.exports = app;