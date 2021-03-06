const markdown = require('../../utils/markdown');
const dbs = require('../../dbs');

module.exports = {
	getWholeData: function(msgid, type) {
		if (!msgid) {
			return Promise.resolve({});
		}

		return Promise.all([dbs.data.list(msgid), dbs.data.list(1, 'blog', msgid)]).then(function(data){
			var res1 = data[0] ? JSON.parse(data[0][0].value) : {};
			var res2 = data[1] ? JSON.parse(data[1][0].value) : {};
			var tag = data[1] ? data[1][0].tag : '';

			return {
				id: msgid,
				tag: tag,
				title: res1.title,
				content: type === 'edit' ? res1.content : markdown(res1.content),
				preid: res1.preid,
				pretitle: res1.pretitle,
				nextid: res1.nextid,
				nexttitle: res1.nexttitle,
				img: res2.img,
				summary: res2.summary
			}
		});
	}
}