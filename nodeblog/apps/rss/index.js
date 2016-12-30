var Feed = require('feed');
var model = require('./model');

module.exports = function(req, res, next) {
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    
    var feed = new Feed({
        title: 'Shenzm Rss',
        description: 'Shenzm.志敏的博客',
        id: 'http://shenzm.cn/',
        link: 'http://shenzm.cn/',
        image: 'http://shenzm.cn/6a265edd5498cac7f27a6487f01fde3f.png',
        copyright: 'All rights reserved 2017, Shenzm',
        updated: new Date(),
        author: {
            name: 'Shenzm.志敏',
            email: 'szmalq@163.com',
            link: 'http://shenzm.cn/'
        }
    });

    model.getRssData().then(function(data) {
        data.forEach(function(item) {
            feed.addItem({
                title: item.title,
                link: '//shenzm.cn/blog/message/' + item.bindid,
                description: item.intro,
                author: [{
                    name: 'Shenzm.志敏'
                }],
                date: item.date
            });
        });

        return res.send(feed.render('rss-2.0'));
    }).catch(next)
};