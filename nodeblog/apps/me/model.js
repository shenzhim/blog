var dbs = require('../../dbs');

module.exports = {
	getData: function() {
		return dbs.data.list();
	}
}