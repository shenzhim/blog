module.exports = app => {
    app.use('/', function(req, res, next) {
        res.json("fuck you")
    });

    app.use('/home', require('./apps/home'));
};