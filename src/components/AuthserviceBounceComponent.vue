<template lang="pug">

  p
    br
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    a(:href="url")
      | {{url}}
  p(v-show="errorMsg !== ''")
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
      console.log('AuthserviceBounceComponent:created() YARP 00')
      if (this.$route && this.$route.params && typeof(window) != 'undefined') {
        console.log('AuthserviceBounceComponent:created() YARP 01')
        bounce(this, false)
      }
    }
  }

  // When this is called from a page, two things happen.
  //  1. If there is a 'AUTHSERVICE_JWT' parameter to the page it gets stored as a cookie.
  //  2. If there is a 'next' parameter, we jump to that URL.
  //  3. If there is a 'AUTHSERVICE_EMAIL_TOKEN' parameter, we add it to the 'next' URL.
  function bounce (me, debug) {

console.log('AuthserviceBounceComponent:bounce() YARP 1')
console.log(`window.location.search=`, window.location.search)
    // See what parameters we've been passed
    const parsed = QueryString.parse(window.location.search)
    console.log('AuthserviceBounceComponent:bounce() YARP 2')
    const jwt = parsed['AUTHSERVICE_JWT']
    const next64 = parsed['next']
    //const debug |= parsed['debug']
    if (parsed['debug']) {
      debug = true
    }
    console.log('AuthserviceBounceComponent:bounce() YARP 3')

    // Save the JWT (Javascript Web Token)
    if (jwt) {
      //if (jwt && !Date) {
      console.log(`*** setting JWT cookie ${JWT_COOKIE_NAME}`)
      setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS)
      //}

    } else {
      me.errorMsg = `Missing mandatory parameter (jwt)`
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
      return
    }
    console.log('AuthserviceBounceComponent:bounce() YARP 5')

    // If we have an email token, add it the the new URL
    const emailToken = parsed['AUTHSERVICE_EMAIL_TOKEN']
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
      // Debugging, so don't actually redirect.
      //- setTimeout(function () {
      //-   window.location = next
      //- }, 5000)
    } else {
      //ZZZZ window.location = next
    }
    console.log('AuthserviceBounceComponent:bounce() YARP 7')
  }

  function setCookie (cname, cvalue, exdays) {
    // console.log('setCookie(' + cname + ', ' + cvalue + ')')
    console.log('setCookie(' + cname + ')')
    var d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    var expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
  }// setCookie()

</script>
