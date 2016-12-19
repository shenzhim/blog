<template>
	<transition name="fade" mode="out-in">
		<div class="message">
			<h2 class="title">{{title}}</h2>
			<div class="content" v-html="content"></div>
			<div class="page">
				<a v-if="preid" :href="'/blog/message/' + preid" class="page-left">
					<span class="pre"><svg class="icon icon-point-left"><use xlink:href="#icon-point-left"></use></svg></span>
					<span class="ti">{{pretitle}}</span>
				</a>
				<a v-if="nextid" :href="'/blog/message/' + nextid" class="page-right">
					<span class="ti">{{nexttitle}}</span>
					<span class="next" ><svg class="icon icon-point-right"><use xlink:href="#icon-point-right"></use></svg></span>
				</a>
			</div>
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
			preid: '',
			pretitle: '',
			nextid: '',
			nexttitle: '',
			url: location.href
		}
	},
	beforeCreate() {
		this.$http.get(`/message/data?msgid=${this.$route.params.id}`).then((response) => {
			this.title = response.data.title;
		    this.content = response.data.content;
		    this.preid = response.data.preid;
		    this.pretitle = response.data.pretitle;
		    this.nextid = response.data.nextid;
		    this.nexttitle = response.data.nexttitle;
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