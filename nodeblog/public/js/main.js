import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../vue/app';
import Me from '../vue/me';
import BlogLst from '../vue/blog-lst';
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
			path: '/me',
			component: Me,
			alias: '/blog/me.html'
		}, {
			path: '/bloglst',
			component: BlogLst
		}, {
			path: '*',
			component: QQ404
		}]
	})
})