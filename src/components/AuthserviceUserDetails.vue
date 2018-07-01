<template lang="pug">
.authservice-profile
  div(v-if="selectError")
    .notification.is-danger
      p Error: We were unable to select the user details.
      p This may mean that you do not have permission
        | , or it could be a network or server error.

  div(v-else)
    .columns
      .column.is-3.has-text-centered

        // Show icon for the OAuth2 Authority

        // Font-awesome v5
        //.authservice-logo(v-if="$authservice.options.defaultIconPack==='fas'")
        .authservice-logo(v-if="$authservice.icons('fas')")

          i.far.fa-envelope-open(v-if="user.authority === 'email'")
          i.fab.fa-facebook-square(v-else-if="user.authority === 'facebook'")
          i.fab.fa-github(v-else-if="user.authority === 'github'")
          i.fab.fa-google(v-else-if="user.authority === 'google'")
          i.fab.fa-linkedin(v-else-if="user.authority === 'linkedin'")
          i.fab.fa-twitter(v-else-if="user.authority === 'twitter'")

        .authservice-logo(v-else)

          // Font-awesome v4
          i.fa.fa-envelope-o(v-if="user.authority === 'email'")
          i.fa.fa-facebook-official(v-else-if="user.authority === 'facebook'")
          i.fa.fa-github(v-else-if="user.authority === 'github'")
          i.fa.fa-google(v-else-if="user.authority === 'google'")
          i.fa.fa-linkedin-square(v-else-if="user.authority === 'linkedin'")
          i.fa.fa-twitter(v-else-if="user.authority === 'twitter'")

        //span(v-show="isAdmin")
        //  br
        //  .tag.is-warning.is-small
        //    | Is Administrator

        //br
        //br
        h3.is-5 {{loginDescription}}
        span(v-show="user.is_admin")
          | [administrator]

        br
        br
        br
        br
        br
        br
        button.button.is-info(v-if="mayUpdateUser" v-on:click="onSubmit") Update
        div(v-if="mayChangePassword")
          br
          br
          authservice-change-password(v-if="mayChangePassword", :user="user", :demo="demo", :email-token="emailToken")


      .column.is-8

        // Note:  What is this autocomplete="foo" nonsense?
        // Chrome now gives an error message when you use autocomplete="off".
        // Autofill functionality allows all the fields in a form to be inserted
        // together (e.g. selecting an address to populate all the address fields),
        // and is defined by the WHATG Standard.
        // Chrome expects the autocomplete fields to comply with this standard,
        // however "off" is specifically not allowed so causes a console error message.
        // To disable autocomplete you now need to provide a name that is not part
        // of the WHATG Standard. We are choosing to use "foo"
        //
        // See https://html.spec.whatwg.org/multipage/forms.html#autofill
        form
          .field(v-if="user.authority === 'email'")
            .label Username
            .control
              | {{user.username}}
          .field
            .columns
              .column.is-6
                .label Tenant
                .control
                  input.input(type="text" placeholder="First name" v-model="user.tenant" autocomplete="foo" disabled)
              .column.is-6
                .label Email
                .control
                  input.input(type="text" placeholder="First name" v-model="user.email" autocomplete="foo" disabled)
          .field
            .label Name
            .columns
              .column.is-4
                .control
                  input.input(type="text" placeholder="First name" v-model="user.first_name" autocomplete="foo", :disabled="!mayUpdateName")
              .column.is-4
                .control
                  input.input(type="text" placeholder="Middle name" v-model="user.middle_name" autocomplete="foo", :disabled="!mayUpdateName")
              .column.is-4
                .control
                  input.input(type="text" placeholder="Last name" v-model="user.last_name" autocomplete="foo", :disabled="!mayUpdateName")
          .field
            .label Full Name
            .control
              input.input(type="text" placeholder="Fullname" v-model="user.full_name" autocomplete="foo", :disabled="!mayUpdateName")

          //- .field
          //-   .label Client Id
          //-   .control
          //-     input.input(type="text" placeholder="Text input" zv-model="app.a_facebook_client_id")
          div(v-if="showStatusFields")
            br
            hr
            br
            .has-text-centered
              h2.title.is-3 Account Status
            .notification.is-warning(v-if="mayUpdateStatus && editingOwnDetails")
              p WARNING!
                br
                | Updating these fields may remove your ability to log in or act as administrator.
            .columns
              .column.is-1
              .column.is-4
                .field
                  .label User Status
                  .control
                    .select
                      select.input(:disabled="!mayUpdateStatus" v-model="user.status")
                        option(value="active") Active
                        option(value="blacklisted") Blacklisted
                        option(value="closed") Closed
                        option(value="pending") Waiting for Verification
                        option(value="suspended") Suspended
              .column.is-4(v-if="user.authority === 'email'")
                .field
                  .label Email Address Status
                  .control
                    .select
                      select.input(:disabled="!mayUpdateStatus" v-model="user.email_status")
                        option(value="blacklisted") Blacklisted
                        option(value="disabled") Disabled
                        option(value="unverified") Unverified
                        option(value="verified") Verified
              .column.is-4
                .field
                  .label Is Administrator
                  .control
                    .select
                      select.input(:disabled="!mayUpdateStatus" v-model="user.is_admin")
                        option(:value="false") No
                        option(:value="true") Yes

                    //- .select
                    //-   select.input(:disabled="!mayUpdateStatus" v-model="user.isAdministrator")
                    //-     option(value="yes") Yes
                    //-     option(value="no") No


          //| {{$authservice.user.entityType}}
          //br
          //| Gender: {{$authservice.user.gender}}
          //br
          div(v-if="showSocialMediaFields")
            br
            br
            hr
            .has-text-centered
              h2.title.is-3 Social Media Login

            // Avatar
            figure.image.is-64x64.is-pulled-right
              img(:src="user.avatar")
            .field
              .label Media Page
              .control
                a(:href="user.media_page" target="_blank") {{user.media_page}}
            .field
              .label Languages
              .control
                input.input(type="text" v-model="user.languages" autocomplete="foo" disabled)
            .field
              .label Locale
              .control
                input.input(type="text" v-model="user.locale" autocomplete="foo" disabled)
            .field
              .label Location
              .control
                input.input(type="text" v-model="user.location" autocomplete="foo" disabled)
            .field
              .label Timezone
              .control
                input.input(type="text" v-model="user.timezone" autocomplete="foo" disabled)

          div(v-if="showPermissionFields")
            br
            br
            hr
            .has-text-centered
              h2.title.is-3 Permissions

            .field
              .label Rights
              .control
                | &nbsp;&nbsp;&nbsp; {{user.rights}}
            .field
              .label Privileges
              .control
                | &nbsp;&nbsp;&nbsp; {{user.privileges}}
        //- form




        //br
        //hr
        //.help
        //  | {{ user }}
        //  br
        //  br

        // Sneak in the userID
        br
        br
        br
        br
        .has-text-right.is-size-7
          | [ID={{ user.id }}]
    //- .columns
  //- !selectError
</template>

<script>
import axios from 'axios'
import axiosError from '../axiosError.js'
import AuthserviceChangePassword from './AuthserviceChangePassword'

export default {
  name: 'authservice-profile',
  components: {
    AuthserviceChangePassword
  },
  props: {
    // Key of user
    tenant: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },

    // Display options
    demo: {
      type: Boolean | String,
      default: false,
    },
    showStatus: {
      type: Boolean | String,
      default: false,
    },
    showPermissions: {
      type: Boolean | String,
      default: false,
    },
    changePassword: {
      type: Boolean | String,
      default: false,
    },
  },
  data () {
    return {
      user: { },

      selectError: false, // Error calling the API to get user details
    }
  },
  computed: {
    loginDescription: function () {
      if (this.user && this.user.authority) {
        if (this.user.authority === 'email') {
          // Regular login
          if (this.user.Username) {
            return `Username / Password`
          } else {
            return `Email / Password`
          }
        } else {
          // Social media login
          let part1 = this.user.authority.substring(0, 1).toUpperCase()
          let part2 = this.user.authority.substring(1)
          return `Login using ${part1}${part2}`
        }
      }
      return null
    },

    // Are we using 'username' to login?
    useUsername: function () {
      return false
    },

    // Can we change the name fields
    mayUpdateName: function () {
      return (
        (this.editingOwnDetails || this.haveAdminPrivileges)
        &&
        (this.user && this.user.authority === 'email')
      );
    },

    mayUpdateUser: function () {
      return (this.editingOwnDetails || this.haveAdminPrivileges)
    },

    mayUpdateStatus: function () {
      return this.haveAdminPrivileges
    },

    // Are we in demo mode?
    isDemo: function () {
      return (
        (typeof(this.demo) == 'boolean' && this.demo)
        ||
        (typeof(this.demo) == 'string' && this.demo !== '')
      )
    },

    // Show the status fields?
    showStatusFields: function () {
      console.log('this.showStatus', this.showStatus)
      console.log('this.showStatus', typeof(this.showStatus))
      return (
        (typeof(this.showStatus) == 'boolean' && this.showStatus)
        ||
        (typeof(this.showStatus) == 'string' && this.showStatus !== 'false')
      )
    },

    showSocialMediaFields: function () {
      return this.user && this.user.authority !== 'email'
    },

    // Show Permission fields
    showPermissionFields: function () {
      console.log('this.showPermissions', this.showPermissions)
      console.log('this.showPermissions', typeof(this.showPermissions))

      return (
        (typeof(this.showPermissions) == 'boolean' && this.showPermissions)
        ||
        (typeof(this.showPermissions) == 'string' && this.showPermissions !== 'false')
      )
    },

    // See if the current user is editing their own record
    editingOwnDetails: function () {
      if (
        this.$authservice.user.tenant === this.user.tenant
        &&
        this.$authservice.user.id === this.user.id
      ) {
        console.log(`- User updating themself`)
        return true
      }
      return false
    },

    // Return true if this user has some sort of admin privileges
    // for the user record being edited.
    // Note: these rules only effect the UI - the real check is on
    // the server in ApplicationAccess.go
    haveAdminPrivileges: function () {
      console.log(`haveAdminPrivileges()`)
      console.log(`$authservice.user=`, this.$authservice.user)
      console.log(`this.user=`, this.user)
      console.log(`$route.params.username=`, this.$route.params.username)
      console.log(`$route.params.appname=`, this.$route.params.appname)
      //return false

      // See if this is some sort of admin user
      if (this.$authservice.user.tenant === 'genesis/a3') {
        //  1. An genesis/a3 admin user may access anything.
        if (this.$authservice.user.isAdmin) {
          console.log(`- A3 admin`)
          return true
        }
        //  2. A user has full access to users in their own applications.
        if (this.$route.params.username === this.$authservice.user.username) {
          console.log(`- Owner of the application`)
          return true
        }
      }

      //  3. An admin user has full access to users in the application
      //    they are logged into.
      if (
        this.$authservice.user.isAdmin &&
        this.$authservice.user.tenant === `${this.$route.params.username}/${this.$route.params.appname}`
      ) {
        console.log(`- Current application's admin`)
        return true
      }

      //  4. A user who is a member of an organisation has access to all
      //    the organisations application, and admin permissions according
      //    to their member record.
      //  5. A user granted access to an application has access according
      //     to the grant definition.
      return false
    },

    // Can we change the user's password?
    mayChangePassword: function () {
      console.log('this.changePassword', this.changePassword)
      console.log('this.changePassword', typeof(this.changePassword))

      // Do we even want to change password?
      if (
        (typeof(this.changePassword) == 'boolean' && !this.changePassword)
        ||
        (typeof(this.changePassword) == 'string' && this.changePassword === 'false')
      ) {
        return false
      }

      // Are we allowed to change the password?
      if (this.user && this.user.authority === 'email') {
        return (this.editingOwnDetails || this.haveAdminPrivileges)
      }
      return false
    },

    emailToken: function () {

      if (this.editingOwnDetails) {
        // If we came into the page with a AUTHSERVICE_EMAIL_TOKEN parameter in
        // the URL, then jump straight into the change password screen.
        let token = this.$route.query['AUTHSERVICE_EMAIL_TOKEN']
        return token
      }
      return null
    }
  },
  methods: {

    // Load details of the specified user from the server.
    loadUserDetails () {
      console.log( `AuthserviceUserDetails.loadUserDetails()`)
      const url = `${this.$authservice.endpoint()}/${this.tenant}/user/${this.userId}`
      console.log(`url is ${url}`)
      let params = {
        method: 'get',
        url,
        headers: {
          'Authorization': 'Bearer ' + this.$authservice.jwt,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      axios(params)
        .then(response => {
          // JSON responses are automatically parsed.
          if (response && response.data && response.data.length > 0) {
            console.log(`RESPONSE IS`, response.data)
            this.user = response.data[0]
          } else {
            console.error(`User ${this.tenant}/${this.userId} not found`)
            this.selectError = true
          }
        })
        .catch(e => {
          axiosError(this, url, params, e)
          this.selectError = true
        })
    },
    onSubmit (evt) {
      if (this.isDemo) {
        this.modalIsActive = false
        this.$toast.open({ message: `Password not updated (demo mode)`, type: 'is-info', duration: 4000 })
        return
      }

      // Save our copy of the application, and reclone it again.
      evt.preventDefault()

      let data = {
        tenant: this.tenant,
        id: this.userId,
      }
      if (this.mayUpdateName) {
        data.first_name = this.user.first_name
        data.middle_name = this.user.middle_name
        data.last_name = this.user.last_name
        data.full_name = this.user.full_name
      }
      if (this.mayUpdateStatus) {
        data.status = this.user.status
        data.email_status = this.user.email_status
        data.is_admin = this.user.is_admin
      }

      // Save the user record
      console.log('Saving:', this.user)
      // console.log(`email status is ${this.user.email_status}`)
      let url = `${this.$authservice.endpoint()}/user`
      let params = {
        method: 'post',
        url,
        headers: {
          'Authorization': 'Bearer ' + this.$authservice.jwt,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: data
      }
      axios(params)
        .then(response => {
          // JSON responses are automatically parsed.
          console.log('ok. response=', response)
          if (response.data && response.data.status === 'ok') {
            // All okay
            this.$toast.open({ message: `Changes saved`, type: 'is-success', duration: 4000 })
            this.loadUserDetails()
          } else {
            // Not the expected result
            console.log('Unexpected result while updating user record. response=', response)
            this.$toast.open({ message: `Error: User details might not have been updated`, type: 'is-danger' })
          }
        })
        .catch(e => {
          console.log('error. e=', e)
          axiosError(this, url, params, e)
        })
    }
  },
  created () {
    this.loadUserDetails()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.authservice-profile {
  .authservice-logo {
    margin-top: 5px;
    margin-bottom: 25px;
    font-size: 112px;
    line-height: 112px;
    &.a3-faded i.fa {
      color: #d0d0d0;
    }
  }
}
</style>
