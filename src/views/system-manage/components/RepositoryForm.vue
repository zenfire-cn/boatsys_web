<template>
  <a-form @submit="handleSubmit" :form="form" class="form">
    <a-row class="form-row" :gutter="16">
      <a-col :lg="6" :md="12" :sm="24">
        <a-form-item label="仓库名">
          <a-input
            placeholder="请输入"
            v-decorator="['name', { rules: [{ required: true, message: '请输入仓库名称', whitespace: true }] }]"
          />
        </a-form-item>
      </a-col>
      <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 8 }" :md="{ span: 12 }" :sm="24">
        <a-form-item label="用户名">
          <a-input
            placeholder="请输入"
            v-decorator="['name', { rules: [{ required: true, message: '请输入仓库名称', whitespace: true }] }]"
          />
        </a-form-item>
      </a-col>
      <a-col :xl="{ span: 9, offset: 1 }" :lg="{ span: 10 }" :md="{ span: 24 }" :sm="24">
        <a-form-item label="密码">
          <a-input
            placeholder="请输入"
            v-decorator="['name', { rules: [{ required: true, message: '请输入仓库名称', whitespace: true }] }]"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-form-item v-if="showSubmit">
      <a-button htmlType="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  name: 'RepositoryForm',
  props: {
    showSubmit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: this.$form.createForm(this)
    }
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$notification['error']({
            message: 'Received values of form:',
            description: values
          })
        }
      })
    },
    validate (rule, value, callback) {
      const regex = /^user-(.*)$/
      if (!regex.test(value)) {
        callback(new Error('需要以 user- 开头'))
      }
      callback()
    }
  }
}
</script>

<style scoped></style>
