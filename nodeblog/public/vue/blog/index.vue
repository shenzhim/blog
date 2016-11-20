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
		    	<router-view></router-view>
		    </div>
		  </div>
	</transition>
</template>

<script>
export default {
}
</script>

<style>
  @import "../../css/blog";
</style>