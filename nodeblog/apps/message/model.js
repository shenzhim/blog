const markdown = require('../../utils/markdown');
const dbs = require('../../dbs');

module.exports = {
	getData: function(msgid) {
		if (!msgid) {
			return Promise.reslove({});
		}

		return dbs.data.list(msgid).then(function(result) {
			result = result ? JSON.parse(result[0].value) : {};

			return {
				title: result.title,
				content: markdown(result.content)
			}
		});
	}
}