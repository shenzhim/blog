const dbs = require('../../dbs');

module.exports = {
	getRssData: function() {
		return dbs.data.list(1, 'blog').then(function(result) {
			const list = [];
			if (result) {
				result.forEach(function(o) {
					if (o.sort > 0) {
						o.value = JSON.parse(o.value);
						list.unshift({
							title: o.value.title,
							intro: o.value.intro,
							bindid: o.bindid,
							date: new Date(o.created)
						});
					}
				})
			};
			return list;
		});
	}
}