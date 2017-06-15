<template>
	<transition name="fade">
		<div class="blog">
		    <div class="menubar">
		    	<ul>
		    		<li><router-link to="/"><img src="../../img/avatar.png" alt="shenzm"></router-link></li>
		    		<li><router-link to="/blog/me"><svg class="icon icon-smile-o"><use xlink:href="#icon-smile-o"></use></svg></router-link></li>
            		<li><router-link to="/blog/list"><svg class="icon icon-align-left"><use xlink:href="#icon-align-left"></use></svg></router-link></li>
            		<li><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-github"><use xlink:href="#icon-github"></use></svg></a></li>
            		<li><a href="mailto:szmalq@163.com"><svg class="icon icon-envelope-square"><use xlink:href="#icon-envelope-square"></use></svg></a></li>
            		<li><a href="/rss" target="_blank"><svg class="icon icon-feed"><use xlink:href="#icon-feed"></use></svg></a></li>
		    	</ul>
		    </div>
		    <div class="container">
		    	<div class="masthead">
		    		<router-link to="/blog/list">Shenzm</router-link>
					<svg class="blog-name">
						<mask id="shade"><text fill="#ffffff" x="0" y="30">志敏的博客</text></mask>
						<g mask="url(#shade)">
							<rect class="blog-name-animate" x="0" y="0" width="380px" height="100px" fill="url(#dream)"/>
						</g>
					</svg>
		    		<div class="masthead-icon">
		    			<router-link to="/blog/list"><svg class="icon icon-home"><use xlink:href="#icon-home"></use></svg></router-link>
		    			<router-link to="/blog/me"><svg class="icon icon-grin"><use xlink:href="#icon-grin"></use></svg></router-link>	
		    		</div>
		    	</div>
		    	<router-view></router-view>
		    </div>
		  </div>
	</transition>
</template>

<script>
export default {
	created() {
		document.title = '志敏的博客';
	}
}
</script>