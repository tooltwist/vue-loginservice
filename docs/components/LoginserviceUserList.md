# loginservice-user-list

## Props

| Prop name      | Description                                                                                                                                                                                                                                                                                   | Type   | Values | Default          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ---------------- |
| tenant         | Tenant (application) of the users.                                                                                                                                                                                                                                                            | string | -      |                  |
| pathForDetails | Link to follow a user in the list is clicked.<br>May contain markers {TENANT} and {USERID} which get replace by the appropriate values for the selected user.                                                                                                                                 | string | -      | '/user/{USERID}' |
| data           | An optionally provided list of user records.<br> This is used in cases where you do not wish to show all users for the<br> application in the list.                                                                                                                                           | array  | -      |                  |
| columns        | A list of columns to be displayed for the user list. If you provide `data` with<br>extra fields added to the records, they may be included in your field list.<br>The defaults columns are 'icon', 'authority', 'first_name', 'last_name', 'username',<br>'email', 'id', 'isAdmin', 'status'. | array  | -      |                  |

---

This component displays a list of users for an application.

Normally you just provide your application ID in the _tenant_ parameter (e.g. freddy/myapp)
and all the users for your application will be displayed. Alternatively you can select the user records yourself using the Loginservice API
and provide the user list using the _data_ prop.

### Permissions

If the `data` prop is not provided, the component will call the server API to select
all the users in the application. In order to select the user records you must be
logged in as either:

1. An admin user of the application where your are showing the user records, or
2. The owner of the application (e.g. as the tooltwist user _freddy_).

### Examples

```jsx
<p>NOT YET</p>
<loginservice-user-list tenant="fred/myapp"/>
```
