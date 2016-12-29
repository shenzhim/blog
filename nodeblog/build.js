require('shelljs/global');
var path = require('path');
var webpack = require('webpack');
var webpackConfig = require('./public/webpack.config');

var assetsPath = path.resolve(__dirname, './public/dist');
rm('-rf', assetsPath);
mkdir('-p', assetsPath);
cp('robots.txt', assetsPath);

webpack(webpackConfig, function(err, stats) {
	if (err) throw err
	process.stdout.write(stats.toString({
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false
	}) + '\n');
})