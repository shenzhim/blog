const marked = require('./marked');
const markedOptions = {
	renderer: require("./renderer").getRenderer(marked)
};

module.exports = function(code) {
	return marked(code, markedOptions);
}