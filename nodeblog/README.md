# blog（nodejs）

目前准备重构一次博客网站，采用的技术栈如下，主要目的有两个，一是要优化博客的前端体验，二是要体验下刚发布的vue2.0。

# 服务端
 	采用express框架，用async／await 解决异步回调问题

	采用pm2来启动及监控node服务状况。

# ui端
	框架：采用vuex 2.0框架，及vue-router, vue-resource 搭建一个SPA应用。

	css：采用postcss处理css，动画效果采用Aminate.css 动画库。

	构建工具：采用gulp＋webpack，gulp的好处是任务式流程，利用Node.js流，可以快速构建项目并减少频繁的IO操作。

	小图标：采用gulp-svg-sprite库，适配强，自动话程度高

# 启动流程
	1. npm install 
	
	2. 开发环境：npm run dev

	3. 生产环境：pm2 startOrRestart process.json
