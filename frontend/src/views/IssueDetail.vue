<template>
  <b-row >
    <b-col sm="9">
      <b-card>
        <div slot="header">
          <strong>{{ item.title }}</strong>
        </div>
        <b-form-group>
          <b-form-textarea id="content" :rows="8" :max-rows="8" v-model="item.content">
            </b-form-textarea>
        </b-form-group>
        <b-row>
          <b-col sm="2">
            <label for="dueDate">마감일</label>
          </b-col>
          <b-col>
            <p>{{ item.dueDate.substr(0, 10) }}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">
            <label for="count">인원수 </label>
          </b-col>
          <b-col>
            <p>{{ item.count }}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">
            <label for="rewards">보상금액</label>
          </b-col>
          <b-col>
            <p>{{ item.rewards }}</p>
          </b-col>
        </b-row>
        <b-form-group>
          <label for="due_date">패스워드</label>
          <b-form-input type="password" v-model="item.password"></b-form-input>
        </b-form-group>
        <b-form-group class="text-sm-right">
          <b-button variant="success" v-on:click="save" :disabled="item.status === 'close'">Assign</b-button>
          <b-button variant="danger" v-on:click="close" :disabled="item.status === 'close'">종료</b-button>
          <b-button variant="primary" v-on:click="back">뒤로</b-button>
        </b-form-group>
      </b-card>
    </b-col>
    <b-col sm="3">
      <b-card>
        <div slot="header">
          <strong>Assignee</strong>
        </div>
        <b-form-group>
          <select v-model="selected" multiple>
            <option v-for="option in options" v-bind:key="option.name" v-bind:value="option.email">
              {{ option.name }}
            </option>
          </select>
          <div><strong>{{ selected }}</strong></div>
        </b-form-group>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  created: function () {
    this.$http.get('/api/users/active')
      .then((response) => {
        // alert('data: ' + JSON.stringify(response.data))
        this.options = response.data
      })

    this.$http.get('/api/users/me')
      .then((response) => {
        this.user = response.data
      })
  },
  mounted: function () {
    this.$http.get('/api/issues/' + this.$route.query.id)
      .then((response) => {
        this.item = response.data[0]
        this.selected = this.item.assignee_email
      })
  },
  data: () => {
    return {
      selected: [],
      options: [],
      item: [],
      user: null
    }
  },
  methods: {
    save: function (event) {
      this.$http.put('/api/issues/' + this.$route.query.id, {
        issue: this.item,
        selected: this.selected
      })
        .then((response) => {
          alert('이슈가 할당되었습니다.')
          this.$router.go(-1)
        })
    },
    close: function (event) {
      // address 받아오기
      this.$http.get('/api/users/address?selected=' + this.selected)
        .then((response) => {
          var data = response.data
          
          for (var i = 0; i < data.length; i++) {
            this.item.receiver = JSON.parse(JSON.stringify(data[i].keyStore)).address
            this.item.tokens = this.item.rewards
            this.item.user = this.user
            // 보상 코인 전송
            this.$http.post('/api/contracts/0x000/tokens', this.item)
              .then((response) => {
              this.$http.put('/api/issues/' + this.$route.query.id, {
                issue: this.item,
                status: 'close'
              })
                .then((response) => {
                  alert('이슈가 종료되었습니다.')
                  this.$router.go(-1)
                })
            })
          }
        })
        .then((response) => {
          if (response.data.result === 'success') {
            alert(response.data.hash)
          } else {
            alert(response.data.error)
          }
        })
        
    },
    back: function (event) {
      this.$router.go(-1)
    }
  }
}
</script>
