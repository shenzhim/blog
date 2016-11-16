<template>
  <div class="main">
    <div class="bg">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="overlay"></div>
    <div class="content">
        <a class="avatar" href="#"><img src="../img/avatar.png" alt="shenzm"></a>
        <h1 class="title">Shenzm.志敏</h1>
        <p class="describe">一个男人总要有一技之长来养家糊口...</p>
        <ul class="navcontainer">
          <li class="nav_1"><router-link class="" to="/foo"><svg class="icon icon-smile-o"><use xlink:href="#icon-smile-o"></use></svg></router-link></li>
          <li class="nav_2"><router-link class="" to="/foo"><svg class="icon icon-th"><use xlink:href="#icon-th"></use></svg></router-link></li>
          <li class="nav_3"><router-link class="" to="/foo"><svg class="icon icon-github"><use xlink:href="#icon-github"></use></svg></router-link></li>
          <li class="nav_4"><router-link class="" to="/foo"><svg class="icon icon-envelope-square"><use xlink:href="#icon-envelope-square"></use></svg></router-link></li>
          <li class="nav_5"><router-link class="" to="/foo"><svg class="icon icon-feed"><use xlink:href="#icon-feed"></use></svg></router-link></li>
        </ul>
    </div>
    <footer class="footer">
      <span class="copyright">Copyright © 2016 by Shenzm.志敏</span>
    </footer>
    <router-view></router-view>
  </div>
</template>

<script>
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const Foo = {
  template: '<div>foo</div>'
}
const Bar = {
  template: '<div>bar</div>'
}

const router = new VueRouter({
  routes: [{
    path: '/foo',
    component: Foo
  }, {
    path: '/bar',
    component: Bar
  }]
})

export default {
  name: 'app',
  router
}
</script>

<style>
  @import "../css/index";
</style>
