## About blog server

## 启动服务
#### 开发环境
	fibjs tools/init.js blog dev		--	初始化数据库
	fibjs entry/server.js blog dev		--	运行服务

#### 生产环境
	fibjs entry/server.js blog prod

## Test

	fibjs entry/test.js

#### 分模块运行
	fibjs entry/test.js apps/utils/api/modules
