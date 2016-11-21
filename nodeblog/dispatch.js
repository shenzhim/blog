module.exports = app => {
	app.use('/me', require('./apps/me'));
};