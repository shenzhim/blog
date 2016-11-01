module.exports = app => {
    app.use('/home', require('./apps/home'));

    app.use('/', function(req, res, next) {
        res.json("fuck you");
    });
};