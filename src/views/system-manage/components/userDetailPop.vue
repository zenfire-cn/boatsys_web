<template>
  <div class="more-detail">
    <a-card :bordered="false">
      <div class="model-pop">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="用户名">
            <a-input v-decorator="['userName', { rules: [{ required: true, message: '请输入用户名' }] }]" />
          </a-form-item>
          <a-form-item label="密码" v-if="popType === 0">
            <a-input v-decorator="['password', { rules: [{ required: true, message: '请输入密码' }] }]" />
          </a-form-item>
          <a-form-item label="姓名">
            <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入姓名' }] }]" />
          </a-form-item>
          <a-form-item label="手机号">
            <a-input v-decorator="['phone', { rules: [{ required: true, message: '请输入手机号' }] }]" />
          </a-form-item>
          <a-form-item label="所属部门" v-if="isShowRole">
            <a-tree-select
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              v-decorator="['dep', { rules: [{ required: true, message: '请选择所属部门' }] }]"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
            >
              <a-tree-select-node v-for="(firstItem,firstIndex) in cascaderList[0]" :key="'first' + firstIndex" :value="firstItem.id" :title="firstItem.name">
                <a-tree-select-node v-for="(secondItem,secondIndex) in firstItem.area" :key="'second' + secondIndex + 1" :value="secondItem.id" :title="secondItem.name">
                  <a-tree-select-node v-for="(threeItem,threeIndex) in secondItem.station" :key="threeIndex" :value="threeItem.id" :title="threeItem.name">
                  </a-tree-select-node>
                </a-tree-select-node>
              </a-tree-select-node>
            </a-tree-select>
          </a-form-item>
          <a-form-item label="角色" v-if="isShowRole">
            <a-select
              v-decorator="['role', { rules: [{ required: true, message: '请选择角色' }] }]"
              placeholder="请选择角色"
              @change="handleSelectChange"
            >
              <a-select-option :value="roleItem.id" v-for="(roleItem, roleIndex) in roleList" :key="roleIndex">
                {{ roleItem.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="是否为联络人" v-if="popType === 0">
            <a-switch @change="contactChange"/>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
            <a-button type="primary" html-type="submit">
              提交
            </a-button>
            <a-button style="margin-left:20px" @click="closePop">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>
<script>
import { getUserInfo, getAllRole, setUserInfo, addUserInfo } from '@/api/systemManage-api'
import { getAllDep } from '@/api/ship-api'
export default {
  props: {
    id: {
      type: Number,
      default: 0
    },
    popType: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      checkValue: '0',
      visible: false, // 控制大地图的显示
      confirmLoading: false,
      radioValue: '',
      widths: 700,
      switchValue: false,
      isShowRole: true, // 是否显示部门，角色，只有超级管理员不显示
      checkList: [
        {
          label: '系统通知',
          value: '0'
        },
        {
          label: '邮件',
          value: '1'
        },
        {
          label: '短息',
          value: '2'
        }
      ],
      map: null,
      bigMap: null,
      roleList: [], // 角色列表
      cascaderList: [], // 部门列表
      depId: undefined,
      roleId: undefined,
      status: 0 // 联络人设置状态
    }
  },
  methods: {
    handleSubmit (e) {
      const _this = this
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.popType === 1) {
            setUserInfo('/system-manage/user/' + this.id, {
            username: this.form.getFieldsValue().userName,
            real_name: this.form.getFieldsValue().name,
            phone: this.form.getFieldsValue().phone,
            role: this.form.getFieldsValue().role,
            department: this.form.getFieldsValue().dep
          }).then((res) => {
            this.$message.success(res.message)
            this.setFartherMethod()
          })
          } else {
            addUserInfo({
              username: this.form.getFieldsValue().userName,
              password: this.form.getFieldsValue().password,
              contact: this.status,
              real_name: this.form.getFieldsValue().name,
              phone: this.form.getFieldsValue().phone,
              department: this.form.getFieldsValue().dep,
              role: this.form.getFieldsValue().role
            }).then((res) => {
                if (res.status === 200) {
                  this.$message.success(res.message)
                  this.setFartherMethod()
                } else {
                  this.$message.warning(res.message)
                }
            })
          }
        }
      })
    },
    setFartherMethod () {
      this.$emit('getBaseContent')
      this.closePop()
    },
    handleSelectChange (value) {
      this.form.setFieldsValue({
        role: value
      })
    },
    // 大地图弹窗OK回调
    handleOk (e) {
      this.ModalText = 'The modal will be closed after two seconds'
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 2000)
    },
    // 大地图弹窗取消回调
    handleCancel (e) {
      console.log('Clicked cancel button')
      this.visible = false
    },
    closePop () {
      this.$emit('closePop')
    },
    getBaseContent () {
      const _this = this
      getUserInfo('/system-manage/user/' + this.id).then((res) => {
        if (res.data.role === 0) {
          this.isShowRole = false
        } else {
          this.isShowRole = true
        }
        if (res.status === 200) {
          this.form.setFieldsValue({
            userName: res.data.username,
            name: res.data.real_name,
            phone: res.data.phone,
            role: res.data.role,
            dep: res.data.department
          })
        } else {
          this.$message.warning(res.message)
          this.closePop()
        }
      })
    },
     // 联络人设置
    contactChange (checked, record) {
      this.status = checked ? '1' : '0'
    }
  },
  created () {
    if (this.popType === 1) {
      this.getBaseContent()
    }
    getAllRole().then((res) => {
      this.roleList = res.data
    })
    getAllDep().then(res => {
     this.cascaderList = res.data
    })
  }
}
</script>
<style lang="less" scoped>
.model-pop {
  width: 70%;
  height: auto;
  display: flex;
  flex-direction: column;
  padding-top: 50px;
  margin: 0 auto;
}
#map {
  height: 200px;
}
#bigMap {
  width: 670px;
  height: 600px;
}
</style>
