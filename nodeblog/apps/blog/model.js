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
						list.push({
							title: o.value.title,
							msgid: o.bindid,
							tag: o.tag.split(' · '),
							img: o.value.img,
							time: date.format(new Date(o.created), "yyyy年 MM月 dd日")
						});
					}
				})
			};
			return list;
		});
	}
}