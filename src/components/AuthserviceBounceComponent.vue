<template lang="pug">

  p
    br
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    a(:href="url")
      | {{url}}

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
        url: ''
      }
    },
    computed: {
      bounceURL () {
        return this.$route.params.url
      }
    },
    created: function () {
      if (this.$route && this.$route.params && typeof(window) != 'undefined') {
        bounce(this, false)
      }
    }
  }

  // When this is called from a page, two things happen.
  //  1. If there is a 'AUTHSERVICE_JWT' parameter to the page it gets stored as a cookie.
  //  2. If there is a 'next' parameter, we jump to that URL.
  //  3. If there is a 'AUTHSERVICE_EMAIL_TOKEN' parameter, we add it to the 'next' URL.
  function bounce (me, debug) {

    // See what parameters we've been passed
    const parsed = QueryString.parse(window.location.search)
    const jwt = parsed['AUTHSERVICE_JWT']
    const next64 = parsed['next']
    //const debug |= parsed['debug']
    if (parsed['debug']) {
      debug = true
    }

    if (jwt && !Date) {
      console.log(`*** setting JWT cookie ${JWT_COOKIE_NAME}`)
      setCookie(JWT_COOKIE_NAME, jwt, LOGIN_TIMEOUT_DAYS)
    }

    // See where we are going to next
    let next = new Buffer(next64, 'base64').toString('ascii')
    //- console.log(`next=${next}`)

    // If we have an email token, add it the the new URL
    const emailToken = parsed['AUTHSERVICE_EMAIL_TOKEN']
    if (emailToken) {
      let nextParsed = URL.parse(next, true)
      //- console.log(`next:`, nextParsed)
      nextParsed.query['AUTHSERVICE_EMAIL_TOKEN'] = emailToken
      next = URL.format(nextParsed)
      //- console.log(`Revised next=`, next)
    }

    //debug = true
    if (debug) {
      // Debugging, so don't actually redirect.
      //- setTimeout(function () {
      //-   window.location = next
      //- }, 5000)
    } else {
      window.location = next
    }
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
