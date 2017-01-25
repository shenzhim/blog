<template>
	<transition name="fade" mode="out-in">
		<div class="blog-list">
			<ul>
				<li v-for="item in list">
				    <router-link :to="'/blog/message/' + item.msgid">
				    	<img :src="item.img || defaultimg">
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
			list: '',
			defaultimg: 'data:image/png;base64,R0lGODlhFAAUAIAAAP///wAAACH5BAEAAAAALAAAAAAUABQAAAIRhI+py+0Po5y02ouz3rz7rxUAOw=='
		}
	},
	beforeCreate() {
		document.title = '博客列表 - 志敏的博客';
		this.$http.get('/blog/list').then((response) => {
		    this.list = response.data || [];
		}, (response) => {
			alert("请求数据失败^_^！！！");
		});
	}
}
</script>