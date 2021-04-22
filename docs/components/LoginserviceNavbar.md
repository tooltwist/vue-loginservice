# loginservice-navbar

> This component provides a login menu on the navbar of a page.

Author: Philip Callender

## Props

| Prop name         | Description                                   | Type    | Values | Default |
| ----------------- | --------------------------------------------- | ------- | ------ | ------- |
| loginWithUsername | Allow login with username (rather than email) | boolean | -      | false   |
| signin            | Say "sign in" rather than "log in"            | boolean | -      | false   |
| hideRegister      |                                               | boolean | -      | false   |
| hideForgot        |                                               | boolean | -      | false   |
| hideAvatar        |                                               | boolean | -      | false   |
| hideLogout        |                                               | boolean | -      | false   |
| registerFields    |                                               | string  | -      |         |
| registerResume    |                                               | string  | -      |         |
| forgotResume      |                                               | string  | -      |         |
| nocomma           |                                               | string  | -      |         |

## Events

| Event name | Properties | Description |
| ---------- | ---------- | ----------- |
| userchange |            |

---

```vue live
<loginservice-navbar />
```
