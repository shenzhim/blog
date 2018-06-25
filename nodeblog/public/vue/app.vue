<template>
  <transition name="main">
    <div class="main">
      <div id="particles-js"></div>
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
            <span class="copyright">Copyright © 2018 by Shenzm.志敏</span>
          </footer>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name:"app",
  mounted() {
    if (window.particlesJS) {
      var option = {
        particles: {
          number: {
            value: 274,
            density: {
              enable: !0,
              value_area: 801.7060304327614
            }
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "circle",
            stroke: {
              width: 1,
              color: "#ffffff"
            },
            polygon: {
              nb_sides: 3
            },
            image: {
              src: "img/github.svg",
              width: 100,
              height: 100
            }
          },
          opacity: {
            value: 0.5,
            random: !0,
            anim: {
              enable: !1,
              speed: 1,
              opacity_min: 0.1,
              sync: !1
            }
          },
          size: {
            value: 3,
            random: !0,
            anim: {
              enable: !1,
              speed: 40,
              size_min: 0.1,
              sync: !1
            }
          },
          line_linked: {
            enable: !0,
            distance: 144,
            color: "#ffffff",
            opacity: 0.23,
            width: 1
          },
          move: {
            enable: !0,
            speed: 2,
            direction: "none",
            random: !0,
            straight: !1,
            out_mode: "out",
            bounce: !1,
            attract: {
              enable: !0,
              rotateX: 3447.33,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: !1,
              mode: "bubble"
            },
            onclick: {
              enable: !1,
              mode: "bubble"
            },
            resize: !0
          },
          modes: {
            grab: {
              distance: 400,
              line_linked: {
                opacity: 1
              }
            },
            bubble: {
              distance: 170.536,
              size: 16.241,
              duration: 0.893,
              opacity: 0.795,
              speed: 3
            },
            repulse: {
              distance: 194.89,
              duration: 0.4
            },
            push: {
              particles_nb: 4
            },
            remove: {
              particles_nb: 2
            }
          }
        },
        retina_detect: true
      }
      particlesJS('particles-js', option);
    }
  }
}
</script>

<style>
  @import "../css/index";

  #particles-js {
      position: absolute;
      top: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      background-color: #000000;
  }
</style>
