import LoginService from './LoginService'
import LoginserviceLogin from './LoginserviceLogin.vue'
import LoginserviceBounceComponent from './LoginserviceBounceComponent.vue'
import LoginserviceUserList from './LoginserviceUserList.vue'
import LoginserviceUserDetails from './LoginserviceUserDetails.vue'
import LoginserviceChangePassword from './LoginserviceChangePassword.vue'
import LoginserviceNavbar from './LoginserviceNavbar.vue'
// import Banner from "./Banner.vue";

export let _Vue

let _loginserviceObject = null


function install (Vue, options) {
  // console.log('Installing vue-loginservice', options)

  if (_loginserviceObject) {
    console.error("Vue.use(LoginService) has already been called.")
    return
  }

  // Create ourselves an LoginService Object
  _loginserviceObject = new LoginService(options)
  _loginserviceObject.checkInitialLoginStatus(false)


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
        this._loginserviceRoot = this
        this._authservice = _loginserviceObject
        this._loginservice = _loginserviceObject
        // this._loginserviceObject.init(this)
        Vue.util.defineReactive(this, '_loginserviceObject', this.$authservice)
        Vue.util.defineReactive(this, '_loginservice', this.$authservice)
      } else {
        this._loginserviceRoot = (this.$parent && this.$parent._loginserviceRoot) || this
      }

    },
    destroyed () {
      // registerInstance(this)
    }
  })

  // As described above, the Vue instances form a hierachy. The mixin
  // above ensures that each instance has an '_loginserviceRoot' field
  // that points to the instance where 'authservice' was passed to new Vue({  }).
  // Note that it's possible _loginserviceRoot might actually point to itself.
  Object.defineProperty(Vue.prototype, '$authservice', {
    get () { return this._loginserviceRoot._loginservice }
  })
  Object.defineProperty(Vue.prototype, '$loginservice', {
    get () { return this._loginserviceRoot._loginservice }
  })
  // Object.defineProperty(Vue.prototype, '$login', {
  //   get () { return this._loginserviceRoot._loginservice }
  // })

  // Define the components
  Vue.component('authservice-login', LoginserviceLogin)
  Vue.component('authservice-bounce-component', LoginserviceBounceComponent)
  Vue.component('authservice-change-password', LoginserviceChangePassword)
  Vue.component('authservice-user-list', LoginserviceUserList)
  Vue.component('authservice-user-details', LoginserviceUserDetails)

  Vue.component('loginservice-login', LoginserviceLogin)
  Vue.component('loginservice-bounce-component', LoginserviceBounceComponent)
  Vue.component('loginservice-change-password', LoginserviceChangePassword)
  Vue.component('loginservice-user-list', LoginserviceUserList)
  Vue.component('loginservice-user-details', LoginserviceUserDetails)

  Vue.component('authservice-navbar', LoginserviceNavbar)
  Vue.component('loginservice-navbar', LoginserviceNavbar)

  // Vue.component('authservice-navbar-blu', AuthserviceNavbarBlu)
  // Vue.component('authservice-bulma', AuthserviceBulma)
  // Vue.component('my-component', MyComponent)
  // Vue.component('authservice-firstname', AuthserviceFirstname)
  // Vue.component('authservice-fullname', AuthserviceFullName)

  // Vue.component("banner", Banner);

  return _loginserviceObject
}

const LoginServiceLib = {
  install: install
}

Object.defineProperty(LoginServiceLib, '_loginserviceObject', {
  get: function() {
      return _loginserviceObject;
  }
});

export default LoginServiceLib

// This is used when the npm package is included directly into an HTML page
if (typeof window !== "undefined" && window.Vue) {
  //window.Vue.use(LoginServiceLib);
  window.LoginService = LoginServiceLib
}
