module.exports = app => {
	app.use('/me', require('./apps/me'));
	app.use('/blog', require('./apps/blog'));
};