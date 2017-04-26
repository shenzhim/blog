<template>
  <transition name="main">
    <div class="main">
      <span v-for="n in 5" class="bg"></span>
      <div class="overlay"></div>
      <div class="content">
          <router-link class="avatar" to="/blog/list"><img src="../img/avatar.png" alt="shenzm"></router-link>
          <h1 class="title">志敏的博客</h1>
          <p class="describe">纸上得来终觉浅 绝知此事要躬行</p>
          <ul class="navcontainer">
            <li class="nav_1"><router-link to="/blog/me"><svg class="icon icon-smile-o"><use xlink:href="#icon-smile-o"></use></svg></router-link></li>
            <li class="nav_2"><router-link to="/blog/list"><svg class="icon icon-align-left"><use xlink:href="#icon-align-left"></use></svg></router-link></li>
            <li class="nav_3"><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-github"><use xlink:href="#icon-github"></use></svg></a></li>
            <li class="nav_4"><a href="mailto:szmalq@163.com"><svg class="icon icon-envelope-square"><use xlink:href="#icon-envelope-square"></use></svg></a></li>
            <li class="nav_5"><a href="/rss" target="_blank"><svg class="icon icon-feed"><use xlink:href="#icon-feed"></use></svg></a></li>
          </ul>
          <router-link class="down" to="/blog/list"><svg class="icon icon-double-down"><use xlink:href="#icon-double-down"></use></svg></router-link>
          <footer class="footer">
            <span class="copyright">Copyright © 2017 by Shenzm.志敏</span>
          </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {}
</script>

<style>
  @import "../css/index";
</style>
