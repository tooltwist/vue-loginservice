# loginservice-user-details

## Props

| Prop name       | Description                                                                                                                                                                                  | Type    | Values | Default |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ------- |
| tenant          | Application to which the user belongs. For example 'freddy/myapp'.<br>In most cases this will be the same tenant as the currently logged in user<br>(`this.$loginservice.user.tenant`).      | string  | -      |         |
| userId          | The userID of the user to be displayed.                                                                                                                                                      | string  | -      |         |
| debug           | In **debug** mode the component will display a data dump of the currently<br>logged in user, and the user being displayed by this compnent.                                                  | boolean | -      | false   |
| demo            | In **demo** mode, the user can log in, but cannot change the password.<br>Use this when you provide a demonstration account and password that people<br>can use to try out your application. | boolean | -      | false   |
| showStatus      | Show the status values - account status, email status. and the 'isAdmin' setting.<br>If the current user is an administrator then these values can be updated.                               | boolean | -      | false   |
| showPermissions | <br/>`@ignore` true                                                                                                                                                                          | boolean | -      | false   |
| changePassword  | Allow the user's password to be changed.                                                                                                                                                     | boolean | -      | false   |

---

Display and update a user's details (i.e. their profile).

### Example

```vue
<loginservice-user-details
  v-if="$loginservice.user"
  tenant="$loginservice.user.tenant"
  userId="$loginservice.user.id"
  :changePassword="true"
  :showStatus="true"
/>
```
