# blog（nodejs）

目前准备重构一次博客网站，采用的技术栈如下，主要目的有两个，一是要优化博客的前端体验，二是要体验下刚发布的vue2.0。

# 服务端
 	采用express框架，用async／await 解决异步回调问题，同时采用vue2.0的服务端渲染。

	采用pm2来启动及监控node服务状况。

# ui端
	框架：采用vuex 2.0框架，及vue-router, vue-resource及vue-cli 。

	css：采用postcss处理css，动画效果采用Aminate.css 动画库。

	构建工具：采用gulp＋webpack，gulp的好处是任务式流程，利用Node.js流，可以快速构建项目并减少频繁的IO操作。

