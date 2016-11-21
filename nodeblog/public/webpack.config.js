const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const postcssPlugin = () => {
    return [
        require('precss'),
        // require('postcss-pxtorem')({
        //     rootValue: 40,
        //     unitPrecision: 5, // 保留5位小数字
        //     minPixelValue: 2, // 小于 2 时，不转换
        //     selectorBlackList: [], // 选择器黑名单，可以使用正则
        //     propWhiteList: [] // 属性名称为空，表示替换所有属性的值
        // }),
        require('autoprefixer')({
            browsers: ['> 1%']
        })
    ];
};

const cssLoader = () => {
    if (process.env.NODE_ENV === 'production') {
        return ExtractTextPlugin.extract('vue-style', 'css');
    }
    return 'vue-style!css';
}

const config = {
    devtool: '#cheap-module-eval-source-map',
    entry: {
        app: [path.join(__dirname, './js/main.js'), path.join(__dirname, './js/sprite.js')],
        vendor: ['vue', 'vue-router', 'vue-resource']
    },
    output: {
        path: path.join(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].[hash].js'
    },
    resolve: {
        extensions: ['', '.js', '.vue', '.css'],
        fallback: [path.join(__dirname, '../node_modules')],
        alias: {
            'vue$': 'vue/dist/vue'
        }
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loader: cssLoader()
        }, {
            test: /\.vue$/,
            loader: 'vue'
        }, {
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loaders: ['url?limit=10000&[name].[hash:7].[ext]', 'image-webpack?{optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}, mozjpeg: {quality: 65}}'],
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
            css: cssLoader()
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
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: __dirname + '/index.tmpl.html',
            inject: true
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
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: __dirname + '/index.tmpl.html',
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            chunksSortMode: 'dependency'
        })
    )
}
module.exports = config;