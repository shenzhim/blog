<template>
  <div class="main">
    <span v-for="n in 5" class="bg"></span>
    <div class="overlay"></div>
    <div class="content">
        <a class="avatar" href="#"><img src="../img/avatar.png" alt="shenzm"></a>
        <h1 class="title">Shenzm.志敏</h1>
        <p class="describe">一个男人总要有一技之长来养家糊口...</p>
        <ul class="navcontainer">
          <li class="nav_1"><router-link class="" to="/foo"><svg class="icon icon-smile-o"><use xlink:href="#icon-smile-o"></use></svg></router-link></li>
          <li class="nav_2"><router-link class="" to="/foo"><svg class="icon icon-align-left"><use xlink:href="#icon-align-left"></use></svg></router-link></li>
          <li class="nav_3"><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-github"><use xlink:href="#icon-github"></use></svg></a></li>
          <li class="nav_4"><a href="mailto:szmalq@163.com"><svg class="icon icon-envelope-square"><use xlink:href="#icon-envelope-square"></use></svg></a></li>
          <li class="nav_5"><a href="https://github.com/shenzhim" target="_blank"><svg class="icon icon-feed"><use xlink:href="#icon-feed"></use></svg></a></li>
        </ul>
        <router-link class="down" to="/foo"><svg class="icon icon-double-down"><use xlink:href="#icon-double-down"></use></svg></router-link>
    </div>
    <footer class="footer">
      <span class="copyright">Copyright © 2016 by Shenzm.志敏</span>
    </footer>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
  @import "../css/index";
</style>
