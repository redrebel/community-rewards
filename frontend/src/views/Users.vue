<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col sm="12">
        <b-card header-tag="header" footer-tag="footer">
        <div>
          <b-form novalidate="novalidate" class="was-validated" @submit="onSubmit">
            <b-form-group>
              <b-input-group>
                <b-form-input v-model="form.email" type="email" placeholder="Email"></b-form-input>
                <!-- Attach Right button -->
                <b-input-group-append>
                  <b-button type="submit" variant="primary">Send invitation</b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-form>
        </div>
        </b-card>
      </b-col><!--/.col-->
    </b-row><!--/.row-->
    <b-row>
      <b-col sm="12">
        <c-table ref="table" v-if="users !== null" striped :rows="users" :columns="userFields" caption="<i class='fa fa-align-justify'></i> Striped Table"></c-table>
      </b-col><!--/.col-->
    </b-row><!--/.row-->

  </div>

</template>

<script>
import cTable from './base/Table.vue'

export default {
  name: 'tables',
  components: {cTable},
  created () {
    this.fetchData()
  },
  data () {
    return {
      form: {
        email: ''
      },
      users: null,
      userFields: [{key: 'name', sortable: true}, {key: 'email', sortable: true}, {key: 'role', sortable: true}, {key: 'status', sortable: true}, {key: 'createdAt', sortable: true}, {key: 'balance', sortable: true}]
    }
  },
  methods: {
    fetchData () {
      this.$http.get('/api/users')
        .then((response) => { this.users = response.data })
        .then(() => {
          for (let i = 0; i < this.users.length; i++) {
            const user = this.users[i]
            if (user.keyStore) {
              this.$http.get('/api/balance/' + user.keyStore.address)
                .then((response) => { this.users[i].balance = response.data })
            }
          }
        })
    },
    onSubmit (evt) {
      var _this = this
      evt.preventDefault()
      if (this.form.email !== '') {
        this.form.status = 'pending'
        this.form.role = 'user'
        this.form.name = ''
        this.$http.post('/api/users', this.form)
          .then((response) => {
            this.form.email = ''
            _this.$http.post('/api/mails/invitation/users/' + response.data._id)
              .then((response) => { alert('Invitation has been sent.') })
              .then(() => { this.users.unshift(response.data) })
          })
          .catch((error) => {
            console.error(error.response)
            alert(error.response.data.message)
          })
      }
    }
  }
}
</script>
