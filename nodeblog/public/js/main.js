import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../vue/app';
import QQ404 from '../vue/qq404';

Vue.use(VueRouter);

const Foo = {
	template: '<div>foo</div>'
}
const Bar = {
	template: '<div>bar</div>'
}

new Vue({
	el: '#app',
	router: new VueRouter({
		mode: 'history',
		routes: [{
			path: '/',
			component: App,
			children: [{
				path: 'foo',
				component: Foo
			}, {
				path: 'bar',
				component: Bar
			}]
		}, {
			path: '*',
			component: QQ404
		}]
	})
})