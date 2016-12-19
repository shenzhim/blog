import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../vue/app';
import Blog from '../vue/blog/index';
import Message from '../vue/blog/message';
import Me from '../vue/blog/me';
import List from '../vue/blog/list';
import QQ404 from '../vue/qq404';

Vue.use(VueRouter);

new Vue({
	el: '#app',
	router: new VueRouter({
		mode: 'history',
		routes: [{
			path: '',
			component: App,
		}, {
			path: '/blog',
			component: Blog,
			children: [{
				path: 'me',
				component: Me,
				alias: '/blog/me.html'
			}, {
				path: 'list',
				component: List
			}, {
				path: 'message/:id',
				component: Message
			}]
		}, {
			path: '*',
			component: QQ404
		}],
		scrollBehavior (to, from, savedPosition) {
    		if (savedPosition) {
			    return savedPosition
			} else {
			    return { x: 0, y: 0 }
			}
  		}
	})
})