<template>
	<transition name="fade" mode="out-in">
		<div class="me" v-html="mehtml">
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
			mehtml:''
		}
	},
	beforeCreate() {
		this.$http.get('/me/data').then((response) => {
		    this.mehtml = response.data.content;
		}, (response) => {
			alert("请求数据失败！")
		});
	}
}
</script>

<style>
  @import "../../css/me";
</style>