module.exports = app => {
	app.use('/me', require('./apps/me'));
	app.use('/user', require('./apps/user'));
	app.use('/blog', require('./apps/blog'));
	app.use('/message', require('./apps/message'));
};