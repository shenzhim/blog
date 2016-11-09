const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const postcssPlugin = () => {
    return [
        require('precss'),
        require('postcss-pxtorem')({
            rootValue: 40,
            unitPrecision: 5, // 保留5位小数字
            minPixelValue: 2, // 小于 2 时，不转换
            selectorBlackList: [], // 选择器黑名单，可以使用正则
            propWhiteList: [] // 属性名称为空，表示替换所有属性的值
        }),
        require('autoprefixer')({
            browsers: ['> 1%']
        })
    ];
};

const config = {
    devtool: '#cheap-module-eval-source-map',
    entry: {
        app: path.join(__dirname, '/js/main.js'),
        vendor: ['vue', 'vue-router']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.js', '.vue'],
        fallback: [path.join(__dirname, '../node_modules')],
        alias: {
            'vue$': 'vue/dist/vue'
        },
        modulesDirectories: ['node_modules', './vue', './css', './js']
    },
    resolveLoader: {
        fallback: [path.join(__dirname, '../node_modules')]
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('vue-style', 'css')
        }, {
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }]
    },
    vue: {
        postcss: {
            plugins: postcssPlugin(),
            options: {
                parser: require('postcss-scss')
            }
        },
        autoprefixer: false,
        loaders: {
            css: ExtractTextPlugin.extract('vue-style', 'css')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js'
        })
    ]
}

if (process.env.NODE_ENV === 'development') {
    config.plugins.push(new webpack.NoErrorsPlugin());
} else if (process.env.NODE_ENV === 'production') {
    config.devtool = '#cheap-module-source-map';
    config.plugins.push(
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    )
}
module.exports = config;