//import Vue from 'vue'
// export default Vue => Vue.component(Component.name, Component)

import LoginService from './LoginService'
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
    console.error("Vue.use(LoginService) has already been called.")
    return
  }

  // Create ourselves an LoginService Object
  _authservice = new LoginService(options)
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
        this._loginservice = _authservice
        // this._authservice.init(this)
        Vue.util.defineReactive(this, '_authservice', this.$authservice)
        Vue.util.defineReactive(this, '_loginservice', this.$loginservice)
        // Vue.util.defineReactive(this, '_loginservice', this.$authservice)
      } else {
        this._authserviceRoot = (this.$parent && this.$parent._authserviceRoot) || this
      }

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
  Object.defineProperty(Vue.prototype, '$loginservice', {
    get () { return this._authserviceRoot._authservice }
  })
  // Object.defineProperty(Vue.prototype, '$login', {
  //   get () { return this._authserviceRoot._authservice }
  // })

  // Define the components
  Vue.component('authservice-login', AuthserviceLogin)
  Vue.component('authservice-bounce-component', AuthserviceBounceComponent)
  Vue.component('authservice-change-password', AuthserviceChangePassword)
  Vue.component('authservice-user-list', AuthserviceUserList)
  Vue.component('authservice-user-details', AuthserviceUserDetails)

  Vue.component('loginservice-login', AuthserviceLogin)
  Vue.component('loginservice-bounce-component', AuthserviceBounceComponent)
  Vue.component('loginservice-change-password', AuthserviceChangePassword)
  Vue.component('loginservice-user-list', AuthserviceUserList)
  Vue.component('loginservice-user-details', AuthserviceUserDetails)

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

// This is used when the npm package is included into an HTML page
if (typeof window !== "undefined" && window.Vue) {
  //window.Vue.use(LoginServiceLib);
  window.LoginService = LoginServiceLib
}
