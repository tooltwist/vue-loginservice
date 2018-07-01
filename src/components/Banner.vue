<template>
  <div class="banner" :style="bannerStyles" :class="`banner__${position}`">
    THIS IS THE BANNER2
    <p v-if="msg")
      <br />({{msg}})
    </p>

    <br />
    <slot></slot>
  </div>
</template>
<script>
const defaultStyles = {
  left: 0,
  right: 0,
};
export default {
  props: {
    msg: {
      type: String
    },
    position: {
      type: String,
      default: 'top',
      validator(position) {
        return ['top', 'bottom'].indexOf(position) > -1;
      },
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      bannerStyles: {
        ...defaultStyles,
        ...this.styles,
      },
    };
  },
};
</script>
<style lang="scss" scoped>
.banner {
  padding: 12px;
  background-color: #fcf6cd;
  color: #f6a623;
  text-align: left;
  //position: fixed;
  //z-index: 2;
}
.banner__top {
  top: 0;
}
.banner__bottom {
  bottom: 0;
}
</style>
