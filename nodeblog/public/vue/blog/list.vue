<template>
	<transition name="fade" mode="out-in">
		<div class="blog-list">
			<ul>
				<li v-for="item in list">
				    <router-link :to="'/' + item.msgid">
				    	<img src="">
				    	<span>{{item.title}}</span>
				    </router-link>
				</li>
			</ul>
		</div>
	</transition>
</template>

<script>
import Vue from 'vue';
import VueResource from 'vue-resource';
Vue.use(VueResource);

export default {
	data() {
		return {
			list: ''
		}
	},
	beforeCreate() {
		this.$http.get('/blog/list').then((response) => {
		    this.list = response.data || [];
		}, (response) => {
			alert("请求数据失败^_^！！！");
		});
	}
}
</script>

<style>
	@import "../../css/list";

</style>