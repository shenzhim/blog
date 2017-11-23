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
			<div class="footer-link" v-if="showfooter">
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

var jsApiList = [
    'checkJsApi',
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'onMenuShareQZone'
];

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
			showfooter: false,
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
		    setTimeout(()=>{
		    	this.showfooter = true;
		    }, 1000);
		    document.title =`${this.title} - 志敏的博客`;
		}, (response) => {
			alert("请求数据失败！")
		});

		this.$http.get('/wx/config', {
			params: {
				url: location.href
			}
		}).then((response) => {
			if (window.wx) {
                wx.config({
                    debug: false,
                    appId: response.data.appId,
                    timestamp: response.data.timestamp,
                    nonceStr: response.data.nonceStr,
                    signature: response.data.signature,
                    jsApiList: jsApiList
                });

                wx.ready(function() {
                	var shareData = {
					    title: document.title,
					    link: location.href,
					    desc: '纸上得来终觉浅 绝知此事要躬行',
					    imgUrl: 'http://img.shenzm.cn/logo.png'
					};
                    wx.onMenuShareAppMessage(shareData);
                    wx.onMenuShareTimeline(shareData);
                    wx.onMenuShareQQ(shareData);
                    wx.onMenuShareWeibo(shareData);
                    wx.onMenuShareQZone(shareData);
                });
            }
		}, (data) => {
			alert("请求数据失败！")
		});
	},
	created() {
		var timer;
		window.addEventListener('scroll', () => {
		    if(timer) {
		    	clearTimeout(timer);	
		    } 
		    
		    timer = setTimeout(() => {
		    	var top = document.documentElement.scrollTop || document.body.scrollTop;
		    	if (top > 900) {
		    		this.isHide = false;
		    	} else {
		    		this.isHide = true;
		    	}
		    }, 500);
		});
	},
	methods: {
		gotop() {
			var top = document.documentElement.scrollTop || document.body.scrollTop;
			this.easeout(top, 0, 4, function (value) {
				if (document.documentElement.scrollTop) {
					document.documentElement.scrollTop = value;
				} else {
					document.body.scrollTop = value;
				}
			});
		},
		easeout(A, B, rate, callback) {
			if (A == B || typeof A != 'number') {
        		return;    
    		}
    		B = B || 0;
    		rate = rate || 2;
    
    		var step = function () {
        		A = A + (B - A) / rate;
        
        		if (A < 1) {
            		callback(B, true);
            		return;
        		}
        		callback(A, false);
        		requestAnimationFrame(step);    
    		};
    		step();
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