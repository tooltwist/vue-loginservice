<template lang="pug">
.authservice-change-password

  // Modal for password change
  button.button.is-small(@click="togglePasswordModal", :class="{ 'is-disabled': !mayChangePassword }")
    | Change password&nbsp;

  .modal(:class="{ 'is-active': showPasswordModal }").has-text-left
    .modal-background
    .modal-card
      header.modal-card-head
        p.modal-card-title
          | Change password for user &nbsp;
          b {{userLabel}}
        button.delete(aria-label="close" @click="togglePasswordModal")
      section.modal-card-body
        .notification.is-danger(v-if="warningMsg") {{warningMsg}}
        form
          .field(v-if="requireOldPassword")
            .label Existing password
            .control
              input.input.loginservice-testhook-changePassword-existing(type="password", placeholder="Existing password", v-model="oldPassword", autocomplete="off")
          .field
            .label New password
            .control
              input.input.loginservice-testhook-changePassword-new(type="password", placeholder="Please enter a password", v-model="newPassword", autocomplete="off")
          .field
            .label Confirm
            .control
              input.input.loginservice-testhook-changePassword-confirm(type="password", placeholder="Enter the same password again", v-model="newPasswordConfirm", autocomplete="off")
          .field
            .label.passwordError {{newPasswordError}}
      footer.modal-card-foot
        button.button.is-success.loginservice-testhook-changePassword-update-button(@click="updatePassword", :disabled="newPasswordError !== null") Update password
        button.button.loginservice-testhook-changePassword-cancel-button(@click="togglePasswordModal") Cancel

</template>

<script>
import axios from 'axios'
import axiosError from '../axiosError.js'

export default {
  name: 'authservice-change-password',
  props: {

    // The user to have the password updated
    user: Object,

    // An email token received from a 'forgotten password' email.
    // If this is provided, we will immediately display the modal.
    emailToken: {
      type: String,
      required: false
    },

    // In demo mode we can't actually do the update
    demo: {
      type: String | Boolean,
      default: null
    }
  },
  data () {
    return {

      // Is this modal displayed at the moment?
      modalIsActive: false,

      // Automatically open the modal if we have an email token,
      // but reset this once the user closes the modal.
      autoOpen: true,

      // Field values
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    }
  },
  computed: {

    // Are we in demo mode?
    isDemo: function () {
      return (
        (typeof(this.demo) == 'boolean' && this.demo)
        ||
        (typeof(this.demo) == 'string' && this.demo !== '')
      )
    },


    // Should the modal be displayed?
    showPasswordModal: function () {
      return (
        this.modalIsActive
        ||
        (this.autoOpen && this.emailToken != null)
      )
    },


    // Display a message before changing for superuser passwords.
    warningMsg: function () {
      if (this.user && this.user.tenant === 'genesis/a3') {
        if (
          this.user.username === 'genesis'
          || this.user.isAdmin
        ) {
          return `
            WARNING!!!
            Password retrieval is disabled for A3 administrators.
            If you lose the password, you will not be able to reset it
            via email.
          `;
        }
      }
      return null
    },

    // Name of user shown in the heading
    userLabel: function () {
      if (this.user) {
        if (this.user.username) {
          return this.user.username
        } else {
          return this.user.id
        }
      }
      return '?'
    },

    // Validate the password fields
    newPasswordError: function () {
      if (this.requireOldPassword && !this.oldPassword) {
        return 'Please enter your existing password'
      }
      if (!this.newPassword) {
        return 'Please enter your new password'
      }
      if (!this.newPassword || this.newPassword.length < 8) {
        return 'Passwords must be eight or more character'
      }
      // Other rules might be placed here
      //zzz
      if (!this.newPasswordConfirm) {
        return 'Need confirmation password'
      }
      if (this.newPassword !== this.newPasswordConfirm) {
        //console.log(`${this.newPassword} vs ${this.newPasswordConfirm}`)
        return 'Passwords do not match'
      }
      return null
    },

    // Is the currently logged in user allowed to change the password?
    mayChangePassword: function () {
      console.log(`* mayChangePassword`)
      return (this.isCurrentUser || this.haveOverridePermission) && !this.newPasswordError
    },

    // Is the user the currently logged in user?
    // (A user is allowed to change their own password)
    isCurrentUser: function () {
      console.log(`*** isCurrentUser()`)
      if (this.$authservice && this.$authservice.user && this.user) {
        //console.log(`${this.$authservice.user.tenant}/${this.$authservice.user.id} VERSUS ${this.user.tenant}/${this.user.id}`)
        if (
          this.$authservice.user.tenant === this.user.tenant
          &&
          this.$authservice.user.id === this.user.id
        ) {
          console.log(`- Is current user`)
          return true
        } else {
          console.log(`- Not current user`)
        }
      }
      return false
    },

    // Return true if the currently logged in user can override the password.
    // These rules only effect the UI. The real check is on
    // the server in ApplicationAccess.go
    haveOverridePermission: function () {
      console.log(`*** haveOverridePermission()`)
      console.log(`${this.$authservice.user.tenant}:${this.$authservice.user.username}${this.$authservice.user.isAdmin ? '(admin)' : ''}`)

      if (this.$authservice && this.$authservice.user && this.user) {

        // Is the current user an A3 user?
        if (this.$authservice.user.tenant === 'genesis/a3') {

          //  1. Admins for genesis/a3 can update anything.
          if (this.$authservice.user.isAdmin) {
            console.log(`- A3 admin`)
            return true
          }

          //  2. A user has full access to users in their own applications.
          if (this.$authservice.user.username) {
            let tenantPrefix = `${this.user.username}/`
            if (this.user.tenant.startsWith(tenantPrefix)) {
              console.log(`- Owner of the application`)
              return true
            }
          }
        }

        //  3. The currently logged in user is admin for the same tenant as
        //  the user being updated.
        if (
          this.$authservice.user.tenant === this.user.tenant &&
          this.$authservice.user.isAdmin
        ) {
          console.log(`- Current application's admin`)
          return true
        }

        //  4. A user who is a member of an organisation has access to all
        //    the organisation's applications, and admin permissions according
        //    to their member record.

        //  5. A user granted access to an application has access according
        //     to the grant definition.
      }
      return false
    },

    // Return true if we need to ask the current password.
    //
    //  We won't need the old password if we have any of the following are true:
    //
    //    1.  An 'email_token' that was received from a forgot-password email.
    //    2.  Have 'Change password without entering old password' set in the
    //        configuration for this tenant/application.
    //    3.  We have override permission (i.e. an administrator)
    //
    requireOldPassword: function () {

      // 1. emailToken
      if (this.emailToken) {
        return false
      }

      // 2. Cannot check the 'Change password without entering old password' option at this time
      //ZZZ

      // 3. Administrator
      if (this.haveOverridePermission) {
        return false
      }

      // Seems we need the old password
      return true
    }
  },
  methods: {

    // Show or hide this modal
    togglePasswordModal (evt) {
      console.log('togglePasswordModal()')
      if (this.showPasswordModal) {
        this.modalIsActive = false
        this.autoOpen = false
      } else {
        this.modalIsActive = true
      }
    },

    // Do the actual update on the server
    updatePassword () {
      if (this.isDemo) {
        this.modalIsActive = false
        this.$toast.open({ message: `Password not updated (demo mode)`, type: 'is-info', duration: 4000 })
        return
      }

      // Update the password
      let url = `${this.$authservice.endpoint()}/user`
      let params = {
        method: 'post',
        url,
        headers: {
          'Authorization': 'Bearer ' + this.$authservice.jwt,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          tenant: this.user.tenant,
          id: this.user.id,
          password: this.newPassword,
        }
      }
      if (this.emailToken) {
        params.data.email_token = this.emailToken
      }
      if (this.requireOldPassword) {
        params.data.old_password = this.oldPassword
      }

      console.log(`params = `, params)

      axios(params)
        .then(response => {
          // JSON responses are automatically parsed.
          console.log('ok. response=', response)
          if (response.data && response.data.status === 'ok') {
            // All okay
            this.$toast.open({
              message: `Password updated`,
              type: 'is-success',
              duration: 4000
            })

            this.oldPassword = ''
            this.newPassword = ''
            this.newPasswordConfirm = ''
            this.modalIsActive = false
            this.autoOpen = false
          } else {
            // Not the expected result
            console.log('Unexpected result while updating password. response=', response)
            this.$toast.open({
              message: `Error: Password might not have been updated`,
              type: 'is-danger',
              duration: 4000
            })
          }
        })
        .catch(e => {
          console.log(`response is`, e.response)
          if (e.response.status === 404 && e.response.data && e.response.data.Error) {
            // Display the error message the server provided
            this.$toast.open({
              message: `The password could not be updated: "${e.response.data.Error}"`,
              type: 'is-danger',
              duration: 4000
            })
          } else {
            axiosError(this, url, params, e)
          }
        })
    },
  },
  created () {
    if (this.isDemo) {
      console.error('DEMO MODE: authservice-change-password')
      return
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.authservice-change-password {
  display: inline-block;

  $indent: 20px;
  $max-input-width: 520px;

  .label {
    margin-left: $indent;
  }
  .input {
    margin-left: $indent;
    max-width: $max-input-width;
  }

  .passwordError {
    color: red;
  }
}




</style>
