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
          form
            div.has-text-centered
              div(v-if="allowFacebookLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-facebookLogin-button(@click.prevent="facebookLogin()")
                  .social-button-icon
                    i.fab.fa-facebook-f.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-facebook-f.has-text-white(v-else)
                  .social-button-text &nbsp; Login with Facebook
                br
              div(v-if="allowGoogleLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-googleLogin-button(@click.prevent="googleLogin()")
                  .social-button-icon
                    i.fab.fa-google.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-google.has-text-white(v-else)
                  .social-button-text &nbsp; Login with Google
                br
              div(v-if="allowGithubLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-githubLogin-button(:variant="'secondary'", @click.prevent="githubLogin()" tabindex="38")
                  .social-button-icon
                    i.fab.fa-github.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-github.has-text-white(v-else)
                  .social-button-text &nbsp; Login with Github
                br
              div(v-if="allowLinkedinLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-linkedinLogin-button(:variant="'secondary'", @click.prevent="linkedinLogin()" tabindex="38")
                  .social-button-icon
                    i.fab.fa-linkedin.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-linkedin.has-text-white(v-else)
                  .social-button-text &nbsp; Login with LinkedIn
                br
              div(v-if="allowTwitterLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-twitterLogin-button(:variant="'secondary'", @click.prevent="twitterLogin()" tabindex="38")
                  .social-button-icon
                    i.fab.fa-twitter.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-twitter.has-text-white(v-else)
                  .social-button-text &nbsp; Login with Twitter
                br
              //div(v-if="allowPropertyMeLogin")
                a.button.social-button.is-primary.loginservice-testhook-login-propertymeLogin-button(@click.prevent="propertyMeLogin()" tabindex="38")
                  .social-button-icon
                    i.fab.fa-home.has-text-white(v-if="$authservice.icons('fas')")
                    i.fa.fa-home.has-text-white(v-else)
                  .social-button-text &nbsp; Login with PropertyMe
                br
            div.has-text-centered(v-if="allowSocialLogin && loginWithEmail")
              br
              b - or -&nbsp;&nbsp;&nbsp;
              br
              br

            div.has-text-left(v-if="loginWithEmail")
              .field(v-if="loginWithUsername")
                label.label User Name
                .control.has-icons-left
                  // Yes, we map this onto email. In username mode you can log in with either.
                  input.input.loginservice-testhook-loginWithEmail-username(v-model.trim="email" type="text" v-on:keydown="keyhandler" placeholder="Enter your User Name", autocomplete="username")
                  span.icon.is-small.is-left
                    i.fas.fa-user(v-if="$authservice.icons('fas')")
                    i.fa.fa-user(v-else)
              .field(v-else)
                label.label Email
                .control.has-icons-left
                  input.input.loginservice-testhook-loginWithEmail-email(v-model.trim="email" type="text" v-on:keydown="keyhandler" placeholder="Enter an Account Email", autocomplete="email")
                  span.icon.is-small.is-left
                    i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
                    i.fa.fa-envelope-o(v-else)

              .field
                label.label Password
                .control.has-icons-left
                  input.input.loginservice-testhook-loginWithEmail-password(v-model.trim="password" type="password" v-on:keydown="keyhandler" autocomplete="password" placeholder="Enter your Password")
                  span.icon.is-small.is-left
                    i.fas.fa-lock(v-if="$authservice.icons('fas')")
                    i.fa.fa-lock(v-else)

              br
              .notification.is-danger(v-if="loginError")
                | {{loginError}}
                br

              button.button.is-primary.is-pulled-right.loginservice-testhook-loginWithEmail-login-button(@click="doLogin", type="submit", tabindex="33", :class="{ 'is-loading': loginInProgress }")
                | Login
              a.loginservice-testhook-loginWithEmail-forgot-button(v-if="provideForgottenPassword" href="#", @click.prevent="setMode('forgot')")
                .my-hover Forgot Login Info?

            //a.button.is-outlined(:size="'sm'", :variant="'link'", @click.prevent="setMode('forgot')") Forgot password
            //| &nbsp;
            //a.button.is-outlined(:size="'sm'", :variant="'link'", @click.prevent="setMode('register')") Sign Up
            br

      .card-footer(v-if="loginWithEmail && provideRegistration")
        .card-footer-item
          | {{loginSignupMessage}}
          .my-spacer
          a.loginservice-testhook-loginWithEmail-signup-button(href="#", @click.prevent="setMode('register')")
            .my-hover Sign up

    //
    //  One Time Password
    //
    .card(v-if="mode === 'otp'")
      header.card-header
        p.card-header-title
          | Two Factor Authentication
      //- .card-header
        | Please enter your OTP
      .card-content
        .field
          //- label.label One Time Password
          .control.has-icons-left
            input.input.loginservice-testhook-loginWithEmail-otp(v-model.trim="otp", type="number", autocomplete="off", placeholder="Please enter your One-Time Password (OTP)")
            span.icon.is-small.is-left
              i.fas.fa-lock(v-if="$authservice.icons('fas')")
              i.fa.fa-lock(v-else)
        br
        .notification.is-danger(v-if="loginError")
          | {{loginError}}
          br
        button.button.is-primary.is-pulled-right.loginservice-testhook-otp-login-button(@click="doLogin", type="submit", tabindex="33", :class="{ 'is-loading': loginInProgress }")
          | Login
        .my-spacer.is-pulled-right
        button.button.is-pulled-right.loginservice-testhook-otp-cancel-button(@click.prevent="cancelOtp")
          | Cancel
        br


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
        a.loginservice-testhook-loggedIn-logout-button(@click.prevent="doSignout()") {{signin ? 'Sign out' : 'Logout'}}



    //
    // Register a new user
    //
    // https://bootstrap-vue.js.org/docs/components/button
    .card(v-if="mode === 'register'")
      header.card-header
        p.card-header-title SIGN UP
      .card-content.has-text-left
        form
          // Username
          .field(v-if="registerRequiresUsername")
            label.label
              | User Name
            .control.has-icons-left
              input.input.loginservice-testhook-register-username(v-model.trim="registerUsername", type="text", v-on:keydown="keyhandler", v-on:input="validateUsername", :state="registerUsernameState", autocomplete="off", placeholder="Choose a user name")
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
              input.input.loginservice-testhook-register-email(v-model.trim="registerEmail" type="text" v-on:keydown="keyhandler" placeholder="Enter your email address")
              span.icon.is-small.is-left
                i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
                i.fa.fa-envelope-o(v-else)

          .field(v-if="registerRequiresPassword")
            label.label
              | Password
            .control.has-icons-left
              input.input.loginservice-testhook-register-password(v-model.trim="registerPassword" type="password" v-on:keydown="keyhandler" autocomplete="off" placeholder="Choose a password")
              span.icon.is-small.is-left
                i.fas.fa-lock(v-if="$authservice.icons('fas')")
                i.fa.fa-lock(v-else)

          .field(v-if="registerRequiresFirstName")
            label.label
              | First name
            .control
              input.input.loginservice-testhook-register-firstname(v-model.trim="registerFirstName" v-on:keydown="keyhandler")

          .field(v-if="registerRequiresMiddleName")
            label.label
              | Middle name
            .control
              input.input.loginservice-testhook-register-middlename(v-model.trim="registerMiddleName" v-on:keydown="keyhandler")

          .field(v-if="registerRequiresLastName")
            label.label
              | Last name
            .control
              input.input.loginservice-testhook-register-lastname(v-model.trim="registerLastName" v-on:keydown="keyhandler")

          br
          .notification.is-danger(v-if="registerError")
            | {{registerError}}
            br

          button.button.is-primary.is-pulled-right.loginservice-testhook-register-signup-button(type="submit", @click="register", :class="{ 'is-loading': registerInProgress }")
            | SIGN UP
          span.is-pulled-left
            | Already have an account? &nbsp;
            a.my-hover.loginservice-testhook-register-login-button(href="#", @click.prevent="setMode('login')") Log in
          br


      .card-footer(v-if="termsMessage")
        .card-footer-item.has-text-centered
          .is-small(v-if="termsRoute")
            a.is-small.loginservice-testhook-termsMessage-link-button(:href="termsRoute", target="_blank") {{termsMessage}}
          .is-small(v-else)
            | {{termsMessage}}
          //- // For some reaason &nbsp; gets ignored, so use &ensp; (double space)
          //- | {{termsMessage}} &ensp;
          //- .is-small(v-if="termsRoute")
          //-   | &ensp;(
          //-   a.is-small.loginservice-testhook-termsMessage-link-button(:href="termsRoute", target="_blank") link
          //-   | )


    // Message for after the register email has been sent
    .card(v-if="mode === 'registerAfter'")
      header.card-header
        p.card-header-title Congratulations
      .card-content
        form
          // h4 Registration
          p
            | Congratulations, you now have a user account.
            | We have sent you an email to verify your email address.
          p
            | Please take a moment to check your email and complete
            | the registration process.
          // Should just close the dropdown VVVVV
          // a.button(:size="'sm'", :variant="'primary'", @click.prevent="setMode('login')") Ok
          br
          button.button.is-pulled-right.is-primary.loginservice-testhook-registerAfter-ok-button(type="submit", @click.prevent="setMode('login')") OK
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
        .card-content.has-text-left
          form
            | Enter your email address and we'll send you an email with recovery instructions.
            br
            br

            .field
              label.label
                | Email
              .control.has-icons-left
                input.input.loginservice-testhook-forgot-email(v-model.trim="forgotEmail" type="text" v-on:keydown="keyhandler" placeholder="Enter your Email Address")
                span.icon.is-small.is-left
                  i.far.fa-envelope-open(v-if="$authservice.icons('fas')")
                  i.fa.fa-envelope-o(v-else)

            .notification.is-danger(v-if="forgotError" show)
              | {{forgotError}}
            br

            button.button.is-primary.is-pulled-right.loginservice-testhook-forgot-sendemail-button(type="submit", @click.prevent="forgot", :class="{ 'is-loading': forgotInProgress }")
              | Send the Email
            .my-spacer.is-pulled-right
            button.button.is-pulled-right.loginservice-testhook-forgot-cancel-button(@click.prevent="setMode('login')")
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
        form
          | We have sent an email to {{forgotEmail}} with
          | instructions to reset your password.
          br
          br

          // Should just close the dropdown VVVVV
          button.button.is-primary.is-pulled-right.loginservice-testhook-forgotAfter-ok-button(type="submit", @click.prevent="setMode('login')") Ok
          br
</template>

<script>
  import debounce from 'debounce'
  // Icons from vue-awesome
  // See https://github.com/Justineo/vue-awesome
  //import 'vue-awesome/icons/refresh'
  import Icon from 'vue-awesome/components/Icon.vue'

  /**
   *  This component provides a login menu on the navbar of a page.
   *
   *  @author Philip Callender
   */
  export default {
    name: 'loginservice-login',
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

      /*
       *  Registration-related
       */
      // Which fields required for registration
      // registerFields: String,
      // registerResume: String, // URL - where to go after email verification

      // Forgotten password related
      /**
       * @ignore
       */
      forgotResume: String, // URL - where to go after email verification

      /**
       * Display this component in a specific mode.
       * @values login, register, forgot
       */
      initialMode: String
    },
    data () {
      // console.log('data(): this=', this)
      return {
        username: '',
        email: '',
        password: '',
        otp: '',
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
      loginWithEmail: function () {
        return !!this.optionValue('hints.login.email', true)
      },
      loginWithUsername: function () {
        // let val = this.optionValue('hints.usernames', false)
        // console.log(`loginWithUsername: ${val}`);
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
//      allowPropertyMeLogin: function () {
//        return !!this.optionValue('hints.login.propertyMe', false)
//      },
      allowSocialLogin: function () {
        return (
          this.allowFacebookLogin ||
          this.allowGithubLogin ||
          this.allowGoogleLogin ||
          this.allowLinkedinLogin ||
          this.allowTwitterLogin
//	  || this.allowPropertyMeLogin
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

      /**
       * Sign in using email/password or username/password
       */
      doLogin: function (event) {
        // // DO NOT UNCOMMENT, EXCEPT WHILE DEBUGGING
        // console.log(`doLogin(${this.email}, ${this.password}, ${this.otp})`)

        this.loginError = ''
        this.loginInProgress = true

        this.$authservice.login(this.email, this.password, this.otp)
          .then((userDetails) => {
            if (userDetails === 'require-otp') {
              // Leave the password as-is
              this.otp = ''
              this.loginError = ''
              this.loginInProgress = false
              this.mode = 'otp'
            } else {
              this.password = ''
              this.otp = ''
              this.loginError = ''
              this.loginInProgress = false
              this.mode = 'loggedIn'
              /**
               * Triggered current user has been changed, due to login or logout.
               * @property {string} userId New userID, or 0 if no longer logged in.
               */
              this.$emit('userchange', this.$authservice.user.id)
            }
          })
          .catch((errmsg) => {
            if (this.mode === 'otp') {
              this.otp = ''
            } else {
              this.password = ''
              this.mode = 'login'
            }
            this.loginError = errmsg
            this.loginInProgress = false
            this.$emit('userchange', 0)
          })
        // Don't do the default form action
        event.preventDefault();
        return false
      }, // doLogin

      cancelOtp: function () {
        this.otp = ''
        this.loginError = ''
        this.loginInProgress = false
        this.setMode('login')
      },

      // Sign out from the menu
      doSignout: function () {
        this.mode = 'login'
        this.email = ''
        this.password = ''
        this.otp = ''

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
//      propertyMeLogin: function () {
//        // alert('propertyMe login, ' + this.username + ', ' + this.password)
//        this.$authservice.initiateOAuth(this, 'propertyMe')
//      },

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
        // Don't do the default form action
        event.preventDefault();
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
        return false
      },

      // Set the current component mode (loggedIn, login, register, forgot, etc)
      setMode: function (mode) {
        this.mode = mode
        return false
      }
    }
  }
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
.my-spacer {
  min-width: 8px;
  min-height: 1px;
}
.my-hover:hover {
  color: #0099ff;
  color: #0066ff;
  font-weight: 600;
}
</style>


<docs>

Handle login, registration, and forgotten password functionality.

The behaviour of this component is dictated by the application configuration
provided when you initialise this package, and also by your settings in the
Tooltwist dashboard at tooltwist.com.

### Example
```jsx
<loginservice-login/>
```
</docs>

