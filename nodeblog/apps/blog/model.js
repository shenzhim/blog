const dbs = require('../../dbs');
const date = require("../../utils/date");

let _execMsg = function(params, method) {
	if (method === 'add') {
		return dbs.data.insertMsg(params.id, JSON.stringify({
			title: params.title,
			content: params.content,
			preid: '',
			pretitle: '',
			nextid: '',
			nexttitle: ''
		}));
	} else {
		return dbs.data.updateMsg(params.id, JSON.stringify({
			title: params.title,
			content: params.content,
			preid: '',
			pretitle: '',
			nextid: '',
			nexttitle: ''
		}));
	}
}

let _execBlog = function(params, method) {
	if (method === 'add') {
		return dbs.data.addBlog(params.id, params.tag, JSON.stringify({
			title: params.title,
			img: params.img,
			summary: params.summary
		}));	
	} else {
		return dbs.data.updateBlog(params.id, params.tag, JSON.stringify({
			title: params.title,
			img: params.img,
			summary: params.summary
		}));	
	}
}

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
		return dbs.data.genId().then(function(id) {
			var data = {
				res: "fail"
			}

			if (!id) return Promise.resolve(data);

			params.id = id;
			return Promise.all([_execMsg(params, 'add'), _execBlog(params, 'add')]).then(function(result){
				if (result[0] && result[1]) {
					data.res = "success";
				} 
				return Promise.resolve(data)
			})
		})
	},
	editBlog: function(params) {
		var data = {
			res: "fail"
		}
		return Promise.all([_execMsg(params, 'upd'), _execBlog(params, 'upd')]).then(function(result){
			if (result[0] && result[1]) {
				data.res = "success";
			} 
			return Promise.resolve(data)
		})
	}
}