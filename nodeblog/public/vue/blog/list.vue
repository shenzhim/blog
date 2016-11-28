<template>
	<transition name="fade" mode="out-in">
		<div class="blog-list">
			<ul>
				<li v-for="item in list">
				    <router-link :to="'/' + item.msgid">
				    	<img src="http://t.named.cn/f/e20cbd14c8a0fb2e56e81b31b787812a.t358x236.fa.r8.b1x1x3x1xf3f3f3.lfbfbfb.jpg">
				    	<div class="blog-title">
				    		<h4 class="title">{{item.title}}</h4>
				    		<div class="info">
				    			<span v-for="tag in item.tag" class="tag">{{tag}}</span>
				    			<span class="time">{{item.time}}</span>	
				    		</div>
				    	</div>
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