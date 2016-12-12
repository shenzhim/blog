<template>
	<transition name="fade">
		<div class="blog">
		    <div class="menubar">
		    	<ul>
		    		<li><img src="../../img/avatar.png" alt="shenzm"></li>
		    		<li><router-link to="/blog/me"><svg class="icon icon-smile-o"><use xlink:href="#icon-smile-o"></use></svg></router-link></li>
            		<li><router-link to="/blog/list"><svg class="icon icon-align-left"><use xlink:href="#icon-align-left"></use></svg></router-link></li>
            		<li><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-github"><use xlink:href="#icon-github"></use></svg></a></li>
            		<li><a href="mailto:szmalq@163.com"><svg class="icon icon-envelope-square"><use xlink:href="#icon-envelope-square"></use></svg></a></li>
            		<li><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-feed"><use xlink:href="#icon-feed"></use></svg></a></li>
		    	</ul>
		    </div>
		    <div class="container">
		    	<div class="masthead" :class="{'hide-masthead': isHide }">
		    		<router-link to="/">Shenzm</router-link><small> 志敏的博客</small>
		    	</div>
		    	<router-view></router-view>
		    </div>
		  </div>
	</transition>
</template>

<script>
export default {
	data() {
		return {
			isHide : false
		}
	},
	created() {
		var t,
			o =0, 
			c = 0;

		window.addEventListener('scroll', () => {
		    if(t) clearTimeout(t);
		    
		    t = setTimeout(() => {
		    	c = window.scrollY;

	            if(o <= c && !this.isHide) {
	            	//下滚
	            	this.isHide = true;
	            } else if (o > c && this.isHide) {
	            	//上滚
	            	this.isHide = false;
	            }

	            o = c;
		    }, 500);
		});
	}
}
</script>