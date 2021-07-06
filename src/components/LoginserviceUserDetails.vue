<template lang="pug">
.loginservice-user-details.loginservice-profile

  .is-not-loaded(v-if="selectError")
    .notification.is-danger
      p Error: We were unable to select the user details.
      p This may mean that you do not have permission
        | , or it could be a network or server error.

  .is-loaded(v-else)
    .columns
      .column.is-3.has-text-centered
        // Show icon for the OAuth2 Authority

        // Font-awesome v5
        //.loginservice-logo(v-if="$authservice.options.defaultIconPack==='fas'")
        .loginservice-logo(v-if="$authservice.icons('fas')")
          i.far.fa-envelope-open(v-if="user.authority === 'email'")
          i.fab.fa-facebook-square(v-else-if="user.authority === 'facebook'")
          i.fab.fa-github(v-else-if="user.authority === 'github'")
          i.fab.fa-google(v-else-if="user.authority === 'google'")
          i.fab.fa-linkedin(v-else-if="user.authority === 'linkedin'")
          i.fab.fa-twitter(v-else-if="user.authority === 'twitter'")

        .loginservice-logo(v-else)
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
        h3.is-5 {{ loginDescription }}
        span.loginservice-userdetails-admin-indicator(v-show="user.is_admin")
          | [administrator]

        br
        br
        br
        br
        br
        br
        button.button.is-info.loginservice-userdetails-update-button(v-if="mayUpdateUser", v-on:click="onSubmit") Update
        div(v-if="mayChangePassword")
          br
          br
          loginservice-password.loginservice-userdetails-change-password-button(
            v-if="mayChangePassword",
            :user="user",
            :demo="demo",
            :email-token="emailToken"
          )

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
            .columns
              .column.is-6
                .label Username
                .control
                  //- | {{ user.username }}
                  input.input.loginservice-userdetails-username(
                    type="text",
                    v-model="user.username",
                    disabled
                  )
          .field
            .columns
              .column.is-6
                .label Tenant
                .control
                  input.input.loginservice-userdetails-tenant(
                    type="text",
                    placeholder="First name",
                    v-model="user.tenant",
                    autocomplete="foo",
                    disabled
                  )
              .column.is-6
                .label Email
                .control
                  input.input.loginservice-userdetails-email(
                    type="text",
                    placeholder="First name",
                    v-model="user.email",
                    autocomplete="foo",
                    disabled
                  )
          .field
            .label Name
            .columns
              .column.is-4
                .control
                  input.input.loginservice-userdetails-firstname(
                    type="text",
                    placeholder="First name",
                    v-model="user.first_name",
                    autocomplete="foo",
                    :disabled="!mayUpdateName"
                  )
              .column.is-4
                .control
                  input.input.loginservice-userdetails-middlename(
                    type="text",
                    placeholder="Middle name",
                    v-model="user.middle_name",
                    autocomplete="foo",
                    :disabled="!mayUpdateName"
                  )
              .column.is-4
                .control
                  input.input.loginservice-userdetails-lastname(
                    type="text",
                    placeholder="Last name",
                    v-model="user.last_name",
                    autocomplete="foo",
                    :disabled="!mayUpdateName"
                  )
          .field
            .label Full Name
            .control
              input.input.loginservice-userdetails-fullname(
                type="text",
                placeholder="Fullname",
                v-model="user.full_name",
                autocomplete="foo",
                :disabled="!mayUpdateName"
              )

          div(v-if="show2faFields")
            br
            hr
            br
            .has-text-centered
              h2.title.is-3 Two Factor Authentication
            br
            p
              | Two-factor authentication (2FA) adds a layer of security in addition to your user name and password.
              | When you login with 2FA enabled you will be asked to
              | use a security key
              | , enter a verification code
              | or approve the login from your mobile device, depending on your settings below.
            p
            br
              //- | This OTP is obtained
            .columns
              //-   .column.is-1
              //- .column.is-4
                .card.my-card
                  .card-content.has-text-justified.is-size-6
                    h1.title.is-size-6 Authentication Device (U2F)
                    .text-2fa-option
                      | This is the most secure authentication, where
                      | you plug a physical device into your computer.
                      | You can use&nbsp;
                      a(href="https://www.yubico.com/", target="_blank") Yubikey
                      | &nbsp;or similar U2F key, and it works with Chrome, Firefox and Edge browsers.
                    .has-text-centered.my-2fa-button
                      button.button.is-small.is-light() Enable U2F
                    //- br

              //- .column.is-4
              //- .column.is-1
              .column.is-6
                .card.my-card
                  //- .card-content.has-text-justified.is-size-6
                  .card-content.has-text-justified.is-size-6
                    h1.title.is-size-5 Authentication App (TOTP)
                    //- .text-2fa-option
                      | Use an Authentication app like&nbsp;
                      a(href="https://www.yubico.com/", target="_blank") Google Authenticator
                      | &nbsp;or&nbsp;
                      a(href="https://authy.com/download/", target="_blank") Authy
                      | &nbsp;to create a Time based One-time Password (TOPT) each time you log in.
                    .text-2fa-option
                      | Using an Authentication app on your phone, such as&nbsp;
                      a(href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2", target="_blank") Google Authenticator
                      | &nbsp;or&nbsp;
                      a(href="https://authy.com/download/", target="_blank") Authy
                      | &nbsp;, you can have a different Time-based One-Time Password (TOPT) each time you log in.

                    //- button.button.is-pulled-right.is-small.is-info(v-if="user.totp_enabled", :disabled="!mayUpdate2fa") Enable
                    //- button.button.is-pulled-right.is-small.is-info(v-if="user.totp_enabled", :disabled="!mayUpdate2fa") Enable

                    .has-text-centered.my-2fa-button(v-if="user.totp_enabled")
                      button.button.is-small.is-link.loginservice-testhook-totp-disable-button-enabled(v-if="mayUpdate2fa", @click.prevent="disableTotp") Disable TOTP
                      button.button.is-small.loginservice-testhook-totp-disable-button-disabled(v-else, disabled) Enabled
                      //- .tag.is-small(v-else) Enabled
                      //- | Enabled
                      //- br
                    .has-text-centered.my-2fa-button(v-else)
                      button.button.is-small.is-info.loginservice-testhook-totp-enable-button-enabled(v-if="mayUpdate2fa", @click.prevent="enableTotp") Enable
                      button.button.is-small.loginservice-testhook-totp-enable-button-disabled(v-else, disabled) Disabled
                      //- | Not configured
                      //- .tag.is-small(v-else) Not configured


                    //- br
                    //- button.button.is-pulled-right.is-small.is-danger(@click.prevent="enableTotp") Enable
                    //- button.button.is-pulled-right.is-small.is-danger(@click.prevent="disableTotp") Disable


              //- .column.is-4
              .column.is-6
                .card.my-card
                  //- .card-content.has-text-justified.is-size-6
                  .card-content.has-text-justified.is-size-6
                    h1.title.is-size-5 SMS Authentication
                    .text-2fa-option
                      | Receive a text message each time you log in with your username and password, containing an access code to complete the login process.
                    .has-text-centered.my-2fa-button
                      button.button.is-small.is-light.loginservice-testhook-smsOtp-enable-button-disabled(disabled) Enable
                    //- br


                    //- | Enabled
                    //- .field.is-horizontal
                      .field-label.is-small
                        //- label.label Authy / Authenticator:
                        label.label Use phone App:
                      .field-body
                        .field
                          .control
                            template(v-if="user.totp_enabled")
                              button.button.is-pulled-rightZ.is-small(v-if="mayUpdate2fa", @click.prevent="disableTotp") Disable 2FA
                              .tag.is-small(v-else) Enabled
                              //- | Enabled
                              //- br
                            template(v-else)
                              button.button.is-pulled-rightZ.is-small(v-if="mayUpdate2fa", @click.prevent="enableTotp") Set up Authy or Google Authenticator now
                              //- | Not configured
                              .tag.is-small(v-else) Not configured
                              //- br
              //- .column.is-1
              //- .column.is-4
              //- .column.is-4
                .field.is-horizontal
                  .field-label.is-small
                    //- label.label SMS phone number:
                    label.label Receive SMS:
                  .field-body
                    .field
                      .control
                        input.input.loginservice-userdetails-firstname(
                          type="phone",
                          placeholder="+63 9xx xxx xxxx",
                          v-model="user.otp_sms",
                          autocomplete="foo",
                          :disabled="!mayUpdateSMS"
                          )

                    //- .select
                      select.input.loginservice-userdetails-opt(
                        :disabled="!mayUpdate2fa",
                        v-model="user.totp_enabled"
                        @change="totpChanged"
                      )
                        option(:value="false") Inactive
                        option(:value="true") Active
                      .tag.is-success Verified
                    //- input.input.loginservice-userdetails-firstname(
                      type="text",
                      placeholder="First name",
                      v-model="user.first_name",
                      autocomplete="foo",
                      :disabled="!mayUpdateName"
                        )
              //- .column.is-5
                .field
                  .label SMS phone number
                    input.input.loginservice-userdetails-firstname(
                      type="phone",
                      placeholder="+63 9xx xxx xxxx",
                      v-model="user.otp_sms",
                      autocomplete="foo",
                      :disabled="!mayUpdateSMS"
                        )


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
            template(v-if="mayUpdateStatus && editingOwnDetails")
              br
              .notification.is-warning.loginservice-userdetails-admin-warning
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
                      select.input.loginservice-userdetails-status(
                        :disabled="!mayUpdateStatus",
                        v-model="user.status"
                      )
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
                      select.input.loginservice-userdetails-emailstatus(
                        :disabled="!mayUpdateStatus",
                        v-model="user.email_status"
                      )
                        option(value="blacklisted") Blacklisted
                        option(value="disabled") Disabled
                        option(value="unverified") Unverified
                        option(value="verified") Verified
              .column.is-4
                .field
                  .label Is Administrator
                  .control
                    .select
                      select.input.loginservice-userdetails-isAdmin(
                        :disabled="!mayUpdateStatus",
                        v-model="user.is_admin"
                      )
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
                a(:href="user.media_page", target="_blank") {{ user.media_page }}
            .field
              .label Languages
              .control
                input.input.loginservice-userdetails-languages(
                  type="text",
                  v-model="user.languages",
                  autocomplete="foo",
                  disabled
                )
            .field
              .label Locale
              .control
                input.input.loginservice-userdetails-locale(
                  type="text",
                  v-model="user.locale",
                  autocomplete="foo",
                  disabled
                )
            .field
              .label Location
              .control
                input.input.loginservice-userdetails-location(
                  type="text",
                  v-model="user.location",
                  autocomplete="foo",
                  disabled
                )
            .field
              .label Timezone
              .control
                input.input.loginservice-userdetails-timezone(
                  type="text",
                  v-model="user.timezone",
                  autocomplete="foo",
                  disabled
                )

          div(v-if="showPermissionFields")
            br
            br
            hr
            .has-text-centered
              h2.title.is-3 Permissions

            .field
              .label Rights
              .control
                | &nbsp;&nbsp;&nbsp; {{ user.rights }}
            .field
              .label Privileges
              .control
                | &nbsp;&nbsp;&nbsp; {{ user.privileges }}
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
    .is-size-6(v-if="debug")
      hr
      | haveAdminPrivileges: {{haveAdminPrivileges}}
      br
      | mayUpdateName: {{mayUpdateName}}
      br
      | mayUpdateUser: {{mayUpdateUser}}
      br
      | mayUpdateStatus: {{mayUpdateStatus}}
      br
      | mayUpdate2fa: {{mayUpdate2fa}}
      br
      | mayUpdateTotp: {{mayUpdateTotp}}
      br
      | mayUpdateOtpSms: {{mayUpdateOtpSms}}
      hr
      | USER BEING EDITED:
      br
      | {{user}}
      hr
      | CURRENTLY LOGGED IN USER
      br
      | {{$loginservice.user}}
      hr
    //- .columns
  //- !selectError


  //
  //  Modal for activating TOTP (Authy, Google Authenticator etc)
  //
  .modal(:class="{ 'is-active': showTotpModal }").has-text-left
    .modal-background
    .modal-card
      header.modal-card-head
        p.modal-card-title
          | Activate 2FA
        button.delete(aria-label="close" @click="toggleTotpModal")
      section.modal-card-body
        // QR Code
        .has-text-centered
          img(width="300", height="300", :src="`data:image/png;base64,${QRCodeBase64}`")
          br
          .my-readable-secret.loginservice-testhook-enableTotp-totp-secret
            | {{readableSecret}}

        template(v-if="totpError")
          br
          .notification.is-danger
            | {{totpError}}
        //- br

        //- .notification.is-danger(v-if="warningMsg") {{warningMsg}}
        .has-text-centered
          form
            .field
              .label Token
              .control.my-totp-token-entry
                //- input.input.loginservice-testhook-enableTotp-token(type="number",  maxlength="6", placeholder="", v-model="totpToken", autocomplete="off", @keyup="totpTokenChange")
                //- | {{totpToken0}} {{totpToken1}} {{totpToken2}} {{totpToken3}} {{totpToken4}} {{totpToken5}}
                //- br
                input.input.my-totpdigit(type="number", ref="totpToken0", v-model="totpToken0", autocomplete="off", @keyup="totpTokenInput(0, $event)")
                input.input.my-totpdigit(type="number", ref="totpToken1", v-model="totpToken1", autocomplete="off", @keyup="totpTokenInput(1, $event)")
                input.input.my-totpdigit(type="number", ref="totpToken2", v-model="totpToken2", autocomplete="off", @keyup="totpTokenInput(2, $event)")
                input.input.my-totpdigit(type="number", ref="totpToken3", v-model="totpToken3", autocomplete="off", @keyup="totpTokenInput(3, $event)")
                input.input.my-totpdigit(type="number", ref="totpToken4", v-model="totpToken4", autocomplete="off", @keyup="totpTokenInput(4, $event)")
                input.input.my-totpdigit(type="number", ref="totpToken5", v-model="totpToken5", autocomplete="off", @keyup="totpTokenInput(5, $event)")
                //- br
                //- | {{totpToken}}

      footer.modal-card-foot
        button.button.is-success.loginservice-testhook-enableTotp-verify-button(@click="verifyTotp", :disabled="!enableTotpConfirmButton") Verify
        button.button.loginservice-testhook-enableTotp-cancel-button(@click="toggleTotpModal") Cancel

</template>

<script>
import axios from "axios";
import axiosError from "../axiosError.js";
import LoginservicePassword from "./LoginservicePassword";

export default {
  name: "loginservice-user-details",
  components: {
    LoginservicePassword,
  },
  props: {
    /**
     * Application to which the user belongs. For example 'freddy/myapp'.
     * In most cases this will be the same tenant as the currently logged in user
     * (`this.$loginservice.user.tenant`).
     */
    tenant: {
      type: String,
      required: true,
    },

    /**
     * The userID of the user to be displayed.
     */
    userId: {
      type: String,
      required: true,
    },

    /**
     * In **debug** mode the component will display a data dump of the currently
     * logged in user, and the user being displayed by this compnent.
     */
    debug: {
      type: Boolean,
      default: false,
    },

    /**
     * In **demo** mode, the user can log in, but cannot change the password.
     * Use this when you provide a demonstration account and password that people
     * can use to try out your application.
     */
    demo: {
      type: Boolean,
      default: false,
    },

    /**
     * Show options for Two factor authentication. The exact options provided
     * will come from the application's configuration in the dashboard.
     */
    show2fa: {
      type: Boolean,
      default: false,
    },

    /**
     * Show the status values - account status, email status. and the 'isAdmin' setting.
     * If the current user is an administrator then these values can be updated.
     */
    showStatus: {
      type: Boolean,
      default: false,
    },

    /**
     * @ignore
     */
    showPermissions: {
      type: Boolean,
      default: false,
    },

    /**
     * Allow the user's password to be changed.
     */
    changePassword: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      user: {},

      selectError: false, // Error calling the API to get user details

      // 2FA fields
      showTotpModal: false,
      QRCodeBase64: '',
      readableSecret: '',
      totpToken: '',
      totpError: '',
    };
  },
  computed: {
    loginDescription: function () {
      if (this.user && this.user.authority) {
        if (this.user.authority === "email") {
          // Regular login
          if (this.user.Username) {
            return `Username / Password`;
          } else {
            return `Email / Password`;
          }
        } else {
          // Social media login
          let part1 = this.user.authority.substring(0, 1).toUpperCase();
          let part2 = this.user.authority.substring(1);
          return `Login using ${part1}${part2}`;
        }
      }
      return null;
    },

    // Are we using 'username' to login?
    useUsername: function () {
      return false;
    },

    // Can we change the name fields
    mayUpdateName: function () {
      return (
        (this.editingOwnDetails || this.haveAdminPrivileges) &&
        this.user &&
        this.user.authority === "email"
      );
    },

    mayUpdateUser: function () {
      return this.editingOwnDetails || this.haveAdminPrivileges;
    },

    mayUpdateStatus: function () {
      return this.haveAdminPrivileges;
    },

    mayUpdate2fa: function () {
      return this.editingOwnDetails || this.haveAdminPrivileges;
    },

    mayUpdateTotp: function () {
      // Only the user can set up their Authy / Google Authenticator
//ZZZZZ
      return true
    },

    mayUpdateOtpSms: function () {
      // Only the user can set up their Authy / Google Authenticator
//ZZZZZ
      return true
    },

    enableTotpConfirmButton () {
      if (this.showTotpModal && this.totpToken.length === 6) {
        return true
      }
      return false
    },

    // Are we in demo mode?
    isDemo: function () {
      return (
        (typeof this.demo == "boolean" && this.demo) ||
        (typeof this.demo == "string" && this.demo !== "")
      );
    },

    // Show the 2FA fields?
    show2faFields: function () {
      console.log("this.show2fa", this.show2fa);
      console.log("this.show2faStatus", typeof this.show2fa);
      return (
        (typeof this.show2fa == "boolean" && this.show2fa) ||
        (typeof this.show2fa == "string" && this.show2fa !== "false")
      );
    },

    // Show the status fields?
    showStatusFields: function () {
      // console.log("this.showStatus", this.showStatus);
      // console.log("this.showStatus", typeof this.showStatus);
      return (
        (typeof this.showStatus == "boolean" && this.showStatus) ||
        (typeof this.showStatus == "string" && this.showStatus !== "false")
      );
    },

    showSocialMediaFields: function () {
      return this.user && this.user.authority !== "email";
    },

    // Show Permission fields
    showPermissionFields: function () {
      console.log("this.showPermissions", this.showPermissions);
      console.log("this.showPermissions", typeof this.showPermissions);

      return (
        (typeof this.showPermissions == "boolean" && this.showPermissions) ||
        (typeof this.showPermissions == "string" &&
          this.showPermissions !== "false")
      );
    },

    // See if the current user is editing their own record
    editingOwnDetails: function () {
      if (
        this.$authservice.user.tenant === this.user.tenant &&
        this.$authservice.user.id === this.user.id
      ) {
        console.log(`- User updating themself`);
        return true;
      }
      return false;
    },

    // Return true if this user has some sort of admin privileges
    // for the user record being edited.
    // Note: these rules only effect the UI - the real check is on
    // the server in ApplicationAccess.go
    haveAdminPrivileges: function () {
      console.log(`haveAdminPrivileges()`);
      console.log(`$authservice.user=`, this.$authservice.user);
      console.log(`this.user=`, this.user);
      // console.log(`$route.params.username=`, this.$route.params.username)
      // console.log(`$route.params.appname=`, this.$route.params.appname)
      //return false

      // See if this is a user logged into A3 (Tooltwist site)
      if (this.$authservice.user.tenant === "genesis/a3") {

        //  1. Logged into A3 and an A3 admin user.
        //  (A genesis/a3 admin user may access anything)
        if (this.$authservice.user.isAdmin) {
          console.log(`- A3 admin`);
          return true;
        }

        //  2. Logged into A3 and a user looking at one of their own apps.
        //  (A user has full access to users in their own applications)
        if (
          // this.$route &&
          // this.$route.params.username === this.$authservice.user.username
          this.user.tenant.startsWith(`${this.$authservice.user.username}/`)
        ) {
          console.log(`- Owner of the application`);
          return true;
        }
      }

      // 3. Logged into an application, and admin of that application, and the
      //    user we are looking at is in that same application.
      //    (An admin user has full access to users in the application they are logged into)
      if (
        // this.$authservice.user.isAdmin &&
        // this.$route &&
        // this.$authservice.user.tenant === `${this.$route.params.username}/${this.$route.params.appname}`
        this.$authservice.user.isAdmin &&
        this.user.tenant === this.$authservice.user.tenant
      ) {
        console.log(`- Current application's admin`);
        return true;
      }

      //  4. A user who is a member of an organisation has access to all
      //    the organisation's applications, and admin permissions according
      //    to their member record.
      //  5. A user granted access to an application has access according
      //     to the grant definition.
      return false;
    },

    // Can we change the user's password?
    mayChangePassword: function () {
      console.log("this.changePassword", this.changePassword);
      console.log("this.changePassword", typeof this.changePassword);

      // Do we even want to change password?
      if (
        (typeof this.changePassword == "boolean" && !this.changePassword) ||
        (typeof this.changePassword == "string" &&
          this.changePassword === "false")
      ) {
        return false;
      }

      // Are we allowed to change the password?
      if (this.user && this.user.authority === "email") {
        return this.editingOwnDetails || this.haveAdminPrivileges;
      }
      return false;
    },

    emailToken: function () {
      if (this.editingOwnDetails) {
        // If we came into the page with a AUTHSERVICE_EMAIL_TOKEN parameter in
        // the URL, then jump straight into the change password screen.
        let token
        if (this.$route) {

          // Using vue-router (e.g. in Nuxt)
          token = this.$route.query["AUTHSERVICE_EMAIL_TOKEN"];
        } else {

          // Get token from window object's query parameters.
          const urlParams = new URLSearchParams(window.location.search);
          token = urlParams.get('AUTHSERVICE_EMAIL_TOKEN');
        }
        return token;
      }
      return null;
    },

    totpToken0: { get: function () { return this.getTotpTokenChar(0) }, set: function () { } },
    totpToken1: { get: function () { return this.getTotpTokenChar(1) }, set: function () { } },
    totpToken2: { get: function () { return this.getTotpTokenChar(2) }, set: function () { } },
    totpToken3: { get: function () { return this.getTotpTokenChar(3) }, set: function () { } },
    totpToken4: { get: function () { return this.getTotpTokenChar(4) }, set: function () { } },
    totpToken5: { get: function () { return this.getTotpTokenChar(5) }, set: function () { } },
  },//- computed

  methods: {

    totpTokenInput (pos, evt) {
      // console.log(`totpTokenInput(${pos})`, event)
      evt.preventDefault();
      evt.stopPropagation()
      this.totpError = ''

      switch (evt.code) {
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          this.totpToken = this.totpToken.substring(0, pos) + evt.key
          break
          // const elem = this.$refs[`totpToken${this.totpToken.length}`]
          // if (elem) elem.focus()
        case 'Backspace':
          if (this.totpToken.length > pos) {
            // if (pos === 5 && this.totpToken.length === 6) {
            this.totpToken = this.totpToken.substring(0, pos)
          } else if (pos > 0) {
            this.totpToken = this.totpToken.substring(0, pos - 1)
          }
          break
          // const elem = this.$refs[`totpToken${this.totpToken.length - 1}`]
          // if (elem) elem.focus()

        default:
          // Ignore this keypress, but delete any character in this pos
          this.totpToken = this.totpToken.substring(0, pos)
          break
      }

      // Set the focus
      const elem = this.$refs[`totpToken${this.totpToken.length}`]
      if (elem) elem.focus()

      // Perhaps go straight into verifying
      if (this.totpToken.length === 6) {
        this.verifyTotp()
      }

      return false
    },

    getTotpTokenChar(pos) {
      // console.log(`getTotpTokenChar(${pos}) - ${this.totpToken}.`)
      if (this.totpToken.length > pos) {
        const singleChar = this.totpToken.substring(pos, pos + 1)
        return singleChar
      }
      return ''
    },

    // Load details of the specified user from the server.
    loadUserDetails() {
      console.log(`LoginserviceUserDetails.loadUserDetails()`);
      const url = `${this.$authservice.endpoint()}/${this.tenant}/user/${
        this.userId
      }`;
      console.log(`url is ${url}`);
      let params = {
        method: "get",
        url,
        headers: {
          Authorization: "Bearer " + this.$authservice.jwt,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };
      axios(params)
        .then((response) => {
          // JSON responses are automatically parsed.
          if (response && response.data && response.data.length > 0) {
            console.log(`RESPONSE IS`, response.data);
            this.user = response.data[0];
          } else {
            console.error(`User ${this.tenant}/${this.userId} not found`);
            this.selectError = true;
          }
        })
        .catch((e) => {
          axiosError(this, url, params, e);
          this.selectError = true;
        });
    },

    // totpChanged(evt) {
    //   console.log(`totpChanged(${this.user.totp_enabled})`, evt)
    //   this.showTotpModal = true
    // },

    async enableTotp(evt) {
      console.log(`enableTotp(${this.user.totp_enabled})`, evt)

      // Get a QRCode for the Authentication App.
      let url = `${this.$authservice.endpoint()}/totp/activate/step1`;
      console.log(`url=`, url)
      let params = {
        method: "post",
        url,
        headers: {
          Authorization: "Bearer " + this.$authservice.jwt,
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      };

      try {
        const reply = await axios(params)
        // console.log(`reply=`, reply)

        // Create a readable version of the secret.
        // Google Authenticator secrets are 80 bits = 10 bytes = 16 chars of base32.
        const secret = reply.data.secret
        this.readableSecret = secret
        if (secret.length >= 16) {
          const p1 = secret.substring(0, 4)
          const p2 = secret.substring(4, 8)
          const p3 = secret.substring(8, 12)
          const p4 = secret.substring(12, 16)
          this.readableSecret = `${p1} ${p2} ${p3} ${p4}`
        }
        // There is talk of longer secrets being required, and the RFC
        // recommends 160 bits, so this is for the future...
        // 160 bits = 20 bytes = 32 chars of base32
        if (secret.length >= 32) {
          const p5 = secret.substring(16, 20)
          const p6 = secret.substring(20, 24)
          const p7 = secret.substring(24, 28)
          const p8 = secret.substring(28, 32)
          this.readableSecret += ` ${p5} ${p6} ${p7} ${p8}`
        }

        this.QRCodeBase64 = reply.data.image
        this.totpToken = ''
        this.showTotpModal = true

        // Wait a bit, then position the cursor on the first digit field
        const self = this
        setTimeout(() => {
          const firstDigit = self.$refs.totpToken0
          if (firstDigit) firstDigit.focus()
        }, 250)
      } catch (e) {
        console.log("error. e=", e);
        axiosError(this, url, params, e);
      }
    },

    async disableTotp( ) {
      console.log(`disableTotp(${this.user.totp_enabled})`)
      let url = `${this.$authservice.endpoint()}/totp/deactivate`;
      console.log(`url=`, url)
      let params = {
        method: "post",
        url,
        headers: {
          Authorization: "Bearer " + this.$authservice.jwt,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // data: data,
      };

      const reply = await axios(params)
      console.log(`reply=`, reply)

      this.user.totp_enabled = false

      //ZZZZ Should have got new credentials in reply?
    },

    totpTokenChange (evt) {
      console.log(`this.totpToken=`, this.totpToken)
      console.log(`evt=`, evt)
      this.totpError = ''
      return false
    },

    async verifyTotp() {
      console.log(`verifyTotp(${this.user.totp_enabled})`)
      let url = `${this.$authservice.endpoint()}/totp/activate/step2`;
      console.log(`url=`, url)
      const data = {
        token: this.totpToken
      }
      let params = {
        method: "post",
        url,
        headers: {
          Authorization: "Bearer " + this.$authservice.jwt,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: data,
      };

      const reply = await axios(params)
      console.log(`reply=`, reply)

      if (reply.data.valid) {
        // Sucessfully enabled
        this.user.totp_enabled = true
        this.showTotpModal = false
      } else {
        this.totpError = 'Invalid token'
      }

      //ZZZZ Should have got new credentials in reply?
    },

    toggleTotpModal() {
      this.showTotpModal = !this.showTotpModal
    },

    onSubmit(evt) {
      if (this.isDemo) {
        this.modalIsActive = false;
        if (this.$toast && this.$toast.open) {
          this.$toast.open({
            message: `Password not updated (demo mode)`,
            type: "is-info",
            duration: 4000,
          });
        } else {
            alert(`Password not updated (demo mode)`)
        }
        return;
      }

      // Save our copy of the application, and reclone it again.
      evt.preventDefault();

      let data = {
        tenant: this.tenant,
        id: this.userId,
      };
      if (this.mayUpdateName) {
        data.first_name = this.user.first_name;
        data.middle_name = this.user.middle_name;
        data.last_name = this.user.last_name;
        data.full_name = this.user.full_name;
      }
      if (this.mayUpdateStatus) {
        data.status = this.user.status;
        data.email_status = this.user.email_status;
        data.is_admin = this.user.is_admin;
      }

      // Save the user record
      console.log("Saving:", this.user);
      // console.log(`email status is ${this.user.email_status}`)
      let url = `${this.$authservice.endpoint()}/user`;
      let params = {
        method: "post",
        url,
        headers: {
          Authorization: "Bearer " + this.$authservice.jwt,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: data,
      };
      axios(params)
        .then((response) => {
          // JSON responses are automatically parsed.
          console.log("ok. response=", response);
          if (response.data && response.data.status === "ok") {
            // All okay
            if (this.$toast && this.$toast.open) {
              this.$toast.open({
                message: `Changes saved`,
                type: "is-success",
                duration: 4000,
              });
            } else {
              alert('Changes saved')
            }
            this.loadUserDetails();
          } else {
            // Not the expected result
            console.log(
              "Unexpected result while updating user record. response=",
              response
            );
            if (this.$toast && this.$toast.open) {
              this.$toast.open({
                message: `Error: User details might not have been updated`,
                type: "is-danger",
              });
            } else {
              alert(`Error: User details might not have been updated`)
            }
          }
        })
        .catch((e) => {
          console.log("error. e=", e);
          axiosError(this, url, params, e);
        });
    },
  },//- methods
  created() {
    this.loadUserDetails();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.loginservice-user-details {
  .loginservice-logo {
    margin-top: 5px;
    margin-bottom: 25px;
    font-size: 112px;
    line-height: 112px;
    &.a3-faded i.fa {
      color: #d0d0d0;
    }
  }

  .text-2fa-option {
    // font-size: 0.9em;
    // min-height: 160px;
    min-height: 140px;
  }

  .my-readable-secret {
    font-size: 13px;
    font-weight: 600;
    font-family: 'Courier New', Courier, monospace;
  }

  .my-card {
    height: 100%;

    .my-2fa-button {
      margin-top: auto;
      padding-top: 8px;
      // background-color: bisque;
    }
    button {
      margin-top: auto;
    }
  }

  .my-totp-token-entry {

    .my-totpdigit {
      width: 50px;
      text-align: center;
      font-weight: 600;
      margin-right: 12px;
    }

    // // Disable the up/down number arrows.
    // /* Chrome, Safari, Edge, Opera */
    // // input::-webkit-outer-spin-button,
    // // input::-webkit-inner-spin-button {
    //   -webkit-appearance: none;
    //   margin: 0;
    // // }

    // /* Firefox */
    // // input[type=number] {
    //   -moz-appearance: textfield;
    // // }

    // Disable the up/down number arrows.
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  }
}
</style>


<docs>
Display and update a user's details (i.e. their profile).


### Example

```vue
<loginservice-user-details
    v-if="$loginservice.user"
    tenant="$loginservice.user.tenant"
    userId="$loginservice.user.id"
    :changePassword="true"
    :showStatus="true"/>
```


</docs>
