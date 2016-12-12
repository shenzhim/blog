<template>
	<transition name="fade" mode="out-in">
		<div class="message">
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
		this.$http.get(`/message/data?msgid=${this.$route.params.id}`).then((response) => {
			this.title = response.data.title;
		    this.content = response.data.content;
		}, (response) => {
			alert("请求数据失败！")
		});
	}
}
</script>