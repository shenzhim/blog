const dbs = require('../../dbs');

module.exports = {
	auth: function(token) {
		return dbs.data.list(0, 'token').then(function(result) {
			let res = false;
			if (result) {
				result.forEach(function(o) {
					o.value = JSON.parse(o.value);
					if (o.value.val === token) {
						res = true;	
					}
				})
			};
			return {
				res: res
			};
		});
	}
}