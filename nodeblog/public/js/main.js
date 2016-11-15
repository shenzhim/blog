import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../vue/app';

Vue.use(VueRouter);

const Foo = {
	template: '<div>foo</div>'
}
const Bar = {
	template: '<div>bar</div>'
}

const router = new VueRouter({
	routes: [{
		path: '/foo',
		component: Foo
	}, {
		path: '/bar',
		component: Bar
	}]
})

new Vue({
	el: '#app',
	components: {
		App
	},
	router
})