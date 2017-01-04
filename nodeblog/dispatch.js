module.exports = app => {
	app.use('/me', require('./apps/me'));
	app.use('/auth', require('./apps/auth'));
	app.use('/blog', require('./apps/blog'));
	app.use('/message', require('./apps/message'));
};