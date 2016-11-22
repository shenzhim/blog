const dbs = require('../../dbs');

module.exports = {
	getData: function() {
		return dbs.data.list(2).then(function(result) {
			result = result ? JSON.parse(result[0].value) : {};

			return {
				title: result.title,
				content: result.content
			}
		});
	}
}