const marked = require('./marked');
const markedOptions = {
	highlight: function(code) {
		return require('highlight.js').highlightAuto(code).value;
	},
	renderer: require("./renderer").getRenderer(marked)
};

module.exports = function(code) {
	return marked(code, markedOptions);
}