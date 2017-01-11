const dbs = require('../../dbs');
const date = require("../../utils/date");

module.exports = {
	getList: function() {
		return dbs.data.list(1, 'blog').then(function(result) {
			const list = [];
			if (result) {
				result.forEach(function(o) {
					if (o.sort > 0) {
						o.value = JSON.parse(o.value);
						list.unshift({
							title: o.value.title,
							intro: o.value.intro,
							msgid: o.bindid,
							tag: o.tag.split(' · '),
							img: o.value.img + '?imageView2/2/w/320/h/240/interlace/1/q/60',
							time: date.format(new Date(o.created), "yyyy年 MM月 dd日")
						});
					}
				})
			};
			return list;
		});
	},
	postBlog: function(params) {
		console.log(params)
		return Promise.resolve({"res":"success"})
	}
}