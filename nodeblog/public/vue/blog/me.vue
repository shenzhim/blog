<template>
	<transition name="fade" mode="out-in">
		<div class="me message">
			<h2 class="title">{{title}}</h2>
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
			title: '',
			content: ''
		}
	},
	beforeCreate() {
		this.$http.get('/me/data').then((response) => {
			this.title = response.data.title;
		    this.content = response.data.content;
		}, (response) => {
			alert("请求数据失败！")
		});
	}
}
</script>

<style>
	@import "../../css/message";
	
	.me {
		ul {
			list-style-type: disc;
			font-size: 20px;
			line-height: 2;
		}
	}
</style>