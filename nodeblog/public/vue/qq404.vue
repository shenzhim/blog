<template>
  <div id="qq404"></div>
</template>

<script>
export default {
  name: 'qq404',
  beforeCreate: function() {
    document.write('\<script type="text/javascript" homePageUrl="http://shenzm.cn" homePageName="回到我的主页" src="http://www.qq.com/404/search_children.js" charset="utf-8"><\/script\>');
  }
}
</script>
