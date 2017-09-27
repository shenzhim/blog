var defaults = {
	toc: true, // Table of contents
	tocm: false,
	tocStartLevel: 1, // Said from H1 to create ToC  
	pageBreak: true,
	atLink: true, // for @link
	emailLink: true, // for mail address auto link
	taskList: false, // Enable Github Flavored Markdown task lists
	emoji: false, // :emoji: , Support Twemoji, fontAwesome, Editor.md logo emojis.
	tex: false, // TeX(LaTeX), based on KaTeX
	flowChart: false, // flowChart.js only support IE9+
	sequenceDiagram: false, // sequenceDiagram.js only support IE9+
};

var regexs = {
	atLink: /@(\w+)/g,
	email: /(\w+)@(\w+)\.(\w+)\.?(\w+)?/g,
	emailLink: /(mailto:)?([\w\.\_]+)@(\w+)\.(\w+)\.?(\w+)?/g,
	emoji: /:([\w\+-]+):/g,
	emojiDatetime: /(\d{2}:\d{2}:\d{2})/g,
	twemoji: /:(tw-([\w]+)-?(\w+)?):/g,
	fontAwesome: /:(fa-([\w]+)(-(\w+)){0,}):/g,
	editormdLogo: /:(editormd-logo-?(\w+)?):/g,
	pageBreak: /^\[[=]{8,}\]$/
};

exports.getRenderer = function(markdown) {
	var markedRenderer = new markdown.Renderer();
	markedRenderer.emoji = function(text) {
		var emoji = { // Emoji graphics files url path
			path: "http://www.emoji-cheat-sheet.com/graphics/emojis/",
			ext: ".png"
		};

		var twemoji = { // Twitter Emoji (Twemoji)  graphics files url path    
			path: "http://twemoji.maxcdn.com/36x36/",
			ext: ".png"
		};
		text = text.replace(/(\d{2}:\d{2}:\d{2})/g, function($1) {
			return $1.replace(/:/g, "&#58;");
		});
		var matchs = text.match(/:([\w\+-]+):/g);
		if (!matchs) {
			return text;
		}

		for (var i = 0, len = matchs.length; i < len; i++) {
			if (matchs[i] === ":+1:") {
				matchs[i] = ":\\+1:";
			}

			text = text.replace(new RegExp(matchs[i]), function($1, $2) {
				var faMatchs = $1.match(/:(fa-([\w]+)(-(\w+)){0,}):/g);
				var name = $1.replace(/:/g, "");

				if (faMatchs) {
					for (var fa = 0, len1 = faMatchs.length; fa < len1; fa++) {
						var faName = faMatchs[fa].replace(/:/g, "");

						return "<i class=\"fa " + faName + " fa-emoji\" title=\"" + faName.replace("fa-", "") + "\"></i>";
					}
				} else {
					var emdlogoMathcs = $1.match(/:(editormd-logo-?(\w+)?):/g);
					var twemojiMatchs = $1.match(/:(tw-([\w]+)-?(\w+)?):/g);

					if (emdlogoMathcs) {
						for (var x = 0, len2 = emdlogoMathcs.length; x < len2; x++) {
							var logoName = emdlogoMathcs[x].replace(/:/g, "");
							return "<i class=\"" + logoName + "\" title=\"Editor.md logo (" + logoName + ")\"></i>";
						}
					} else if (twemojiMatchs) {
						for (var t = 0, len3 = twemojiMatchs.length; t < len3; t++) {
							var twe = twemojiMatchs[t].replace(/:/g, "").replace("tw-", "");
							return "<img src=\"" + twemoji.path + twe + twemoji.ext + "\" title=\"twemoji-" + twe + "\" alt=\"twemoji-" + twe + "\" class=\"emoji twemoji\" />";
						}
					} else {
						var src = (name === "+1") ? "plus1" : name;
						src = (src === "black_large_square") ? "black_square" : src;
						src = (src === "moon") ? "waxing_gibbous_moon" : src;

						return "<img src=\"" + emoji.path + src + emoji.ext + "\" class=\"emoji\" title=\"&#58;" + name + "&#58;\" alt=\"&#58;" + name + "&#58;\" />";
					}
				}
			});
		}

		return text;
	};

	markedRenderer.atLink = function(text) {
		var urls = {
			atLinkBase: "https://github.com/"
		};
		if (regexs.atLink.test(text)) {
			if (defaults.atLink) {
				text = text.replace(regexs.email, function($1, $2, $3, $4) {
					return $1.replace(/@/g, "_#_&#64;_#_");
				});

				text = text.replace(regexs.atLink, function($1, $2) {
					return "<a href=\"" + urls.atLinkBase + "" + $2 + "\" title=\"&#64;" + $2 + "\" class=\"at-link\">" + $1 + "</a>";
				}).replace(/_#_&#64;_#_/g, "@");
			}

			if (defaults.emailLink) {
				text = text.replace(regexs.emailLink, function($1, $2, $3, $4, $5) {
					var arr = "jpg|jpeg|png|gif|webp|ico|icon|pdf".split("|");
					return (!$2 && arr.indexOf($5) < 0) ? "<a href=\"mailto:" + $1 + "\">" + $1 + "</a>" : $1;
				});
			}
			return text;
		}
		return text;
	};

	markedRenderer.link = function(href, title, text) {
		var out = "<a href=\"" + href + "\"";
		if (regexs.atLink.test(title) || regexs.atLink.test(text)) {
			if (title) out += " title=\"" + title.replace(/@/g, "&#64;");
			return out + "\">" + text.replace(/@/g, "&#64;") + "</a>";
		}
		if (title) out += " title=\"" + title + "\"";

		out += " target='_blank'>" + text + "</a>";
		return out;
	};

	markedRenderer.heading = function(text, level, raw) {
		var trim = function(str) {
			return (!String.prototype.trim) ? str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") : str.trim();
		};

		var linkText = text;
		var hasLinkReg = /\s*\<a\s*href\=\"(.*)\"\s*([^\>]*)\>(.*)\<\/a\>\s*/;
		var getLinkTextReg = /\s*\<a\s*([^\>]+)\>([^\>]*)\<\/a\>\s*/g;

		if (hasLinkReg.test(text)) {
			var tempText = [];
			text = text.split(/\<a\s*([^\>]+)\>([^\>]*)\<\/a\>/);

			for (var i = 0, len = text.length; i < len; i++) {
				tempText.push(text[i].replace(/\s*href\=\"(.*)\"\s*/g, ""));
			}
			text = tempText.join(" ");
		}

		text = trim(text);
		var escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
		var isChinese = /^[\u4e00-\u9fa5]+$/.test(text);
		var id = (isChinese) ? escape(text).replace(/\%/g, "") : text.toLowerCase().replace(/[^\w]+/g, "-");

		var headingHTML = "<h" + level + " id=\"h" + level + "-" + this.options.headerPrefix + id + "\">";
		headingHTML += "<a name=\"" + text + "\" class=\"reference-link\"></a>";
		headingHTML += "<span class=\"header-link octicon octicon-link\"></span>";
		headingHTML += (hasLinkReg) ? this.atLink(this.emoji(linkText)) : this.atLink(this.emoji(text));
		headingHTML += "</h" + level + ">";

		return headingHTML;
	};

	markedRenderer.pageBreak = function(text) {
		if (regexs.pageBreak.test(text)) {
			text = "<hr style=\"page-break-after:always;\" class=\"page-break editormd-page-break\" />";
		}

		return text;
	};

	markedRenderer.paragraph = function(text) {
		var isTeXInline = /\$\$(.*)\$\$/g.test(text);
		var isTeXLine = /^\$\$(.*)\$\$$/.test(text);
		var isTeXAddClass = (isTeXLine) ? " class=\"" + "editormd-tex" + "\"" : "";
		var isToC = /^\[TOC\]$/.test(text);
		var isToCMenu = /^\[TOCM\]$/.test(text);

		if (!isTeXLine && isTeXInline) {
			text = text.replace(/(\$\$([^\$]*)\$\$)+/g, function($1, $2) {
				return "<span class=\"" + "editormd-tex" + "\">" + $2.replace(/\$/g, "") + "</span>";
			});
		} else {
			text = (isTeXLine) ? text.replace(/\$/g, "") : text;
		}

		var tocHTML = "<div class=\"markdown-toc editormd-markdown-toc\">" + text + "</div>";
		return (isToC) ? ((isToCMenu) ? "<div class=\"editormd-toc-menu\">" + tocHTML + "</div><br/>" : tocHTML) : ((regexs.pageBreak.test(text)) ? this.pageBreak(text) : "<p" + isTeXAddClass + ">" + this.atLink(this.emoji(text)) + "</p>\n");
	};

	markedRenderer.code = function(code, lang, escaped) {

		if (lang === "seq" || lang === "sequence") {
			return "<div class=\"sequence-diagram\">" + code + "</div>";
		} else if (lang === "flow") {
			return "<div class=\"flowchart\">" + code + "</div>";
		} else if (lang === "math" || lang === "latex" || lang === "katex") {
			return "<p class=\"" + "editormd-tex" + "\">" + code + "</p>";
		} else {

			return markdown.Renderer.prototype.code.apply(this, arguments);
		}
	};

	markedRenderer.tablecell = function(content, flags) {
		var type = (flags.header) ? "th" : "td";
		var tag = (flags.align) ? "<" + type + " style=\"text-align:" + flags.align + "\">" : "<" + type + ">";

		return tag + this.atLink(this.emoji(content)) + "</" + type + ">\n";
	};

	markedRenderer.listitem = function(text) {
		if (true && /^\s*\[[x\s]\]\s*/.test(text)) {
			text = text.replace(/^\s*\[\s\]\s*/, "<input type=\"checkbox\" class=\"task-list-item-checkbox\" /> ")
				.replace(/^\s*\[x\]\s*/, "<input type=\"checkbox\" class=\"task-list-item-checkbox\" checked disabled /> ");

			return "<li style=\"list-style: none;\">" + this.atLink(this.emoji(text)) + "</li>";
		} else {
			return "<li>" + this.atLink(this.emoji(text)) + "</li>";
		}
	};
	return markedRenderer
}