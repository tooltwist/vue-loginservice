<template lang="pug">

  b-nav-item-dropdown(:text="($authservice.user!=null) ? (headerName) : (signin ? 'Sign in' : 'Login')" right)
    //
    //  This component uses bootstrap-vue
    //  (See https://bootstrap-vue.js.org/docs)
    //

    //
    //  Logged in mode
    //
    b-form(v-if="mode === 'loggedIn'")
      b-dropdown-header
        strong {{$authservice.user.firstname}}  {{$authservice.user.lastname}}
        //- b-dropdown-item(aria-describedby="header1") Another action

        img(v-if="$authservice.user.avatar", :src="$authservice.user.avatar", alt="")
      //b-dropdown-item
      //  router-link(to='/applications') Settings
      b-dropdown-divider
      //- span(v-if="!user.avatar").fa-stack.fa
      //-   i.fa.fa-circle.fa-stack-2x
      //-   i.fa.fa-user.fa-stack-1x.fa-inverse
      //-   | &nbsp;{{user.firstname}}
      // VVVV User defined menu options
      b-dropdown-item(v-on:click="doSignout()") {{signin ? 'Sign out' : 'Logout'}}
      // | {{$authservice.user}}


    //
    // Login mode
    //
    // See:
    //  https://bootstrap-vue.js.org/docs/components/alert
    //  https://bootstrap-vue.js.org/docs/components/button
    //
    b-form.login-form(v-if="mode === 'login'" href="")
      b-dropdown-header
        h4 Login
        b-form-group(label="Username / Email")
          b-form-input(v-model.trim="email" type="text" v-on:keydown="keyhandler" tabindex="31")
        b-form-group(label="Password")
          b-form-input(v-model.trim="password" type="password" v-on:keydown.native="keyhandler" tabindex="32" autocomplete="current-password")
        b-alert(v-if="loginError" variant="danger" show) {{loginError}}
        b-button(variant="primary" v-on:click="doLogin" tabindex="33") Login
      b-dropdown-divider
      b-dropdown-header
        b-button.my-button(:size="'sm'", :variant="'link'", v-on:click="setMode('forgot')", tabindex="34") Forgot password
        br
        b-button(:size="'sm'", :variant="'link'", v-on:click="setMode('register')", tabindex="35") Register
      b-dropdown-divider
      b-dropdown-header
        b-button.my-button(:variant="'primary'" v-on:click="facebookLogin()" tabindex="36") Login with Facebook
        br
        b-button.my-button(:variant="'danger'" v-on:click="googleLogin()" tabindex="37") Login with Google
        br
        b-button.my-button(:variant="'secondary'" v-on:click="githubLogin()" tabindex="38") Login with Github
    //- b-dropdown-header

    //
    // Register a new user
    //
    // https://bootstrap-vue.js.org/docs/components/button
    b-form.register-form(v-if="mode === 'register'")
      b-dropdown-header
        h4 Register
        .register-text
          | Hi!
          | Enter your details and we'll be happy to sign you up.

        // Username
        b-form-group(v-if="registerRequiresUsername" label="Username" placeholder="Choose a user name")
          b-form-input(v-model.trim="registerUsername", type="text", v-on:keydown.native="keyhandler", v-on:input="validateUsername", :state="registerUsernameState", autocomplete="off")
          b-form-feedback#input-feedback
            // This will only be shown if the preceeding input has an invalid state
            | {{registerUsernameError}}

        // Email
        b-form-group(label="Email")
          b-form-input(v-model.trim="registerEmail" type="text" v-on:keydown.native="keyhandler")
        b-form-group(v-if="registerRequiresPassword" label="Password")
          b-form-input(v-model.trim="registerPassword" type="password" v-on:keydown.native="keyhandler" autocomplete="off")
        b-form-group(v-if="registerRequiresFirstName" label="First name")
          b-form-input(v-model.trim="registerFirstName" v-on:keydown.native="keyhandler")
        b-form-group(v-if="registerRequiresMiddleName" label="Middle name")
          b-form-input(v-model.trim="registerMiddleName" v-on:keydown.native="keyhandler")
        b-form-group(v-if="registerRequiresLastName" label="Last name")
          b-form-input(v-model.trim="registerLastName" v-on:keydown.native="keyhandler")
        //- b-alert(variant="danger" show) Login Error
      b-dropdown-divider
      b-dropdown-header
        b-button(variant="primary" v-on:click="register") Register
        b-button(:size="'sm'", :variant="'link'", v-on:click="setMode('login')") Cancel
      //- b-dropdown-header
    //- b-form

    // Message for after the register email has been sent
    b-form(v-if="mode === 'registerAfter'")
      b-dropdown-header
        // h4 Registration
        p
          | Congratulations, you now have a user account.
          | We have sent you an email to verify your email address.
        p
          | Please take a moment to check your email and complete
          | the registration process.
      b-dropdown-divider
      b-dropdown-header
        // Should just close the dropdown VVVVV
        // b-button(:size="'sm'", :variant="'primary'", v-on:click="setMode('login')") Ok
        b-button(type="submit", :size="'sm'", :variant="'primary'", v-on:click="setMode('login')").btn.btn-default ok
    //- b-form

    //
    // Forgot mode
    //
    // See:
    //  https://bootstrap-vue.js.org/docs/components/alert
    //  https://www.npmjs.com/package/vue-icons
    //
    b-form.forgot-form(v-if="mode === 'forgot'")
      b-dropdown-header
        h4 Forgotten Password
        .forgot-text
          | Forgot your password? No problem. Enter your email address below and we'll
          | well send an email with a link to reset your password.
        b-form-group(label="Email Address")
          b-form-input(v-model.trim="forgotEmail" type="text" v-on:keydown.native="keyhandler")
        b-alert(v-if="forgotError" variant="danger" show) {{forgotError}}
      b-dropdown-divider
      b-dropdown-header
        // https://bootstrap-vue.js.org/docs/components/button
        b-button(variant="primary" v-on:click="forgot")
          span(v-if="forgotInProgress")
            icon(name="refresh" spin)
            | &nbsp;&nbsp;
          | Send the Email
        | &nbsp;
        b-button(:size="'sm'", :variant="'link'", right v-on:click="setMode('login')") Cancel
    //- b-dropdown-header

    // Message for after the forgot email has been sent
    b-form.forgot-form(v-if="mode === 'forgotAfter'")
      b-dropdown-header
        h4 Forgotten Password
        .forgot-text
          | We have sent an email to {{forgotEmail}} with
          | instructions to reset your password.
      b-dropdown-divider
      b-dropdown-header
        // Should just close the dropdown VVVVV
        b-button(:size="'sm'", :variant="'primary'", v-on:click="setMode('login')") Ok
</template>

<script zlang="javascript">
  import debounce from 'debounce'
  // Icons from vue-awesome
  // See https://github.com/Justineo/vue-awesome
  //import 'vue-awesome/icons/refresh'
  import Icon from 'vue-awesome/components/Icon.vue'

  // const LOGIN_DETAILS_COOKIE_NAME = 'authservice-login-details'

  // VVVVV Remove these
  // const JWT_COOKIE_NAME = 'authservice-jwt'
  // const LOGIN_TIMEOUT_DAYS = 3

  // const AUTHORIZED = true
  // const NOT_AUTHORIZED = false

  /**
   *  This component provides a login menu on the navbar of a page.
   *
   *  @author Philip Callender
   */
  export default {
    name: 'loginservice-navbar',
    components: {
      Icon
    },
    props: {
      /**
      *  Allow login with username (rather than email)
      */
      loginWithUsername: {
        type: Boolean,
        default: false
      },
      /**
       *  Say "sign in" rather than "log in"
       */
      signin: {
        type: Boolean,
        default: false
      },
      hideRegister: {
        type: Boolean,
        default: false
      },
      hideForgot: {
        type: Boolean,
        default: false
      },
      hideAvatar: {
        type: Boolean,
        default: false
      },
      hideLogout: {
        type: Boolean,
        default: false
      },
      // extraMenuItems: '<', // string ([+-]tag:label, ...) + = logged in, - = logged out.

      /*
       *  Registration-related
       */
      // Which fields required for registration
      registerFields: String,
      registerResume: String, // URL - where to go after email verification

      // Forgotten password related
      forgotResume: String, // URL - where to go after email verification

      nocomma: String
    },
    data () {
      // console.log('data(): this=', this)
      return {
        email: 'philcal@mac.com',
        password: 'mouse123',
        loggedIn: false,
        mode: (this.$authservice && this.$authservice.user) ? 'loggedIn' : 'login',

        // loginWithUsername: true,
        loginError: '',

        // Forgotten password
        forgotEmail: '',
        forgotError: '',
        forgotInProgress: false,

        // Registration-related
        registerEmail: '',
        registerUsername: '',
        registerFirstName: '',
        registerMiddleName: '',
        registerLastName: '',
        registerPassword: '',

        registerRequiresUsername: registerWithField(this, 'username'),
        registerRequiresFirstName: registerWithField(this, 'first_name'),
        registerRequiresMiddleName: registerWithField(this, 'middle_name'),
        registerRequiresLastName: registerWithField(this, 'last_name'),
        registerRequiresPassword: registerWithField(this, 'password'),

        // freshCredentials: '<', // boolean, don't use JWT from cookie

        // // UI-related
        // signin: '<', // boolean
        // hideRegister: '<', // boolean
        // hideForgot: '<', // boolean
        // hideAvatar: '<', // boolean
        // hideLogout: '<', // boolean
        // bindToDom: '<', // boolean
        // extraMenuItems: '<', // string ([+-]tag:label, ...) + = logged in, - = logged out.
        //
        // // Registration-related
        // registerFields: '<', // string (password,first_name,middle_name,last_name)
        // registerResume: '<', // URL - where to go after email verification
        // forgotResume: '<', // URL - where to go after email verification
        //
        // // OAuth2-related
        // facebook: '<', // boolean
        // google: '<', // boolean
        // github: '<', // boolean
        // resume: '<', // URL, where to go after OAuth2 login
        // fail: '<' // URL, where to go after OAuth2 error

        user: null,
        jwt: null,
        fromCache: false,

        // The data is provided by $store.state.appList

        // How to display the fields in the table
        registerUsernameState: false,
        registerUsernameError: ''

      }
    },
    computed: {
      headerName: function () {
        if (!this.$authservice.user) {
          return '-'
        }
        if (this.$authservice.user.username) {
          return this.$authservice.user.username
        }
        if (this.$authservice.user.firstname) {
          return this.$authservice.user.firstname
        }

        // Need to use the email address
        return this.$authservice.user.email
      }// headerName
    //   usernameState () {
    //     return new Promise((resolve, reject) => {
    //       // return this.registerUsername.length > 2 ? null : false
    //       if (this.registerUsername.length > 2) {
    //         return resolve(null)
    //       } else {
    //         return reject()
    //       }
    //     })// new promise
    //   }
    },
    // Once the componented has been created, see if we are already
    // logged in (as shown by having a valid JWT in a cookie)
    created: function () {
      // console.log('============= NEW COMPONENT ================')
      // console.log('\n\n\n1 ====>', this.$authservice)
      // console.log('\n\n\n2 ====>', this.$authservice.user)
    },
    methods: {

      // Prevent the default key bindings from closing the
      // login dropdown when TAB is pressed to move between fields.
      keyhandler: function (event) {
        event.stopPropagation()
      },

      // Sign in using email/password or username/password
      doLogin: function (event) {
        console.log('doLogin(' + this.email + ', ' + this.password + ')')

        const password = this.password
        this.password = ''
        this.loginError = ''

        this.$authservice.login(this.email, password)
          .then((userDetails) => {
            this.loginError = ''
            this.mode = 'loggedIn'
            this.$emit('userchange', this.$authservice.user.id)
          })
          .catch((errmsg) => {
            this.loginError = errmsg
            this.mode = 'login'
            this.$emit('userchange', 0)
          })
        // event.stopPropagation()
        return false
      }, // doLogin

      // Sign out from the menu
      doSignout: function () {
        this.mode = 'login'
        this.email = ''
        this.password = ''

        this.$authservice.logout()
      },
      facebookLogin: function () {
        // alert('facebook login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'facebook')
      },
      googleLogin: function () {
        alert('google login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'google')
      },
      githubLogin: function () {
        alert('github login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'github')
      },

      // See if a username is used
      validateUsername: function () {
        // console.log('validateUsername(' + this.registerUsername + ')')
        // Nothing to check if no username has been entered
        // Don't worry, the submit button will not be enabled
        if (this.registerUsername === '') {
          this.registerUsernameError = ''
          return
        }
        if (this.registerUsername.length < 3) {
          this.registerUsernameState = false
          this.registerUsernameError = 'Username must be 3 or more characters'
          return
        }
        return this.validateUsernameRemoteBit()
      },

      validateUsernameRemoteBit: debounce(function () {
        // console.log('validateUsernameRemoteBit (after debounce)')

        // See if the name is available
        this.validatingUsername = true
        this.registerUsernameError = ''
        this.$authservice.usernameAvailability(this.registerUsername)
          .then((error) => {
            this.registerUsernameError = error // May be null
            this.validatingUsername = false
            this.registerUsernameState = (error === null)
          })
          .catch((error) => {
            this.registerUsernameError = error
            this.validatingUsername = false
            this.registerUsernameState = false
          })// usernameAvailability()
      }, 500), // debounce (i.e. don't check every individual character)

      // Register a new user
      register: function () {
        // alert('register, ' + this.username + ', ' + this.password)
        const options = {
          email: this.registerEmail
        }
        if (this.registerRequiresUsername) {
          options.username = this.registerUsername
        }
        if (this.registerRequiresPassword) {
          options.password = this.registerPassword
        }
        if (this.registerRequiresFirstName) {
          options.firstName = this.registerFirstName
        }
        if (this.registerRequiresMiddleName) {
          options.middleName = this.registerMiddleName
        }
        if (this.registerRequiresLastName) {
          options.lastName = this.registerLastName
        }

        this.registerError = ''
        this.registerInProgress = true
        this.$authservice.register(options)
          .then(reply => {
            console.log('all is okay', reply)
            // Register password mail has been sent
            this.registerError = ''
            this.registerInProgress = false
            this.mode = 'registerAfter'
          })
          .catch(error => {
            // Not registered
            console.log('have error', error)
            this.registerError = error
            this.registerInProgress = false
          })
        // return true
        return false
      },

      // Handle forgotten password
      forgot: function () {
        this.forgotInProgress = true
        this.$authservice.forgot(this.forgotEmail, { forgotResume: this.forgotResume })
          .then(reply => {
            // Forgotten password mail has been sent
            this.forgotError = ''
            this.forgotInProgress = false
            this.mode = 'forgotAfter'
          })
          .catch(error => {
            // Email was not sent
            this.forgotError = error
            this.forgotInProgress = false
          })
        return true
      },

      // Set the current component mode (loggedIn, login, register, forgot, etc)
      setMode: function (mode) {
        this.mode = mode
        return false
      }
    }
  }

  // VVVVV Obsolete, no longer used
  // function setCurrentUser (me, user, jwt, fromCookie) {
  //   // console.log();
  //   // console.log('++++++++>  setCurrentUser(): ttuat=' + ttuat + ', user=', user)
  //
  //   // Change the current user.
  //   // var oldCurrentUser = user
  //   if (user) {
  //     // console.log('Setting user to ', user);
  //
  //     // // If relationships are loaded, sort the summey
  //     // if (user.relationshipSummary) {
  //     //   var arrayOfFriends = user.relationshipSummary.hasFriend
  //     //   arrayOfFriends.sort(sortRelationshipSummaryByFullname)
  //     //
  //     //   // Short those who have friended me
  //     //   var arrayOfFriendedBy = user.relationshipSummary.isFriendedBy;
  //     //   arrayOfFriendedBy.sort(sortRelationshipSummaryByFullname)
  //     // }
  //     me.user = user
  //     me.entityId = user.id
  //     if (jwt) {
  //       me.jwt = jwt
  //     }
  //     setCookieFromCurrentUser(me)
  //
  //     // VVVVV need event
  //     // if (_onUserChange) { // && oldCurrentUser==null) {
  //     //
  //     //   var newUser = getCurrentUser() // may be a clone
  //     //   var newTtuat = _ttuat
  //     //   (_onUserChange)(newUser, newTtuat, fromCookie)
  //     // }
  //   } else {
  //     // No longer logged in
  //     me.user = null
  //     me.entityId = -1
  //     me.jwt = null
  //     setCookieFromCurrentUser(me)
  //
  //     // if (_onUserChange) { // && oldCurrentUser != null) {
  //     //   var fromCookie = false
  //     //   _onUserChange(null, null, fromCookie)
  //     // }
  //   }
  // }

  /*
   *  Place the current user details and access token in a cookie,
   *  so the next page we go to knows who are logged in as.
   */
  // VVVVV Obsolete, no longer used
  // function setCookieFromCurrentUser (me) {
  //   if (me.user) {
  //     // Create a new object here, but not with all the details
  //     let cookieObj = {
  //       user: {
  //         id: me.user.id,
  //         fullname: me.user.fullname,
  //         avatar: me.user.avatar,
  //         firstname: me.user.firstname,
  //         lastname: me.user.lastname
  //       },
  //       jwt: me.jwt
  //     }
  //     console.log('Setting ' + LOGIN_DETAILS_COOKIE_NAME + ' (not sure why)')
  //     setCookie(LOGIN_DETAILS_COOKIE_NAME, JSON.stringify(cookieObj), LOGIN_TIMEOUT_DAYS)
  //   } else {
  //     // Remove the cookie
  //     console.log('Removing ' + LOGIN_DETAILS_COOKIE_NAME + ' (no current user)')
  //     setCookie(LOGIN_DETAILS_COOKIE_NAME, null, 0)
  //   }
  // }

  /*
   *    Get the current URL, and remove any LoginService parameters.
   */
  // function currentPageURL () {
  //   let l = window.location
  //   let s = l.search // ?....&....&....
  //   if (s !== '') {
  //     s = '&' + s.substring(1) // Replace initial ? with &
  //     s = s
  //       .replace(/&AUTHSERVICE_JWT=[^&]*/, '')
  //       .replace(/&AUTHSERVICE_ERROR=[^&]*/, '')
  //     if (s !== '') {
  //       s = '?' + s.substring(1) // Replace initial & with ?
  //     }
  //   }
  //   let thisPageURL = l.protocol + "//" + l.host + l.pathname + s + l.hash
  //   return thisPageURL
  // }

  // Return the URL to jump to the bounce page.
  // function getBounceURL (me, bouncePageRelativePath, resumeURL) {
  //   console.log('getBounceURL(' + bouncePageRelativePath + ',' + resumeURL + ')')
  //   if (!resumeURL) {
  //     resumeURL = currentPageURL()
  //   }
  //   let l = window.location
  //   let thisPageURL = l.protocol + "//" + l.host // + l.pathname + s + l.hash;
  //   let url = thisPageURL + bouncePageRelativePath + '?resume=' + encodeURIComponent(resumeURL)
  //   return url
  // }

  function registerWithField (me, fieldname) {
    if (me.registerFields) {
      var fields = me.registerFields.split(',')
      for (var i = 0; i < fields.length; i++) {
        if (fields[i].trim() === fieldname) {
          return true
        }
      }
    }
    return false
  }

  // function endpoint (me) {
  //   let endpoint = '//' + me.host + ':' + me.port + '/' + me.version + '/' + me.apikey
  //   console.log('endpoint is ' + endpoint)
  //   return endpoint
  // }

</script>

<style scoped lang="scss">
h4 {
  color: black;
}
label {
  color: black !important;
}
.login-form {
  width: 350px;
}
.forgot-form {
  width: 350px;
  word-wrap: break-word;
}
.forgot-text {
  word-wrap: break-word;
  white-space: normal;
  margin-bottom: 20px;
}
.register-text {
  word-wrap: break-word;
  white-space: normal;
  margin-bottom: 20px;
}
.register-form {
  width: 350px;
  word-wrap: break-word;
}
.my-button {
  margin-top: 8px;
}
</style>
