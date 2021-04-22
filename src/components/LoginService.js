/*
 *  Client API for LoginService.io
 *  See https://authservice.io
 */
import jwtDecode from 'jwt-decode'
import axios from 'axios'
import QueryString from 'query-string'

// See https://fsymbols.com/signs/tick/
const CHECKBOX_YES = '\u2713'
const CHECKBOX_NO = '\u2717'

// const debug = process.env.NODE_ENV !== 'production'

const LOGIN_TIMEOUT_DAYS = 3
const NETWORK_ERROR_MSG = 'Could not contact authentication server'

class LoginService {
  // static install: (Vue) => void;
  // static version: string;

  // static install (Vue) {
  //   alert('Install 2...')
  //   // Vue.prototype.$auth = new LoginService()
  //   Vue.prototype.$auth = 123
  //
  //   Object.defineProperty(Vue.prototype, '$authservice', {
  //     get () { return 987 }
  //   })
  // }

  constructor(options) {
    console.log('** initializing vue-loginservice')
    console.log(options)
    this.host = options.host ? options.host : 'api.authservice.io'
    this.port = options.port ? options.port : 443
    this.version = options.version ? options.version : 'v2'
    this.apikey = options.apikey

    // Check the UrlPrefix only has a trailing slash
    this.urlPrefix = 'loginservice'
    if (typeof (options.urlPrefix) !== 'undefined') {
      if (options.debug) console.log(`- will use options.urlPrefix`)
      this.urlPrefix = options.urlPrefix
    }
    while (this.urlPrefix.startsWith('/')) {
      this.urlPrefix = this.urlPrefix.substring(1)
    }
    while (this.urlPrefix.endsWith('/')) {
      this.urlPrefix = this.urlPrefix.substring(0, this.urlPrefix.length - 1)
    }
    if (this.urlPrefix) {
      this.urlPrefix += '/'
    }
    // console.log(`UrlPrefix: ${this.urlPrefix}`)

    // Determine what protocol to use
    this.protocol = 'http'
    if (options.protocol && (options.protocol === 'http' || options.protocol === 'https')) {
      this.protocol = options.protocol
    } else {
      // See if we can determine the protocol from the port
      if (this.port === 80) {
        this.protocol = 'http'
      } else if (this.port === 443) {
        this.protocol = 'https'
      } else {
        // Non-standard port, probably during development
      }
    }
    if (options.debug) console.log(`- endpoint: ${this.endpoint()}`)

    // Decide which icon set to use with a defaultIconPack option.
    // Loosely based on:
    //    https://buefy.github.io/#/documentation/constructor-options
    //
    // Currently recognise:
    //    fa (font-awsome 4)
    //    fas (font-awsome 5)
    this.defaultIconPack = options.defaultIconPack ? options.defaultIconPack : 'fa'
    this.icons = (pack) => { return this.defaultIconPack === pack }

    // See if we are supporting email login (default to yes)
    if (options.hints && options.hints.login && typeof (options.hints.login.email) !== 'undefined' && !options.hints.login.email) {
      console.log(`${CHECKBOX_NO} Email login`);
      this.emailSupported = false;
    } else {
      console.log(`${CHECKBOX_YES} Email login`);
      this.emailSupported = true;
    }

    // See if we are supporting usernames
    if (options.hints && typeof (options.hints.usernames) !== 'undefined' && !options.hints.usernames) {
      console.log(`${CHECKBOX_NO} User names (use email as identifier)`);
      this.usernamesSupported = false;
    } else {
      console.log(`${CHECKBOX_YES} Support user names`);
      this.usernamesSupported = true;
    }

    // See if we have URLs specified for successful login and failure.
    // If these are not set, these events will return to the initiating page.
    this.loginResume = null
    this.loginFail = null
    if (options.hints && options.hints.login) {

      // See if we have a resumeURL
      if (options.hints.login.resumeURL) {
        if (typeof (options.hints.login.resumeURL) !== 'string') {
          console.error('options.hints.login.resumeURL must be a string')
          console.log(`Will return to current page after login`);
        } else {
          // Convert our resumeURL to a full URL (it is usually a relative path)
          this.loginResume = this.URLOnThisWebsite(options.hints.login.resumeURL)
          if (this.loginResume === null) {
            // The resumeURL is absolute, but not to the current website's domain.
            console.error(`options.hints.login.resumeURL not on this website: (${options.hints.login.resumeURL})`)
            console.log(`Will return to current page after login`);
          }
        }
      }

      // See if we have a failURL
      if (options.hints.login.failURL) {
        if (typeof (options.hints.login.failURL) !== 'string') {
          console.error('options.hints.login.failURL must be a string')
          console.log(`Will return to current page on error`);
        } else {
          // Convert our failURL to a full URL (it is usually a relative path)
          this.loginFail = this.URLOnThisWebsite(options.hints.login.failURL)
          if (this.loginFail === null) {
            // The failURL is absolute, but not to the current website's domain.
            console.error(`options.hints.login.failURL not on this website: (${options.hints.login.failURL})`)
            console.log(`Will return to current page on error`);
          }
        }
      }
    }

    // See if registration is allowed
    if (!this.emailSupported) {
      // login.email: false
      console.log(`${CHECKBOX_NO} Registration`);
      console.log(`  (because email is not supported)`)
      this.registrationSupported = false;
    } else if (options.hints) {

      // Perhaps allow registration. Check we have what we need.
      if (typeof (options.hints.register) !== 'undefined' && !options.hints.register) {
        // Check for hints.register: false
        console.log(`${CHECKBOX_NO} Registration`);
        this.registrationSupported = false;
      } else if (typeof (options.hints.register) !== 'object') {
        this.registrationSupported = false;
        console.log(`${CHECKBOX_NO} Registration`);
        console.error('  (options.hints.register must be false, or an object)')
      } else if (!options.hints.register.resumeURL) {
        this.registrationSupported = false;
        console.log(`${CHECKBOX_NO} Registration`);
        console.error('  (options.hints.register.resumeURL must be provided if register is enabled)')
      } else if (typeof (options.hints.register.resumeURL) !== 'string') {
        this.registrationSupported = false;
        console.log(`${CHECKBOX_NO} Registration`);
        console.error('  (options.hints.register.resumeURL must be a string)')
      } else {

        // Convert our resumeURL to a full URL (it is usually a relative path)
        this.registerResume = this.URLOnThisWebsite(options.hints.register.resumeURL)
        if (this.registerResume === null) {
          // The resumeURL is absolute, but not to the current website's domain.
          console.error(`${CHECKBOX_NO} Registration`);
          console.log(`  (options.hints.register.resumeURL not on this website: ${options.hints.register.resumeURL})`)
          this.registrationSupported = false;
        } else {
          // All good for registration
          console.log(`${CHECKBOX_YES} Registration`);
          this.registrationSupported = true;
        }

        // Convert our expiredURL to a full URL (it is usually a relative path)
        this.registerExpired = '' // Clicking on an expired link gives an HTML return status, rather than forwarding to a page.
        if (options.hints.register.expiredURL) {
          this.registerExpired = this.URLOnThisWebsite(options.hints.register.expiredURL)
          if (this.registerExpired === null) {
            // The expiredURL is absolute, but not to the current website's domain.
            console.error(`${CHECKBOX_YES} Registration`);
            console.log(`  (options.hints.register.expiredURL not on this website: ${options.hints.register.expiredURL})`)
            this.registrationSupported = false;
          }
        }
      }
    }

    // See if forgotten password is allowed
    if (!this.emailSupported) {
      // Email is not used (options.login.email is false)
      console.error(`${CHECKBOX_NO} Password retrieval`);
      console.log(`  (because email is not supported)`)
      this.forgottenPasswordSupported = false;
    } else if (options.hints) {

      // Maybe allow forgot password. Check we have what we need.
      if (typeof (options.hints.forgot) !== 'undefined' && !options.hints.forgot) {
        // Forgot password is specifically disallowed (options.hints.forgot is false)
        this.forgottenPasswordSupported = false;
      } else if (typeof (options.hints.forgot) !== 'object') {
        console.error(`${CHECKBOX_NO} Password retrieval`);
        console.log('  (options.hints.forgot must be false, or an object)')
        this.forgottenPasswordSupported = false;
      } else if (!options.hints.forgot || !options.hints.forgot.resumeURL) {
        console.error(`${CHECKBOX_NO} Password retrieval`);
        console.log('  (options.hints.forgot.resumeURL must be provided)')
        this.forgottenPasswordSupported = false;
      }
      else if (typeof (options.hints.forgot.resumeURL) !== 'string') {
        console.error(`${CHECKBOX_NO} Password retrieval`);
        console.log('  (options.hints.forgot.resumeURL must be a string)')
        this.forgottenPasswordSupported = false;
      } else {
        // Convert our resumeURL to a full URL (it is usually a relative path)
        this.forgotResume = this.URLOnThisWebsite(options.hints.forgot.resumeURL)
        if (this.forgotResume === null) {
          // The resumeURL is absolute, but not to the current website's domain.
          console.error(`${CHECKBOX_NO} Password retrieval`);
          console.log(`  (options.hints.forgot.resumeURL not on this website: ${options.hints.forgot.resumeURL})`)
          this.forgottenPasswordSupported = false;
        } else {
          // All good for forgotten password
          console.log(`${CHECKBOX_YES} Password retrieval`);
          this.forgottenPasswordSupported = true;
        }

        // Convert our resumeURL to a full URL (it is usually a relative path)
        this.forgotExpired = '' // Clicking on an expired link gives an HTML return status, rather than forwarding to a page.
        if (options.hints.forgot.expiredURL) {
          this.forgotExpired = this.URLOnThisWebsite(options.hints.forgot.expiredURL)
          if (this.forgotExpired === null) {
            // The expiredURL is absolute, but not to the current website's domain.
            console.error(`${CHECKBOX_NO} Password retrieval`);
            console.log(`  (options.hints.forgot.expiredURL not on this website: ${options.hints.forgot.expiredURL})`)
            this.forgottenPasswordSupported = false;
          }
        }
      }
    }

    // Check for a non-default bounce page.
    if (options.hints && typeof(options.hints.bouncePage) === 'string') {
      this.bouncePage = options.hints.bouncePage
    } else {
      this.bouncePage = '/authservice-bounce'
    }
    console.log(`Bounce page: ${this.bouncePage}`)

    // Remember the options
    this.options = options

    // Current user details
    this.user = null
    this.jwt = null
    this.fromCache = false
  }

  // init(app /* Vue component instance */) {
  //   // console.log('&&& MyComponent init')
  //   // VVVVV This does not seem to be called
  //   // alert('za init()')
  //   process.env.NODE_ENV !== 'production' && assert(
  //     install.installed,
  //     `not installed. Make sure to call \`Vue.use(LoginService, options)\` ` +
  //     `before creating root instance.`
  //   )
  // }

  // Work out the server's endpoint
  endpoint() {
    let portStuff = ''
    if (this.protocol === 'http' && this.port !== 80) {
      portStuff = `:${this.port}`
    } else if (this.protocol === 'https' && this.port !== 443) {
      portStuff = `:${this.port}`
    }
    const endpoint = `${this.protocol}://${this.host}${portStuff}/${this.urlPrefix}${this.version}/${this.apikey}`
    // console.log(`endpoint=${endpoint}`);
    return endpoint
  }

  //
  //  We've just arrived at a page.
  //  See if a JWT for the current user is provided in the URL parameters
  //  or in a cookie for this site.
  //
  checkInitialLoginStatus(debug) {
    debug = true
    //console.log('+++++ checkInitialLoginStatus ++++++')

    // If this is the browser, look for the JWT as a URL parameter
    if (window) {
      // See if we have AUTHSERVICE_JWT in the URL to this page
      let jwt = this.getURLParameterByName("AUTHSERVICE_JWT")
      if (jwt) {
        if (debug) {
          // console.log("***")
          // console.log("***")
          console.log("JWT specified in URL")
          // console.log("***")
          // console.log("***")
        }
        const isFromCookie = false
        if (this.setCurrentUserFromJWT(jwt, isFromCookie)) {
          // Remember this JWT in a cookie for the next page.
          this.setCookie(jwt, LOGIN_TIMEOUT_DAYS)
          return true
        } else {
          // Invalid JWT
          this.removeCookie()
          return false
        }
      }
    }

    // See if we have a cookie containing the current JWT
    let jwt = this.getCookie()
    if (jwt) {
      if (debug) {
        // console.log("***")
        // console.log("***")
        console.log("JWT found in a cookie")
        // console.log("***")
        // console.log("***")
      }
      // var isFromCookie = true;
      const isFromCookie = false // Check if it is stale ZZZZ
      if (this.setCurrentUserFromJWT(jwt, isFromCookie)) {
        // Good login from cookie
        return true
      } else {
        // Dud cookie
        this.removeCookie()
        return false
      }
    }

    // not a good cookie
    if (debug) {
      // console.log("***")
      // console.log("***")
      console.log("JWT not in URL or COOKIE")
      // console.log("***")
      // console.log("***")
    }
    const isFromCookie = false
    this.setCurrentUserFromJWT(null, isFromCookie)
    return false
  }

  /*
   *  Log in using username / password.
   */
  login(email, password, otp) {
      // // DO NOT UNCOMMENT, EXCEPT WHILE DEBUGGING
      // console.log(`login(${email}, ${password}, ${otp})`)

    return new Promise((resolve, reject) => {
      // console.log('login(email=' + email + ')')
      // console.log('++++++++++ email=' + email + ', password=' + password)

      /*
       *  Call the server to authenticate the username/password.
       */
      axios({
        method: 'post',
        url: this.endpoint() + '/email/login',
        headers: {
          // 'Authorization': 'Bearer ' + jwt
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          email: email,
          password: password,
          otp: otp,
        }
      })
        .then(response => {
          // JSON responses are automatically parsed.
          // this.posts = response.data
          // console.log('axios reply (response.data)=', response.data)
          // return callback(null, response.data.data[0])
          if (response.data.status === 'ok') {
            // Logged in.
            // console.log('Back from login:', response.data)
            const jwt = response.data.jwt
            const isFromCookie = false
            if (this.setCurrentUserFromJWT(jwt, isFromCookie)) {
              // Good JWT login
              this.setCookie(jwt, LOGIN_TIMEOUT_DAYS)
              resolve(this.user.id)
              return
            } else {
              // Bad JWT
              this.removeCookie()
              reject('Invalid credentials')
              return
            }
          } else if (response.data.status == 'require-otp') {
            // Not an error - we need to prompt for a One Time Password and repeat the call.
            console.log('Require OTP')
            const isFromCookie = false
            this.setCurrentUserFromJWT(null, isFromCookie)
            this.removeCookie()
            resolve('require-otp')
            return
          } else {
            // We did not sucessfully login
            // -> No current user
            const isFromCookie = false
            this.setCurrentUserFromJWT(null, isFromCookie)
            this.removeCookie()
            reject(response.data.message)
            return
          }
        })
        .catch(e => {
          // We did not sucessfully login
          // => No current user
          const isFromCache = false
          this.setCurrentUserFromJWT(null, isFromCache)
          this.removeCookie()
          if (!e.response) {
            // Network error from browser
            // See https://github.com/axios/axios/issues/383#issuecomment-234079506
            console.log(`e=`, e);
            console.log(`e.response:`, e.response);
            console.log(`e.status:`, e.status);
            reject(NETWORK_ERROR_MSG)
            return
          } else if (e.response.status === 401) {
            console.log(`Unauthorized (401)`)
            reject(e.response.data.message)
            return
          } else {
            console.log(`e:`, e);
            console.log(`e.response:`, e.response);
            console.log(`e.data:`, e.data);
            reject(e.response.data.message)
            return
          }
        })
    })// promise
  }// - login()

  /*
   *  Kick off the OAuth2 login process.
   */
  initiateOAuth(me, authority, options/*optional*/) {
    console.log(`initiateOAuth(me, ${authority})`)
    console.log(`options=`, options)

    // Where to go if the login succeeds?
    let resumeURL
    if (this.loginResume) {
      // Use the specified resume URL (which is a relative path)
      resumeURL = this.URLOnThisWebsite(this.loginResume)
    } else {
      // The 'resume' URL has not been provided, so we'll come back to this
      // exact same URL, however with any JWT or error parameters removed.
      const l = window.location
      console.log('resume to current page after oauth login', l)
      const parsed = QueryString.parse(l.search)
      delete parsed['LOGINSERVICE_JWT']
      delete parsed['AUTHSERVICE_JWT']
      delete parsed['AUTHSERVICE_ERROR']
      const params = QueryString.stringify(parsed)
      // console.log(parsed)

      // Contruct the URL, with the adjusted parameters
      resumeURL = l.protocol + "//" + l.host + l.pathname
      if (params) {
        resumeURL += '?' + params
      }
      resumeURL += l.hash
      console.log('\n\nresumeURL=', resumeURL)
      // console.log(new Buffer(resumeURL).toString('base64'))
      console.log(btoa(resumeURL))
    }

    // Get the URL to a "bounce page". This is a page that sets the JWT
    // cookie from a URL parameter, and then redirects to the 'resume' page.
    // const resume64 = new Buffer(resumeURL).toString('base64')
    const resume64 = btoa(resumeURL)
    const params = QueryString.stringify({ next: resume64 })
    const hash = ''
    const bounceURL = this.URLOnThisWebsite(`/authservice-bounce?${params}#${hash}`)
    console.log('\n\nbounceURL=', bounceURL)
    const successURL = bounceURL

    // Where to go if the login fails?
    var failURL
    if (this.loginFail) {
      // Use the specified error URL (which is a relative path)
      failURL = this.loginFail
    } else {
      failURL = bounceURL
    }
    console.log('successURL=' + successURL)
    console.log('successURL=' + encodeURIComponent(successURL))
    console.log('failURL=' + failURL)
    console.log('failURL=' + encodeURIComponent(failURL))

    //let url = `${this.protocol}://${this.host}:${this.port}/${this.version}/oauth2/initiate/${this.apikey}/${authority}`
    let url = `${this.protocol}://${this.host}:${this.port}/${this.urlPrefix}v2/oauth2/initiate/${this.apikey}/${authority}`
    url += '?success=' + encodeURIComponent(successURL)
    url += '&fail=' + encodeURIComponent(failURL)
    console.log(`url is ${url}`)
    if (options && options.debug) {
      //alert('Initiate URL:' + url)
    }
    window.location = url
  }// initiateOAuth2

  /*
   *  Log out
   */
  logout() {
    return new Promise((resolve, reject) => {
      // VVVVV Call the server
      var isFromCache = false
      this.setCurrentUserFromJWT(null, isFromCache)
      this.removeCookie()
      resolve(0)
      return
    })// new Promise
  }

  register(options) {
    console.log('$authservice.register()', options);

    return new Promise((resolve, reject) => {
      console.log('Inside the promise:', reject)

      if (!this.registrationSupported) {
        const error = 'Registration is not available.'
        reject(error)
        return
      }
      // let email = options.email
      // let username = options.username
      // let password = options.password
      // let firstName = options.firstName
      // let middleName = options.middleName
      // let lastName = options.lastName
      // let resume = options.resume

      // Check email and password is valid
      switch (typeof (options.email)) {
        case 'string':
          if (options.email.indexOf('@') < 1) {
            return reject('Please enter a valid email address')
          }
          break
        case 'undefined':
          return reject('options.email must be provided')
        default:
          return reject('options.email must be a string')
      }

      // Prepare the parameters to the API call
      var params = {
        email: options.email,
        resume: this.registerResume,
        expired: this.registerExpired
      }

      // Maybe check username is valid
      console.log('username is ' + options.username)
      switch (typeof (options.username)) {
        case 'string': {
          const username = options.username.trim().toLowerCase()
          if (username.indexOf(' ') >= 0) {
            reject('Username may not contain spaces')
            return
          }
          if (username.indexOf('@') >= 0) {
            reject('Username may not contain @')
            return
          }
          params.username = username
          break
        }
        case 'undefined': {
          // alert('using email for username')
          params.username = params.email
          break
        }
        default:
          return reject('If provided, options.username must be a string')
      }
      // if (me.registerRequiresUsername) {
      //   username = username.trim().toLowerCase()
      //   if (username.indexOf(' ') >= 0) {
      //     return failCallback('Username may not contain spaces')
      //   } else if (username.indexOf('@') >= 0) {
      //     return failCallback('Username may not contain @')
      //   }
      //   params.username = username
      // } else {
      //   params.username = email
      // }

      // Maybe check password is valid
      switch (typeof (options.password)) {
        case 'string':
          if (options.password.length < 5) {
            return reject('Please enter a longer password')
          }
          params.password = options.password
          break
        case 'undefined':
          break
        default:
          return reject('If provided, options.password must be a string')
      }

      // Maybe check first name is valid
      switch (typeof (options.firstName)) {
        case 'string':
          if (options.firstName.length < 1) {
            return reject('Please enter a first name')
          }
          params.firstName = options.firstName
          break
        case 'undefined':
          break
        default:
          return reject('If provided, options.firstName must be a string')
      }

      // Maybe check middle name is valid
      switch (typeof (options.middleName)) {
        case 'string':
          if (options.middleName.length < 1) {
            return reject('Please enter a middle name')
          }
          params.middleName = options.middleName
          break
        case 'undefined':
          break
        default:
          return reject('If provided, options.middleName must be a string')
      }

      // Maybe check last name is valid
      switch (typeof (options.lastName)) {
        case 'string':
          if (options.lastName.length < 1) {
            return reject('Please enter a last name')
          }
          params.lastName = options.lastName
          break
        case 'undefined':
          break
        default:
          return reject('If provided, options.lastName must be a string')
      }

      // Call the server
      console.log('params=', params)
      axios({
        method: 'put',
        url: this.endpoint() + '/email/register',
        headers: {
          // 'Authorization': 'Bearer ' + jwt
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: params
      })
        .then(response => {
          // JSON responses are automatically parsed.
          console.log('response is ', response)

          if (response.data && response.data.status === 'ok') {
            // If we have a new JWT, re-set the current user
            if (response.jwt) {
              var jwt = response.jwt
              var isFromCookie = false
              if (this.setCurrentUserFromJWT(jwt, isFromCookie)) {
                // Good registration
                this.setCookie(jwt, LOGIN_TIMEOUT_DAYS)
              } else {
                // All okay, but no auto-login in from registration
                this.removeCookie()
              }
            }
            resolve(jwt)
            return
          } else {
            // Display an error message
            const error = (response.data && response.data.message) ? response.data.message : 'Error while registering'
            reject(error)
            return
          }
        })
        .catch(e => {
          if (!e.response) {
            // Network error from browser
            // See https://github.com/axios/axios/issues/383#issuecomment-234079506
            reject(NETWORK_ERROR_MSG)
            return
          } else {
            // Error registering
            const error = (e.response.data && e.response.data.Error) ? e.response.data.Error : 'Error while registering'
            reject(error)
            return
          }

        })
    })// new Promise
  }// register()

  forgot(email, options) {
    return new Promise((resolve, reject) => {
      if (!this.forgottenPasswordSupported) {
        const error = 'Password retrieval is not available.'
        reject(error)
        return
      }
      // Check email and password is valid
      if (email === null || email.indexOf('@') < 1) {
        const error = 'Please enter a valid email address'
        reject(error)
        return
      }

      // Get the URL to a "bounce page". This is a page that sets the JWT
      // cookie from a URL parameter, and then redirects to the 'resume' page.
      // const resume64 = new Buffer(this.forgotResume).toString('base64')
      // const expired64 = new Buffer(this.forgotExpired).toString('base64')
      const resume64 = btoa(this.forgotResume)
      const expired64 = btoa(this.forgotExpired)
      const params = QueryString.stringify({ next: resume64, expired: expired64 })
      const bounceURL = this.URLOnThisWebsite(`/authservice-bounce?${params}`)
      // console.log(`this.forgotResume=${this.forgotResume}`)
      // console.log('bounceURL=', bounceURL)

      // Call the server
      //console.log('params=', params)
      axios({
        method: 'post',
        url: this.endpoint() + '/email/forgot',
        headers: {
          // 'Authorization': 'Bearer ' + jwt
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          email: email,
          resume: bounceURL
        }
      })
        .then(response => {
          // JSON responses are automatically parsed.
          if (response.data.status === 'ok') {
            // Email sent successfully
            resolve(response.data)
            return
          } else {
            // Error sending the email
            const error = (response.data && response.data.message) ? response.data.message : 'Error while sending email'
            reject(error)
            return
          }
        })
        .catch(e => {
          if (!e.response) {
            // Network error from browser
            // See https://github.com/axios/axios/issues/383#issuecomment-234079506
            reject(NETWORK_ERROR_MSG)
            return
          } else {
            // Error sending the email
            const error = (e.response.data && e.response.data.message) ? e.response.data.message : 'Error while sending email'
            reject(error)
            return
          }
        })
    })
  }// - forgot()

  //
  //  Get a URL parameter.
  //
  getURLParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search)
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '))
  }

  // Set the current user from a JWT.
  // Does not change cookies.
  // Returns true on success.
  setCurrentUserFromJWT(jwt, fromCookie) {
    // console.log()
    // console.log('++++++++>  setCurrentUserFromJWT(): jwt=' + jwt)

    let haveUser = false
    let ident = null
    let notBefore = 0 // nbf
    let issuedAt = 0 // iat
    let expiryTime = 0 // exp
    if (jwt) {
      // See https://github.com/auth0/jwt-decode
      try {
        let decoded = jwtDecode(jwt)
        // console.log('Decoded JWT:')
        // console.log(decoded)
        ident = decoded.identity
        console.log(ident)
        if (typeof (decoded.nbf) !== 'undefined') {
          notBefore = decoded.nbf * 1000 // Convert from Unix to Javascript time (s->ms)
          // console.log(`Have not-before time: ${new Date(notBefore)}`);
        }
        if (typeof (decoded.iat) !== 'undefined') {
          issuedAt = decoded.iat * 1000 // Convert from Unix to Javascript time (s->ms)
          // console.log(`Have issuedAt time: ${new Date(issuedAt)}`);
        }
        if (typeof (decoded.exp) !== 'undefined') {
          expiryTime = decoded.exp * 1000 // Convert from Unix to Javascript time (s->ms)
          // console.log(`Have expiry time: ${new Date(expiryTime)}`);
        }
        haveUser = true

        // Check the token has not expired
        if (expiryTime) {
          // const LENIENCY = 2 * 60 * 1000 // Two minutes in ms, to allow for badly set clock.
          let nowMs = new Date().getTime()
          // let expiresMs = expiryTime + LENIENCY
          let remaining = expiryTime - nowMs
          // console.log(`Token expires in ${remaining} ms`);
          if (remaining < 0) {
            // console.log(`Token has expired`);
            haveUser = false
          }
        }
      } catch (e) {
        console.log('Error decoding JWT: ', e)
        // alert('Error decoding invalid JWT')
        haveUser = false
      }
    }

    // Change the current user.
    // let oldCurrentUser = user
    if (haveUser) {
      // console.log(`USER from ident:`, ident);
      const user = {
        tenant: ident.tenant,
        id: ident.id,
        authority: ident.authority,
        entityType: ident.entity_type,
        // externalID
        email: ident.email,
        emailStatus: ident.email_status,
        username: ident.username,
        // hashedPassword
        // passwordDate
        // pastPassword1
        // pastPassword2
        // pastPassword3
        totpEnabled: ident.totp_enabled,
        // totpHash
        otpSMS: ident.otp_sms,
        status: ident.status,
        firstname: ident.first_name,
        middlename: ident.middle_name,
        lastname: ident.last_name,
        fullname: ident.full_name,
        gender: ident.gender,
        languages: ident.languages,
        mediaPage: ident.media_page,
        avatar: ident.avatar,
        jobTitle: ident.job_title,
        companyName: ident.company_name,
        mobilePhone: ident.mobile_phone,
        workPhone: ident.work_phone,
        customData: ident.custom_data,
        locale: ident.locale,
        location: ident.location,
        isAdmin: ident.is_admin,
        privileges: ident.privileges,
        timezone: ident.timezone,
        rights: [],
        // type: ident.type,
        appdata: ident.appdata
      }
      if (ident.rights) {
        ident.rights.forEach(r => {
          const right = {
            realm: r.realm,
            name: r.name,
            sequence: r.sequence,
            value: r.value
          }
          user.rights.push(right)
        })
      } else {
        // console.error(`JWT does not contain field {rights}.`)
      }

      // console.log('Setting user to ', user)
      this.user = user
      this.jwt = jwt
      this.fromCache = fromCookie
      this.issuedAt = issuedAt
      this.notBefore = notBefore
      this.expiryTime = expiryTime
      return true
    } else {
      // No longer logged in
      this.user = null
      this.jwt = null
      this.fromCache = false
      this.issuedAt = 0
      this.notBefore = 0
      this.expiryTime = 0
      return false
    }
  }// setCurrentUserFromJWT

  // See if a username is available
  usernameAvailability(username) {
    // console.log('usernameAvailability()', username)
    return new Promise((resolve, reject) => {
      // Check the length of the username
      username = username.trim().toLowerCase()
      if (username.length < 3) {
        reject('Username must be 3 or more characters')
        return
      }

      // Ask the server if the username is in use
      var url = this.endpoint() + '/username-availability/' + encodeURIComponent(username)
      // console.log('url=', url)
      axios({
        method: 'get',
        url: url,
        headers: {
          // 'Authorization': 'Bearer ' + jwt
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .then(response => {
          // JSON responses are automatically parsed.
          if (response.data.status === 'available') {
            // Name is available
            resolve(null)
            return
          } else {
            // Name not available
            resolve(response.data.error)
            return
          }
        })
        .catch(e => {
          if (!e.response) {
            // Network error from browser
            // See https://github.com/axios/axios/issues/383#issuecomment-234079506
            reject(NETWORK_ERROR_MSG)
            return
          } else {
            // alert('Communications error: unable to determine if this username is available')
            const error = e.response.data.Error ? e.response.data.Error : 'Could not check availability'
            reject(error)
            return
          }
        })
    })// new Promise
  }

  // See if an email address is already used
  emailAvailability(email) {
    console.log('emailAvailability()', email)
    return new Promise((resolve, reject) => {
      // Check the length of the username
      //username = username.trim().toLowerCase()
      // if (username.length < 3) {
      //   reject('Username must be 3 or more characters')
      //   return
      // }

      // Ask the server if the username is in use
      var url = this.endpoint() + '/email-availability/' + encodeURIComponent(email)
      // console.log('url=', url)
      axios({
        method: 'get',
        url: url,
        headers: {
          // 'Authorization': 'Bearer ' + jwt
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
        .then(response => {
          // JSON responses are automatically parsed.
          if (response.data.status === 'available') {
            // Name is available
            resolve(null)
            return
          } else {
            // Name not available
            resolve(response.data.error)
            return
          }
        })
        .catch(e => {
          if (!e.response) {
            // Network error from browser
            // See https://github.com/axios/axios/issues/383#issuecomment-234079506
            reject(NETWORK_ERROR_MSG)
            return
          } else {
            // alert('Communications error: unable to determine if this username is available')
            const error = e.response.data.Error ? e.response.data.Error : 'Could not check availability'
            reject(error)
            return
          }
        })
    })// new Promise
  }

  cookieName() {
    // const len = this.apikey.length
    // const shortApikey = this.apikey.substring(len - 10)
    // return `_loginservice${shortApikey}`
    return `_loginservice${this.apikey}`
  }

  /*
   *  Cookie handling
   *  See https://www.w3schools.com/js/js_cookies.asp
   */
  setCookie(cvalue, exdays) {
    // console.log('setCookie(' + cvalue + ')')
    const cname = this.cookieName()
    // if (cvalue) {
    //   console.log('setting cookie (' + cname + ')')
    // } else {
    //   console.log('clearing cookie (' + cname + ')')
    // }
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    const expires = 'expires=' + d.toUTCString()
    const secure = 'samesite=strict'
    const value = `${cname}=${cvalue};${expires};path=/;${secure};`
    document.cookie = value
  }// setCookie()

  getCookie() {
    const cname = this.cookieName()
    // console.log('getCookie(' + cname + ')')
    var name = cname + "="
    var ca = document.cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        // console.log('- found cookie')
        return c.substring(name.length, c.length)
      }
    }
    // console.log('- no cookie with this name')
    return ""
  }// getCookie()

  removeCookie() {
    // const cname = this.cookieName()
    // console.log('removeCookie(' + cname + ')')
    this.setCookie(null, 0)
  }// removeCookie()

  isEmailSupported() {
    return this.emailSupported
  }

  isRegistrationSupported() {
    return this.registrationSupported
  }

  isForgottenPasswordSupported() {
    return this.forgottenPasswordSupported
  }

  URLOnThisWebsite(relativeURL) {
    //console.error(`URLOnThisWebsite(${relativeURL})`)
    //console.log(`Relative: ${relativeURL}`)

    // Work out the URI part of the current page
    const l = window.location
    let baseURL = `${l.protocol}//${l.hostname}`
    if (l.port) {
      if (l.protocol === 'http:' && l.port === 80) {
        // default port
      } else if (l.protocol === 'https:' && l.port === 443) {
        // default port
      } else {
        baseURL += `:${l.port}`
      }
    }
    //console.log('\n\nbaseURL=', baseURL)

    // Perhaps a full URL has been provided already
    if (relativeURL.startsWith('http')) {

      // Check it's on this website
      if (relativeURL.startsWith(baseURL)) {
        return relativeURL
      }
      console.log(`URL ${relativeURL} is not on current website ${baseURL}`)
      return null
    }

    // Add on the path
    if (!relativeURL.startsWith('/')) {
      baseURL += '/'
    }
    const absoluteURL = baseURL + relativeURL
    //console.log(`Absolute: ${absoluteURL}`)
    return absoluteURL
  }
}

//LoginService.install = install // The imported install()
LoginService.version = '__VERSION__'
//if (inBrowser && window.Vue) {
//  console.log('(LoginService.js) 4')
//  window.Vue.use(LoginService)
//}

export default LoginService
