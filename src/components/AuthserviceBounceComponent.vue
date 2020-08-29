<template lang="pug">

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
    name: 'authservice-bounce-component',
    props: ['debug'],
    data () {
      return {
        url: '',
        errorMsg: ''
      }
    },
    computed: {
      bounceURL () {
        if (this.debug) {
          console.log(`AuthserviceBounceComponent:bounceURL() - url is `, this.$route.params.url)
        }
        return this.$route.params.url
      }
    },
    created: function () {
      console.log('AuthserviceBounceComponent:created() YARP 000')
      console.log(`this.$route.query=`, this.$route.query)
      console.log(`this.$route.params=`, this.$route.params)
      if (window && window.location) {
        console.log(`window.location=`, window.location)
        console.log(`window.location.search=`, window.location.search)
      }
      // if (this.$route && this.$route.params && typeof(window) != 'undefined') {
      //   console.log('AuthserviceBounceComponent:created() YARP 001')
      //   bounce(this, false)
      // }
      bounce(this, false)
    }
  }

  // When this is called from a page, two things happen.
  //  1. If there is a 'AUTHSERVICE_JWT' parameter to the page it gets stored as a cookie.
  //  2. If there is a 'next' parameter, we jump to that URL.
  //  3. If there is a 'AUTHSERVICE_EMAIL_TOKEN' parameter, we add it to the 'next' URL.
  function bounce (me, debug) {

console.log('AuthserviceBounceComponent:bounce() YARP 1')
console.log(`window.location.search=`, window.location.search)

    let jwt
    let next64
    let emailToken

    const useRoute = true
    if (useRoute && me.$route.query) {

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
    console.log('AuthserviceBounceComponent:bounce() YARP 2')
    console.log(`jwt=`, jwt);
    console.log(`next64=`, next64);
    console.log(`debug=`, debug);
    console.log(`emailToken=`, emailToken);

    // See what parameters we've been passed
    console.log('AuthserviceBounceComponent:bounce() YARP 3')

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
    console.log('AuthserviceBounceComponent:bounce() YARP 4')

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
    console.log('AuthserviceBounceComponent:bounce() YARP 5')

    // If we have an email token, add it the the new URL
    if (emailToken) {
      let nextParsed = URL.parse(next, true)
      //- console.log(`next:`, nextParsed)
      nextParsed.query['AUTHSERVICE_EMAIL_TOKEN'] = emailToken
      next = URL.format(nextParsed)
      //- console.log(`Revised next=`, next)
    }
    console.log('AuthserviceBounceComponent:bounce() YARP 6')

    //debug = true
    if (debug) {
      // Debugging, so don't redirect immediately.
      setTimeout(function () {
        window.location = next
      }, 10000)
    } else {
      window.location = next
    }
    console.log('AuthserviceBounceComponent:bounce() YARP 7')
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
