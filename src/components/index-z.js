import Banner from "./Banner.vue";

const BannerLib = {
  install(Vue) {
    Vue.component("banner", Banner);
  }
};

export default BannerLib;

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(BannerLib);
}
