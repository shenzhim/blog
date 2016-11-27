const dbs = require('../../dbs');

module.exports = {
	getList: function() {
		return dbs.data.list(1, 'blog').then(function(result) {
			var list = [];

			if (result) {
				result.forEach(function(o) {
					if (o.sort > 0) {
						list.push({
							title: JSON.parse(o.value).title,
							msgid: o.bindid,
							tag: o.tag
						});
					}
				})
			};
			return list;
		});
	}
}