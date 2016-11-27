<template>
	<transition name="fade" mode="out-in">
		<div class="list message">
			<div class="content" v-html="content"></div>
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
			content: ''
		}
	},
	beforeCreate() {
		this.$http.get('/blog/list').then((response) => {
		    this.content = response.data.content;
		}, (response) => {
			alert("请求数据失败^_^！！！");
		});
	}
}
</script>

