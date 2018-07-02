//import Vue from 'vue'
// export default Vue => Vue.component(Component.name, Component)

import Authservice from '../Authservice'
import AuthserviceLogin from './AuthserviceLogin.vue'
import AuthserviceBounceComponent from './AuthserviceBounceComponent.vue'
import AuthserviceUserList from './AuthserviceUserList.vue'
import AuthserviceUserDetails from './AuthserviceUserDetails.vue'
import AuthserviceChangePassword from './AuthserviceChangePassword.vue'
import Banner from "./Banner.vue";

export let _Vue

let _authservice = null


function install (Vue, options) {
  console.log('vue-loginservice.install()', options)

  if (_authservice) {
    console.error("Vue.use(Authservice) has already been called.")
    return
  }

  // Create ourselves an Authservice Object
  _authservice = new Authservice(options)
  _authservice.checkInitialLoginStatus(false)


  _Vue = Vue

  //const isDef = v => v !== undefined

  // Vue.mixin adds an additional 'beforeCreate' function to it's
  // list of functions to be called when new Vue is created. We'll
  // use it to look for new Vue({ authservice }). If found, we'll
  // consider this to be the root. If it is not found, then we will
  // assume this is a child of the root, and create pointers back
  // to the root.
  //Vue.mixin({
  Vue.mixin({
    beforeCreate () {

      if (!this.$parent) {
      //if (isDef(this.$options.authservice)) {
        // console.error('Initializing ROOT *********')
        // This must be the root, since we found authservice in it's options.
        this._authserviceRoot = this
        this._authservice = _authservice
        // this._authservice.init(this)
        Vue.util.defineReactive(this, '_authservice', this.$authservice)
        // Vue.util.defineReactive(this, '_authservice', this._authservice.jwt)
        // Vue.util.defineReactive(this, '_authservice', this._authservice.fromCache)
      } else {
        this._authserviceRoot = (this.$parent && this.$parent._authserviceRoot) || this
      }

      /*
      // this.$options is the options passed to new Vue({ })
      if (isDef(this.$options.authservice)) {
        // This must be the root, since we found authservice in it's options.
        this._authserviceRoot = this
        this._authservice = this.$options.authservice
        // this._authservice.init(this)
        Vue.util.defineReactive(this, '_authservice', this.$authservice)
        // Vue.util.defineReactive(this, '_authservice', this._authservice.jwt)
        // Vue.util.defineReactive(this, '_authservice', this._authservice.fromCache)

        this._authservice.checkInitialLoginStatus(false)
      } else {
        this._authserviceRoot = (this.$parent && this.$parent._authserviceRoot) || this
      }
      // registerInstance(this, this)
      */
    },
    destroyed () {
      // registerInstance(this)
    }
  })

  // As described above, the Vue instances form a hierachy. The mixin
  // above ensures that each instance has an '_authserviceRoot' field
  // that points to the instance where 'authservice' was passed to new Vue({  }).
  // Note that it's _authserviceRoot might actually point to itself.
  Object.defineProperty(Vue.prototype, '$authservice', {
    get () { return this._authserviceRoot._authservice }
  })

  // Define the components
  Vue.component('authservice-login', AuthserviceLogin)
  Vue.component('authservice-bounce-component', AuthserviceBounceComponent)
  Vue.component('authservice-change-password', AuthserviceChangePassword)
  Vue.component('authservice-user-list', AuthserviceUserList)
  Vue.component('authservice-user-details', AuthserviceUserDetails)

  // Vue.component('authservice-navbar', AuthserviceNavbar)
  // Vue.component('authservice-navbar-blu', AuthserviceNavbarBlu)
  // Vue.component('authservice-bulma', AuthserviceBulma)
  // Vue.component('my-component', MyComponent)
  // Vue.component('authservice-firstname', AuthserviceFirstname)
  // Vue.component('authservice-fullname', AuthserviceFullName)

  Vue.component("banner", Banner);

  return _authservice
}

const LoginServiceLib = {
  install: install
}

Object.defineProperty(LoginServiceLib, '_authservice', {
  get: function() {
      return _authservice;
  }
});

export default LoginServiceLib


//if (typeof window !== "undefined" && window.Vue) {
if (typeof window !== "undefined" && window.Vue) {
  //window.Vue.use(LoginServiceLib);
  window.LoginService = LoginServiceLib
}
