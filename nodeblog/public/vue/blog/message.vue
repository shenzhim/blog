<template>
	<transition name="fade" mode="out-in">
		<div class="message">
			<h2 class="title">{{title}}</h2>
			<div class="content" v-html="content"></div>
			<!-- 多说评论框 start -->
			<div class="ds-thread" :data-thread-key="$route.params.id" :data-title="title" :data-url="url"></div>
			<!-- 多说评论框 end -->
		</div>
	</transition>
</template>

<script>
import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

window.duoshuoQuery = {short_name:"shenzm"};

export default {
	data() {
		return {
			title: '',
			content: '',
			url: location.href
		}
	},
	beforeCreate() {
		scrollTo(0, 0);
		this.$http.get(`/message/data?msgid=${this.$route.params.id}`).then((response) => {
			this.title = response.data.title;
		    this.content = response.data.content;
		    document.title =`${this.title} - 志敏的博客`;
		}, (response) => {
			alert("请求数据失败！")
		});
	},
	created() {
		window.DUOSHUO = false;

		// 多说公共JS代码 start (一个网页只需插入一次)
		var ds = document.createElement('script');
		ds.type = 'text/javascript';ds.async = true;
		ds.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js';
		ds.charset = 'UTF-8';
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ds);
		// 多说公共JS代码 end -->
	}
}
</script>