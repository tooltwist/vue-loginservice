# loginservice-login

> This component provides a login menu on the navbar of a page.

Author: Philip Callender

## Props

| Prop name    | Description                                | Type    | Values                        | Default |
| ------------ | ------------------------------------------ | ------- | ----------------------------- | ------- |
| signin       | Say "sign in" rather than "log in"         | boolean | -                             | false   |
| forgotResume | <br/>`@ignore` true                        | string  | -                             |         |
| initialMode  | Display this component in a specific mode. | string  | `login`, `register`, `forgot` |         |

## Events

| Event name | Properties                                                     | Description                                                      |
| ---------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| userchange | **userId** `string` - New userID, or 0 if no longer logged in. | Triggered current user has been changed, due to login or logout. |

---

Handle login, registration, and forgotten password functionality.

The behaviour of this component is dictated by the application configuration
provided when you initialise this package, and also by your settings in the
Tooltwist dashboard at tooltwist.com.

### Example

```jsx
<loginservice-login />
```
