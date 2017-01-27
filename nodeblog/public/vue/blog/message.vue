<template>
	<transition name="fade" mode="out-in">
		<div class="message">
			<h2 class="title">{{title}}</h2>
			<div class="content" v-html="content"></div>
			<div class="go-top" :class="{'hide': isHide }" @click="gotop">
				<svg class="icon icon-rocket"><use xlink:href="#icon-rocket"></use></svg>
			</div>
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
			<div class="ds-share" :data-thread-key="$route.params.id" :data-title="title" :data-images="img" :data-content="summary" :data-url="url">
                <div class="ds-share-inline">
                    <ul class="ds-share-icons-16">
                    	<li data-toggle="ds-share-icons-more">分享到：</li>
                        <li><a class="ds-weibo" href="javascript:void(0);" data-service="weibo">微博</a></li>
                        <li><a class="ds-qzone" href="javascript:void(0);" data-service="qzone">QQ空间</a></li>
                        <li><a class="ds-wechat" href="javascript:void(0);" data-service="wechat">微信</a></li>
                    </ul>
                </div>
            </div>
			<!-- 多说评论框 start -->
			<div class="ds-thread" :data-thread-key="$route.params.id" :data-title="title" :data-url="url"></div>
			<!-- 多说评论框 end -->

			<div class="footer-link">
				<p class="link">友情链接</p>
				<ul>
					<li><a href="http://anleb.com/" target="_blank">anleb的博客</a></li>
					<li><a href="http://asionius.com/#!/blog" target="_blank">asionius的博客</a></li>
				</ul>
				<p class="declare">本站内容如无特殊声明均为原创，转载请注明出处</p>
			</div>
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
			img: '',
			title: '',
			summary: '',
			content: '',
			preid: '',
			pretitle: '上一篇',
			nextid: '',
			nexttitle: '下一篇',
			url: location.href,
			isHide : true,
			scrolldelay: ''
		}
	},
	beforeCreate() {
		this.$http.get(`/message/data?msgid=${this.$route.params.id}`).then((response) => {
			this.title = response.data.title;
		    this.content = response.data.content;
		    this.preid = response.data.preid;
		    this.nextid = response.data.nextid;
		    this.summary = response.data.summary || response.data.title;
		    this.img = response.data.img;
		    if (window.outerWidth > 867) {
		    	this.pretitle = response.data.pretitle;
		    	this.nexttitle = response.data.nexttitle;
		    }
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
		
		var timer;
		window.addEventListener('scroll', () => {
		    if(timer) {
		    	clearTimeout(timer);	
		    } 
		    
		    timer = setTimeout(() => {
		    	if (document.body.scrollTop > 900) {
		    		this.isHide = false;
		    	} else {
		    		this.isHide = true;
		    	}
		    }, 500);
		});
	},
	methods: {
		gotop() {
			window.scroll(0, 0);
		}
	}
}
</script>

<style>
	.ds-share,
	.ds-thread{
		padding: 0 5px; 
	}
</style>