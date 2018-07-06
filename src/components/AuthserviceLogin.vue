<template lang="pug">

  .authservice-login
    //div(:text="($authservice.user!=null) ? (headerName) : (signin ? 'Sign in' : 'Login')" right)

    .card(v-if="mode === 'login'" href="")
      header.card-header
        p.card-header-title
          | Login / Sign In
        //a.card-header-icon(href="#" aria-label="more options")
        //  .icon
        //    i.fas.fa-angle-down(aria-hidden="true")
      .card-content
        .content
          div.has-text-centered
            div(v-if="allowFacebookLogin")
              a.button.social-button.is-primary(v-on:click="facebookLogin()")
                .social-button-icon
                  i.fab.fa-facebook-f.has-text-white(v-if="$authservice.icons('fas')")
                  i.fa.fa-facebook-f.has-text-white(v-else)
                .social-button-text &nbsp; Login with Facebook
              br
            div(v-if="allowGoogleLogin")
              a.button.social-button.is-primary(v-on:click="googleLogin()")
                .social-button-icon
                  i.fab.fa-google.has-text-white(v-if="$authservice.icons('fas')")
                  i.fa.fa-google.has-text-white(v-else)
                .social-button-text &nbsp; Login with Google
              br
            div(v-if="allowGithubLogin")
              a.button.social-button.is-primary(:variant="'secondary'" v-on:click="githubLogin()" tabindex="38")
                .social-button-icon
                  i.fab.fa-github.has-text-white(v-if="$authservice.icons('fas')")
                  i.fa.fa-github.has-text-white(v-else)
                .social-button-text &nbsp; Login with Github
              br
            div(v-if="allowLinkedinLogin")
              a.button.social-button.is-primary(:variant="'secondary'" v-on:click="linkedinLogin()" tabindex="38")
                .social-button-icon
                  i.fab.fa-linkedin.has-text-white(v-if="$authservice.icons('fas')")
                  i.fa.fa-linkedin.has-text-white(v-else)
                .social-button-text &nbsp; Login with LinkedIn
              br
            div(v-if="allowTwitterLogin")
              a.button.social-button.is-primary(:variant="'secondary'" v-on:click="twitterLogin()" tabindex="38")
                .social-button-icon
                  i.fab.fa-twitter.has-text-white(v-if="$authservice.icons('fas')")
                  i.fa.fa-twitter.has-text-white(v-else)
                .social-button-text &nbsp; Login with Twitter
              br
          div.has-text-centered(v-if="allowSocialLogin && loginWithEmail")
            br
            b - or -&nbsp;&nbsp;&nbsp;
            br
            br

          div(v-if="loginWithEmail")
            .field(v-if="loginWithUsername")
              label.label User Name
              .control.has-icons-left
                input.input(v-model.trim="email" type="text" v-on:keydown.native="keyhandler" placeholder="Enter your User Name")
                span.icon.is-small.is-left
                  i.fas.fa-user(v-if="$authservice.icons('fas')")
                  i.fa.fa-user(v-else)
            .field(v-else)
              label.label Email
              .control.has-icons-left
                input.input(v-model.trim="email" type="text" v-on:keydown.native="keyhandler" placeholder="Enter an Account Email")
                span.icon.is-small.is-left
                  i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
                  i.fa.fa-envelope-o(v-else)

            .field
              label.label Password
              .control.has-icons-left
                input.input(v-model.trim="password" type="password" v-on:keydown.native="keyhandler" autocomplete="current-password" placeholder="Enter your Password")
                span.icon.is-small.is-left
                  i.fas.fa-lock(v-if="$authservice.icons('fas')")
                  i.fa.fa-lock(v-else)

            br
            .notification.is-danger(v-if="loginError")
              | {{loginError}}
              br


            a.button.is-primary.is-pulled-right(@click="doLogin", tabindex="33", :class="{ 'is-loading': loginInProgress }")
              | Login
            a(v-if="provideForgottenPassword" href="#" v-on:click="setMode('forgot')")
              | Forgot Login Info?
          // loginWithEmail

          //a.button.is-outlined(:size="'sm'", :variant="'link'", v-on:click="setMode('forgot')") Forgot password
          //| &nbsp;
          //a.button.is-outlined(:size="'sm'", :variant="'link'", v-on:click="setMode('register')") Sign Up
          br

      .card-footer(v-if="loginWithEmail && provideRegistration")
        .card-footer-item
          | {{loginSignupMessage}} &nbsp;&nbsp;
          a(href="#" v-on:click="setMode('register')")
            | Sign up




      //- footer.card-footer
      //-   a.card-footer-item(href="#") Save
      //-   a.card-footer-item(href="#") Edit
      //-   a.card-footer-item(href="#") Delete

    //
    //  Logged in mode
    //
    .card(v-if="mode === 'loggedIn'")
      .card-content
        | You are logged in as&nbsp;
        strong {{$authservice.user.fullname}}
        | &nbsp;({{$authservice.user.authority}})
        br
        img(v-if="$authservice.user.avatar", :src="$authservice.user.avatar", alt="")
        br
        | $loginservice.user:
        br
        .box.is-size-7
          | {{$authservice.user}}
        br
        a(v-on:click="doSignout()") {{signin ? 'Sign out' : 'Logout'}}



    //
    // Register a new user
    //
    // https://bootstrap-vue.js.org/docs/components/button
    .card(v-if="mode === 'register'")
      header.card-header
        p.card-header-title SIGN UP
      .card-content

        // Username
        .field(v-if="registerRequiresUsername")
          label.label
            | User Name
          .control.has-icons-left
            input.input(v-model.trim="registerUsername", type="text", v-on:keydown.native="keyhandler", v-on:input="validateUsername", :state="registerUsernameState", autocomplete="off", placeholder="Choose a user name")
            span.icon.is-small.is-left
              i.fas.fa-user(v-if="$authservice.icons('fas')")
              i.fa.fa-user(v-else)

          .notification.is-danger(v-if="registerUsernameError")
            // This will only be shown if the preceeding input has an invalid state
            | {{registerUsernameError}}
            br

        // Email
        .field
          label.label
            | Email
          .control.has-icons-left
            input.input(v-model.trim="registerEmail" type="text" v-on:keydown.native="keyhandler" placeholder="Enter your email address")
            span.icon.is-small.is-left
              i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
              i.fa.fa-envelope-o(v-else)

        .field(v-if="registerRequiresPassword")
          label.label
            | Password
          .control.has-icons-left
            input.input(v-model.trim="registerPassword" type="password" v-on:keydown.native="keyhandler" autocomplete="off" placeholder="Choose a password")
            span.icon.is-small.is-left
              i.fas.fa-lock(v-if="$authservice.icons('fas')")
              i.fa.fa-lock(v-else)

        .field(v-if="registerRequiresFirstName")
          label.label
            | First name
          .control
            input.input(v-model.trim="registerFirstName" v-on:keydown.native="keyhandler")

        .field(v-if="registerRequiresMiddleName")
          label.label
            | Middle name
          .control
            input.input(v-model.trim="registerMiddleName" v-on:keydown.native="keyhandler")

        .field(v-if="registerRequiresLastName")
          label.label
            | Last name
          .control
            input.input(v-model.trim="registerLastName" v-on:keydown.native="keyhandler")

        br
        .notification.is-danger(v-if="registerError")
          | {{registerError}}
          br

        a.button.is-primary.is-pulled-right(@click="register", :class="{ 'is-loading': registerInProgress }")
          | SIGN UP
        span.is-pulled-left
          | Already have an account? &nbsp;
          a(href="#" v-on:click="setMode('login')") Log in
        br


      .card-footer(v-if="termsMessage")
        .card-footer-item.has-text-centered
          | {{termsMessage}}
          .is-small(v-if="termsRoute")
            | &nbsp;&nbsp;(
            a.is-small(:href="termsRoute") link
            | )


    // Message for after the register email has been sent
    .card(v-if="mode === 'registerAfter'")
      header.card-header
        p.card-header-title Congratulations
      .card-content
        // h4 Registration
        p
          | Congratulations, you now have a user account.
          | We have sent you an email to verify your email address.
        p
          | Please take a moment to check your email and complete
          | the registration process.
        // Should just close the dropdown VVVVV
        // a.button(:size="'sm'", :variant="'primary'", v-on:click="setMode('login')") Ok
        br
        button.button.is-pulled-right.is-primary(type="submit", v-on:click="setMode('login')") OK
        br
        br
    //- .b-form

    //
    // Forgot mode
    //
    div(v-if="mode === 'forgot'")
      br
      br
      .card
        header.card-header
          p.card-header-title
            | Forgot your Login Information?
        .card-content
          | No problem. Enter your email address
          | &nbsp;and we'll well send an email with recovery instructions.
          br
          br

          .field
            label.label
              | Email Address
            .control.has-icons-left
              input.input(v-model.trim="forgotEmail" type="text" v-on:keydown.native="keyhandler" placeholder="Enter your Email Address")
              span.icon.is-small.is-left
                i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
                i.fa.fa-envelope-o(v-else)

          .notification.is-danger(v-if="forgotError" show)
            | {{forgotError}}
          br

          // https://bootstrap-vue.js.org/docs/components/button
          a.button.is-primary.is-pulled-right(@click="forgot", :class="{ 'is-loading': forgotInProgress }")
            | Send the Email
          .is-pulled-right &nbsp;&nbsp;
          a.button.is-pulled-right(v-on:click="setMode('login')")
            | Cancel
          br
      br
      br
    //- forget

    // Message for after the forgot email has been sent
    .card(v-if="mode === 'forgotAfter'")
      header.card-header
        p.card-header-title
          | Forgotten Password
      .card-content
        | We have sent an email to {{forgotEmail}} with
        | instructions to reset your password.
        br
        br

        // Should just close the dropdown VVVVV
        a.button.is-primary.is-pulled-right(v-on:click="setMode('login')") Ok
        br
    //- div

  //- b-nav-item-dropdown
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
    name: 'authservice-login',
    components: {
      Icon
    },
    props: {
      // /**
      // *  Allow login with username (rather than email)
      // */
      // loginWithUsername: {
      //   type: Boolean,
      //   default: false
      // },
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

      // Initial mode (e.g. 'register' or 'signup')
      initialMode: String,

      nocomma: String
    },
    data () {
      // console.log('data(): this=', this)
      return {
        username: '',
        email: '',
        password: '',
        loggedIn: false,
        mode: (this.$authservice && this.$authservice.user) ? 'loggedIn' : 'login',

        // loginWithUsername: true,
        loginError: '',
        loginInProgress: '',

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
        registerError: '',
        registerInProgress: false,

        // registerRequiresUsername: registerWithField(this, 'username'),
        // registerRequiresPassword: registerWithField(this, 'password'),
        // registerRequiresFirstName: registerWithField(this, 'first_name'),
        // registerRequiresMiddleName: registerWithField(this, 'middle_name'),
        // registerRequiresLastName: registerWithField(this, 'last_name'),

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
      },// headerName
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
      loginWithEmail: function () {
        return !!this.optionValue('hints.login.email', true)
      },
      loginWithUsername: function () {
        let val = this.optionValue('hints.usernames', false)
        console.log(`loginWithUsername: ${val}`);
        return !!this.optionValue('hints.usernames', false)
      },
      allowFacebookLogin: function () {
        return !!this.optionValue('hints.login.facebook', false)
      },
      allowGithubLogin: function () {
        return !!this.optionValue('hints.login.github', false)
      },
      allowGoogleLogin: function () {
        return !!this.optionValue('hints.login.google', false)
      },
      allowLinkedinLogin: function () {
        return !!this.optionValue('hints.login.linkedin', false)
      },
      allowTwitterLogin: function () {
        return !!this.optionValue('hints.login.twitter', false)
      },
      allowSocialLogin: function () {
        return (
          this.allowFacebookLogin ||
          this.allowGithubLogin ||
          this.allowGoogleLogin ||
          this.allowLinkedinLogin ||
          this.allowTwitterLogin
        )
      },
      loginSignupMessage: function () {
        const site = this.optionValue('hints.sitename', 'this site')
        let msg = `New to ${site}?`
        // let msg = 'Don\'t have an account yet?'
        return this.optionValue('hints.login.registerMessage', msg)
      },
      termsMessage: function () {
        const site = this.optionValue('hints.sitename', 'this site')
        let msg = `By signing up to ${site} you agree to our EULA.`
        return this.optionValue('hints.register.termsMessage', msg)
      },
      termsRoute: function () {
        return this.optionValue('hints.register.termsRoute', null)
      },
      registerRequiresUsername: function () {
        return !!this.optionValue('hints.usernames', false)
      },
      registerRequiresPassword: function () {
        return !!this.optionValue('hints.register.password', true)
      },
      registerRequiresFirstName: function () {
        return !!this.optionValue('hints.register.firstname', false)
      },
      registerRequiresMiddleName: function () {
        return !!this.optionValue('hints.register.middlename', false)
      },
      registerRequiresLastName: function () {
        return !!this.optionValue('hints.register.lastname', false)
      },
      provideEmailLogin: function () {
        return (this.$authservice && this.$authservice.isEmailSupported())
      },
      provideRegistration: function () {
        return (this.$authservice && this.$authservice.isRegistrationSupported())
      },
      provideForgottenPassword: function () {
        return (this.$authservice && this.$authservice.isForgottenPasswordSupported())
      }
    },
    // Once the componented has been created, see if we are already
    // logged in (as shown by having a valid JWT in a cookie)
    created: function () {

      // See if the user wants to start in a particular mode
      if (this.$authservice && this.$authservice.user) {
        this.mode = 'loggedIn'
      } else if (this.initialMode === 'login' || this.initialMode === 'forgot' || this.initialMode === 'register') {
        this.mode = this.initialMode
      }

      // console.log('============= NEW COMPONENT ================')
      // console.log('\n\n\n1 ====>', this.$authservice)
      // console.log('\n\n\n2 ====>', this.$authservice.user)
      // registerRequiresUsername: registerWithField(this, 'username'),
      // registerRequiresPassword: registerWithField(this, 'password'),
      // registerRequiresFirstName: registerWithField(this, 'first_name'),
      // registerRequiresMiddleName: registerWithField(this, 'middle_name'),
      // registerRequiresLastName: registerWithField(this, 'last_name'),

    },
    methods: {

      // Prevent the default key bindings from closing the
      // login dropdown when TAB is pressed to move between fields.
      keyhandler: function (event) {
        event.stopPropagation()
      },


      optionValue: function (name, _default) {
        //console.log(`optionValue(${name}, ${_default})`);
        if (!this.$authservice) {
          console.log(`this.$authservice not found`);
          return _default // Should not happen
        }
        if (!this.$authservice.options) {
          console.log(`this.$authservice.options not found`);
          return _default
        }
        //console.log(`options=`, this.$authservice.options);
        const names = name.split('.')
        let obj = this.$authservice.options
        for (var i = 0; i < names.length; i++) {
          let name = names[i]
          //console.log(`Looking for ${name}`);
          //console.log(`got ${typeof obj[name]}`);
          if (typeof obj[name] === 'undefined') {
            // Not found
            //console.log(`- not found`);
            return _default
          }
          obj = obj[name]
        }
        //console.log(`found it`);
        return obj
      },

      // Sign in using email/password or username/password
      doLogin: function (event) {
        console.log('doLogin(' + this.email + ', ' + this.password + ')')

        const password = this.password
        this.password = ''
        this.loginError = ''
        this.loginInProgress = true

        this.$authservice.login(this.email, password)
          .then((userDetails) => {
            this.loginError = ''
            this.loginInProgress = false
            this.mode = 'loggedIn'
            this.$emit('userchange', this.$authservice.user.id)
          })
          .catch((errmsg) => {
            this.loginError = errmsg
            this.loginInProgress = false
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
      githubLogin: function () {
        //alert('github login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'github')
      },
      googleLogin: function () {
        //alert('google login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'google')
      },
      linkedinLogin: function () {
        //alert('linkedin login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'linkedin')
      },
      twitterLogin: function () {
        //alert('twitter login, ' + this.username + ', ' + this.password)
        this.$authservice.initiateOAuth(this, 'twitter')
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

.authservice-login {
  .card {
    width: 480px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 10px;
    background-color: #f2f2f2;
  }

  footer {
    padding-top: 0px;
    padding-bottom: 0px;
  }

  .my-button {
    margin-top: 8px;
  }

  .social-button {
    width: 210px;
    margin-top: 5px;

    .social-button-icon {
        min-width: 16px;
    }
    .social-button-text {
      min-width: 110px;
      text-align: left;
    }
  }

}


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
</style>
