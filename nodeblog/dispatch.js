module.exports = app => {
	app.use('/home', require('./apps/home'));
};