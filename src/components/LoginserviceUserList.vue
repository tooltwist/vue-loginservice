<template lang="pug">
  .loginservice-user-list
    .is-loaded(v-if="selectStatus == 'loaded'")
      .columns
        .column.is-2.is-offset-10
          .field
            .control.has-icons-right
              input.input.is-small.is-rounded.loginservice-users-filter(type="text", placeholder="filter users", v-model="filterKey", autocomplete="off")
              .icon.is-small.is-right
                i.fa.fa-search
      table.table.is-fullwidth.is-bordered.is-narrow(:class=" {'is-hoverable': typeof(pathForDetails) === 'string'} ")
        thead
          tr
            th(v-for="key in ourColumns", @click="sortBy(key)", :class="headingClass(key)")
              | {{ key | capitalize }}
              span.arrow(:class="sortOrders[key] > 0 ? 'asc' : 'dsc'")
        tbody
          tr(v-for="entry in filteredData" @click="selectUser(entry)")
            td(v-for="key in ourColumns", :class="classForStatus(entry, key)")
              //- span(v-if="key === 'icon'" v-html="icon(entry)")
              .has-text-centered(v-if="key === 'icon'")
                i.fa.type-icon(:class="iconClass(entry)")
              span(v-else, :class="columnClass(key)") {{entry[key]}}
    .is-not-loaded(v-else)

</template>

<script>
  import axios from 'axios'
  import axiosError from '../axiosError.js'

  export default {
    name: 'LoginserviceUserList',
    props: {
      pathForDetails: String,
      data: Array,
      columns: Array,
      tenant: String
    },
    data: function () {

      // Has the user provided a list of columns?
      let ourColumns = this.columns
      if (typeof(this.columns) === 'undefined') {
        ourColumns = [
          // Default only - may be replaced with 'columns' prop
          'icon',
          'authority',
          'first_name',
          'last_name',
          'username',
          'email',
          'id',
          'isAdmin',
          'status'
        ]
      }

      // Order for sorting fields
      let sortOrders = {}
      ourColumns.forEach(function (key) {
        sortOrders[key] = 1
      })

      // Return the data fields
      return {
        sortKey: '',
        sortOrders: sortOrders,
        filterKey: '',
        ourColumns,
        locallySelectedUsers: [ ],
        selectStatus: 'init'
      }
    },
    computed: {
      // userList: {
      //   return (this.data) ? (this.data) : (this.locallySelectedUsers)
      // },
      filteredData: function () {
        var sortKey = this.sortKey
        var filterKey = this.filterKey && this.filterKey.toLowerCase()
        var order = this.sortOrders[sortKey] || 1
        //var data = this.data
        let data = (this.data) ? (this.data) : (this.locallySelectedUsers)
        if (filterKey) {
          data = data.filter(function (row) {
            return Object.keys(row).some(function (key) {
              return String(row[key]).toLowerCase().indexOf(filterKey) > -1
            })
          })
        }
        if (sortKey) {
          data = data.slice().sort(function (a, b) {
            a = a[sortKey]
            b = b[sortKey]
            return (a === b ? 0 : a > b ? 1 : -1) * order
          })
        }
        return data
      }
    },
    filters: {
      capitalize: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
      }
    },
    methods: {
      sortBy: function (key) {
        this.sortKey = key
        this.sortOrders[key] = this.sortOrders[key] * -1
      },
      selectUser: function (user) {
        console.log(`Selected user:`, user)
        console.log('pathForDetails:', typeof(this.pathForDetails))
        if (this.pathForDetails) {

          // Check that we have places in the path where we insert tenant and userId.
          // For example '/myapp/{TENANT}/user/{USERID}'
          const tenantMarker = '{TENANT}'
          const userIdMarker = '{USERID}'
          let replaceTenant = this.pathForDetails.includes(tenantMarker);
          let replaceUserId = this.pathForDetails.includes(userIdMarker);

          if (replaceUserId) {

            // Work out where are jumping to
            let path = this.pathForDetails
            path = path.replace(tenantMarker, user.tenant)
            path = path.replace(userIdMarker, user.id)

            // Jump to the user details page
            // See http://router.vuejs.org/en/essentials/navigation.html
            // this.$router.push({ path: `/user-details/${user.tenant}/${user.id}` })
            if (this.$router) {
              this.$router.push({ path: path })
            } else {
              window.location.href = path
            }
          } else {
            console.error(`path-for-details must include ${userIdMarker}. e.g. /user-details/${tenantMarker}/${userIdMarker}`)
          }
        }
      },
      classForStatus: function(user, key) {
        if (key === 'status') {
          return `status-${user.status} status-field`
        } else {
          return `status-${user.status}`
        }
      },
      iconClass: function(user) {
        let cls
        if (user.is_admin) {
          cls = 'fa-bolt'
        } else {
          switch (user.entity_type) {
            case 'user': cls = 'fa-user'; break
            case 'organisation': cls = 'fa-users'; break
            // case 'club': cls = 'fa-users'; break
            // case 'company': cls = 'fa-users'; break
            // case 'group': cls = 'fa-users'; break
            // case 'role': cls = 'fa-users'; break
            default: cls = 'fa-question'
          }
        }
        return cls
      },
      headingClass: function(key) {
        const obj = { active: this.sortKey == key }
        obj[`loginservice-hdr-${key}`] = true
        return obj
      },
      columnClass: function(key) {
        return `loginservice-${key}`
      }
    },
    created () {
      if (this.data) {
        // Might be empty now, but they will arrive (hopefully) once the parent has them
        console.log('authservice-user-list has data:', this.data.length)
      } else if (this.tenant) {

        // let zApikey = 'API17AATGGPTFSP2LBR4Q9IYCT1WA'
        // let zServerSecret = 'tts129rzzr2d85kw4q8apnrkpv9mdmdudsmu0zx54b9d39ske0syvm'

        // Select the users for this username/app (i.e. tenant).
        console.log('authservice-user-list is selecting users')
        let url = `${this.$authservice.endpoint()}/${this.tenant}/users`

        var params = {
          method: 'get',
          url,
          headers: {
            'Authorization': 'Bearer ' + this.$authservice.jwt,
            // 'Authorization': 'Bearer ' + 'tts129rzzr2d85kw4q8apnrkpv9mdmdudsmu0zx54b9d39ske0syvm',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
        console.log('params:', params)
        axios(params)
          .then(response => {
            console.log(`RESPONSE IS`, response.data)
            // JSON responses are automatically parsed.
            this.locallySelectedUsers = response.data
            this.selectStatus = 'loaded'
            return
          })
          .catch(e => {
            console.log('Error selecting users:', e)
            axiosError(this, url, params, e)
            this.selectStatus = 'error'
          })

      } else {
        //${this.$route.params.username}/${this.$route.params.appname}
        console.error('authservice-user-list requires either data or tenant prop')
      }
    }
  }
</script>

<style scoped lang="scss">

  .loginservice-user-list {

  }

  //$default-color:
  $dim-color: #f4f7f9;
  $inactive-color: #f06060;

  .type-icon {
    color: #4a4a4a;
  }

  .status-active {
    font-weight: 500;
    //color: red;
  }
  .status-pending {
    //color: $inactive-color;
    background-color: $dim-color;
    font-weight: 250;
    &.status-field {
      background-color: green;
      color: white;
      font-weight: 400;
    }
  }
  .status-suspended {
    //color: $inactive-color;
    font-weight: 250;
    background-color: $dim-color;
    &.status-field {
      background-color: blue;
      color: white;
    }
  }
  .status-closed {
    //color: $inactive-color;
    font-weight: 250;
    background-color: $dim-color;
    &.status-field {
      background-color: red;
      color: white;
    }
  }
  .status-blacklisted {
    //color: $inactive-color;
    font-weight: 250;
    background-color: $dim-color;
    &.status-field {
      background-color: black;
      color: white;
    }
  }


  $table-color: #147698;
  // $table-color: #209cee;
  $hover-color: #e6edf4;

  table {
    font-family: "Avenir Next", sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    color: #4a4a4a;

    border: solid 1px $table-color;

    cursor: default;
    &.is-hoverable {
      cursor: pointer;
    }
  }

  th {
    background-color: $table-color;
    // color: rgba(255,255,255,0.66);
    //background-color: #666;
    //color: #f0f0f0;
    //color: white;
    color: white !important;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-weight: 400;
    padding-left: 4px;
    white-space: nowrap;
  }

  th.active {
    // color: blue;
    color: #ffffff;
    font-weight: 600;
  }

  th.active .arrow {
    opacity: 1;
  }

  td {
    padding-left: 4px;
  }

  tr:hover {
    background-color: $hover-color;
  }

  .arrow {
    color: black;
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    //opacity: 0.66;
  }

  .arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #fff;
  }

  .arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #fff;
  }
</style>
