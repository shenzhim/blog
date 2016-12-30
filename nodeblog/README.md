# blog（nodejs）

目前重构一次博客网站，采用的技术栈如下，主要目的有两个，一是要优化博客的前端体验，二是要体验下刚发布的vue2.0。

# 服务端
 	采用express框架。

	采用pm2来启动及监控node服务状况。

# ui端
	框架：采用vuex 2.0框架，及vue-router, vue-resource 搭建一个SPA应用。

	css：采用postcss处理css，动画效果采用Aminate.css 动画库。

	构建工具：采用webpack打包。

	小图标：采用svg-sprite，适配强，自动话程度高

# 启动流程
	1. npm install 
	
	2. 开发环境：npm run dev

	3. 编译：npm run build

	3. 生产环境：npm run server

# TODO
	1. 增加博客在线编写功能 （✅）
	
	2. 增加博客在线修改功能 （✅）
	
	3. 增加评论功能 （✅）
	
	4. 支持翻页功能 （✅）

	5. rss订阅功能（✅）

	6. 增加seo功能

	7. 手机端样式适配 （✅）
