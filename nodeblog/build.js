require('shelljs/global');
var path = require('path');
var webpack = require('webpack');
var webpackConfig = require('./public/webpack.config');

var assetsPath = path.resolve(__dirname, './public/dist');
rm('-rf', assetsPath);
mkdir('-p', assetsPath);

cp('./public/robots.txt', assetsPath);
cp('./public/baidu_verify_Z2tHIjmxwm.html', assetsPath);
cp('./public/MP_verify_tjeBVjCbW6jU8XJW.txt', assetsPath);
cp('./public/particles.min.js', assetsPath);

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