'use strict';
require('shelljs/global');
const cache = require('./dbs/cache')();
const ChromeRender = require('chrome-render');

const CrawlerUserAgents = [
    'googlebot',
    'yahoo',
    'bingbot',
    'Baiduspider', // http://baidu.com/search/spider.htm
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'WhatsApp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'SkypeUriPreview',
    'nuzzel',
    'Discordbot',
    'Google Page Speed',
    'Qwantify'
];

const exculdeFile = [
    /\.(png|jpe?g|gif|svg)(\?.*)?$/,
    /\.js$/
]

function isCrawler(request) {
    const userAgent = request.headers['user-agent'];
    for (let i = 0; i < CrawlerUserAgents.length; i++) {
        const keyword = CrawlerUserAgents[i];
        if (userAgent.indexOf(keyword) >= 0) {
            return true;
        }
    }
    return false;
}

function isExculde(url) {
    for (let i = 0; i < exculdeFile.length; i++) {
        if (exculdeFile[i].test(url)) {
            return true;
        }
    }
    return false;
}

module.exports = function() {
    exec('pgrep chrome | sudo xargs kill -s 9');

    let chromeRender;
    (async() => {
        chromeRender = await ChromeRender.new({});
    })();

    return function(req, res, next) {
        var isChromeRender = false;
        if (req.headers['x-chrome-render'] !== undefined) {
            isChromeRender = true;
        }
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        if (!isChromeRender && !isExculde(fullUrl) && isCrawler(req)) {
            var cacheKey = req.originalUrl;
            cache.get(cacheKey).then(htmlString => {
                if (htmlString) {
                    return htmlString;
                } else {
                    return chromeRender.render({
                        url: fullUrl,
                    }).then(htmlString => {
                        cache.set(cacheKey, htmlString);
                        return htmlString;
                    });
                }
            }).then(htmlString => {
                res.end(htmlString);
            }).catch(() => {
                chromeRender.render({
                    url: fullUrl,
                }).then(htmlString => {
                    res.end(htmlString);
                }).catch(next);
            });
        } else {
            next();
        }
    }
};