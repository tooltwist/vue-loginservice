# loginservice-password

## Props

| Prop name  | Description                                                                                                                        | Type    | Values | Default |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ------- |
| user       | The user to have the password updated.<br>Typically `this.$loginservice.user`.                                                     | object  | -      |         |
| emailToken | An optional email token received from a 'forgotten password' email.<br>If this is provided, we will immediately display the modal. | string  | -      |         |
| demo       | In **demo** mode the user can't actually do the update.                                                                            | boolean | -      | false   |

---

This component provides a modal dialog for changing a user's password. It initially
appears as a 'Change Password' button, and the full dialog appears when the button
is pressed. This component is used in the `loginservice-user-details` component, and also can be
used elsewhere in an application.

For the password to be changed, the currently logged in user (`this.$loginservice.user`) must
be the user having the password changed, or else an administrator for the application.
Users must enter the existing password in order to change their password; admins only
need to enter the new password.

When the user forgets their password, we send them an email containing a link to reset
their password, that will ultimately end up at a page in the application. That link contains
an _email token_ that allows them to enter their new password without entering their old
password. If this component is located on that page and gets passed the email token, the
change password dialog will be displayed as soon as they get to the page.

### Example

```vue
<loginservice-password
  v-if="$loginservice.user"
  :user="$loginservice.user"
  :emailToken="emailToken"
/>
```

Getting the email token (with special handling for vue-router):

```javascript
data: function () {
  return {
    emailToken = null
  }
},
created: function () {
  console.log(`Password.vue: mounted()`)

  const useRoute = true
  if (useRoute && this.$route && this.$route.query) {

    // Use the route's query
    console.log(`Getting params from this.$route.query`);
    this.emailToken = this.$route.query.AUTHSERVICE_EMAIL_TOKEN
  } else if (window) {

    // Get query parameters from the window object
    console.log(`Getting params from window.location.search`);
    let query = window.location.search
    while (query.startsWith('?')) {
      query = query.substring(1)
    }
    const parsed = QueryString.parse(query)
    this.emailToken = parsed['AUTHSERVICE_EMAIL_TOKEN']
    console.log(`token is ${this.emailToken}`)

  }
}
```
