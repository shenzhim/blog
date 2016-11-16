import Vue from 'vue';
import VueRouter from 'vue-router';
import App from '../vue/app';

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [{
		path: '/',
		component: App
	}]
})

new Vue({
	el: '#app',
	router
})