# loginservice-bounce

## Props

| Prop name | Description                                                                                                                                                                                                                                                                                                                            | Type    | Values | Default |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ------- |
| debug     | Turn this on to debug the bounce page activity.<br>When turned on, the bounce page will display the URL it intends to<br>redirect to, and wait ten seconds before performing the redirect.<br><br>While debugging, it is also possible to turn debugging on at runtime<br>by adding "&bounce=true" to the URL calling the bounce page. | boolean | -      | false   |

---

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
