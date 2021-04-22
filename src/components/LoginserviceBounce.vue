<template lang="pug">
.login-bounce-component
  p(style="display:none")
    br
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    a(:href="url")
      | {{url}}
      br
    div(v-show="errorMsg !== ''")
      | {{errorMsg}}
</template>

<script>
  import QueryString from 'query-string'
  import URL from 'url'

  const JWT_COOKIE_NAME = 'authservice-jwt'
  const LOGIN_TIMEOUT_DAYS = 3

  export default {
    name: 'loginservice-bounce',
    props: {
      /**
       * Turn this on to debug the bounce page activity.
       * When turned on, the bounce page will display the URL it intends to
       * redirect to, and wait ten seconds before performing the redirect.
       *
       * While debugging, it is also possible to turn debugging on at runtime
       * by adding "&bounce=true" to the URL calling the bounce page.
       */
      debug: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        url: '',
        errorMsg: ''
      }
    },
    computed: {
      bounceURL () {
        if (this.debug) {
          console.log(`loginservice-bounce:bounceURL() - url is `, this.$route.params.url)
        }
        return this.$route.params.url
      }
    },
    created: function () {
      if (this.$route) {
        // Only defined if vue-router is in use (e.g. in Nuxt).
        console.log(`this.$route.query=`, this.$route.query)
        console.log(`this.$route.params=`, this.$route.params)
      }
      if (window && window.location) {
        console.log(`window.location=`, window.location)
        console.log(`window.location.search=`, window.location.search)
      }
      bounce(this, false)
    }
  }

  // When this is called from a page, two things happen.
  //  1. If there is a 'AUTHSERVICE_JWT' parameter to the page it gets stored as a cookie.
  //  2. If there is a 'next' parameter, we jump to that URL.
  //  3. If there is a 'AUTHSERVICE_EMAIL_TOKEN' parameter, we add it to the 'next' URL.
  function bounce (me, debug) {
    let jwt
    let next64
    let emailToken

    const useRoute = true
    if (useRoute && me.$route && me.$route.query) {

      // Use the route's query
      console.log(`Getting params from this.$route.query`);
      jwt = me.$route.query.AUTHSERVICE_JWT
      next64 = me.$route.query.next
      if (me.$route.query.debug) {
        debug = true
      }
      emailToken = me.$route.query.AUTHSERVICE_EMAIL_TOKEN
    } else  if (window) {

      // Get query parameters from the window object
      console.log(`Getting params from window.location.search`);
      let query = window.location.search
      while (query.startsWith('?')) {
        query = query.substring(1)
      }
      const parsed = QueryString.parse(query)
      jwt = parsed['AUTHSERVICE_JWT']
      next64 = parsed['next']
      //const debug |= parsed['debug']
      if (parsed['debug']) {
        debug = true
      }
      emailToken = parsed['AUTHSERVICE_EMAIL_TOKEN']

    } else {
      console.log('Missing window object.')
      return;
    }
    console.log(`jwt=`, jwt);
    console.log(`next64=`, next64);
    console.log(`debug=`, debug);
    console.log(`emailToken=`, emailToken);

    // See what parameters we've been passed

    // Save the JWT (Javascript Web Token)
    if (jwt) {
      //if (jwt && !Date) {
      console.log(`*** setting JWT cookie ${JWT_COOKIE_NAME}`)
      setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS)
      //}

    } else {
      me.errorMsg = `Missing mandatory parameter (jwt)`
      console.log(me.errorMsg)
      return
    }

    // See where we are going to next
    let next
    if (next64) {
      next = new Buffer(next64, 'base64').toString('ascii')
      //- console.log(`next=${next}`)
    } else {
      me.errorMsg = `Missing mandatory parameter (next)`
      console.log(me.errorMsg)
      return
    }

    // If we have an email token, add it the the new URL
    if (emailToken) {
      let nextParsed = URL.parse(next, true)
      //- console.log(`next:`, nextParsed)
      nextParsed.query['AUTHSERVICE_EMAIL_TOKEN'] = emailToken
      next = URL.format(nextParsed)
      //- console.log(`Revised next=`, next)
    }

    //debug = true
    if (debug) {
      // Debugging, so don't redirect immediately.
      setTimeout(function () {
        window.location = next
      }, 10000)
    } else {
      window.location = next
    }
  }

  function setCookie (cname, cvalue, exdays) {
    // console.log('setCookie(' + cname + ', ' + cvalue + ')')
    console.log('setCookie(' + cname + ')')
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    const expires = 'expires=' + d.toUTCString()
    const secure = 'secure;samesite=strict'
    const value = `${cname}=${cvalue};${expires};path=/;${secure};`
    document.cookie = value
  }// setCookie()

</script>


<docs>
The bounce component is used to add a _Bounce Page_ to your application website.

### Why do I need a bounce page?
There are several situations in which the Loginservice server is called directly
from the user's browser, and needs to be able to pass control back to the application:

- After clicking on the email verification email sent during registration.
- After clicking on the email verification email sent for forgotten password.
- After logging in with a social media account (Facebook, twitter, etc)

In each of these cases, Loginserver's server uses a 302 redirect to pass control
back to the application, and will pass user credentials back to the browser in
the URL. Assuming this page - defined in the configuration as a _resumeURL_ - is
using vue-loginservice, the user is then logged in and the credentials get
stored in a cookie for subsequent pages to use.

This creates a problem however, because after the user has logged off and the cookie
removed, the browser history can be used to return to the resume page, and the user
may become logged in again.

To avoid this problem, a bounce page is used. With this approach, the Loginservice
server will redirect to the bounce page with the credentials in the URL, and the
bounce page will store the credentials in the cookie and redirect to the resumeURL
without the credentials in the URL. The bounce page will not show up in the browser history.

This normally occurs so quickly that the user has no idea it happened.

### Creating a bounce page
Create a page containing nothing but this component, and specify the page in the
loginservice configuration.

### Example

```xml vue
<template>
  <div>
    <loginservice-bounce/>
  </div>
</template>

<script>
export default {
  name: 'BouncePage',
}
</script>
```
</docs>
