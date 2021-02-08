<template>
  <div>
    <a-dropdown v-if="currentUser && currentUser.name" placement="bottomRight">
      <span class="ant-pro-account-avatar">
        <a-avatar
          size="small"
          src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
          class="antd-pro-global-header-index-avatar"
        />
        <span>{{ currentUser.name }}</span>
      </span>
      <template v-slot:overlay>
        <a-menu class="ant-pro-drop-down menu" :selected-keys="[]" style="margin-top:20px">
          <!-- <a-menu-item v-if="menu" key="center" @click="handleToCenter">
          <a-icon type="user" />
          个人中心
        </a-menu-item>
        <a-menu-item v-if="menu" key="settings" @click="handleToSettings">
          <a-icon type="setting" />
          个人设置
        </a-menu-item>
        <a-menu-divider v-if="menu" /> -->
          <a-menu-item key="logout" @click="handleLogout">
            <a-icon type="logout" />
            退出登录
          </a-menu-item>
          <a-menu-item @click="editpassword">
            <a-icon type="edit" />
            修改密码
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <span v-else>
      <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
    </span>
    <a-modal :visible="previewVisible" @ok="commitPwd" @cancel="handleCancel" title="修改密码" class="edit-box">
      <div class="edit-item">
        <span>原始密码：</span>
        <a-input placeholder="请输入" v-model="oldPassword" style="width:70%;margin-left:10px"></a-input>
      </div>
      <div class="edit-item">
        <span>最新密码：</span>
        <a-input placeholder="请输入" v-model="newPassword" style="width:70%;margin-left:10px"></a-input>
      </div>
      <div class="edit-item">
        <span>确认密码：</span>
        <a-input placeholder="请输入" v-model="confirmPassword" style="width:70%;margin-left:10px"></a-input>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
export default {
  name: 'AvatarDropdown',
  props: {
    currentUser: {
      type: Object,
      default: () => null
    },
    menu: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      previewVisible: false,
      oldPassword: '', // 原始密码
      newPassword: '', // 新密码
      confirmPassword: '' // 二次确认
    }
  },
  methods: {
    handleToCenter () {
      this.$router.push({ path: '/account/center' })
    },
    handleToSettings () {
      this.$router.push({ path: '/account/settings' })
    },
    handleLogout (e) {
      Modal.confirm({
        title: this.$t('layouts.usermenu.dialog.title'),
        content: this.$t('layouts.usermenu.dialog.content'),
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          // return new Promise((resolve, reject) => {
          //   setTimeout(Math.random() > 0.5 ? resolve : reject, 1500)
          // }).catch(() => console.log('Oops errors!'))
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel () {}
      })
    },
    editpassword () {
      this.previewVisible = true
    },
    handleCancel () {
      this.previewVisible = false
    },
    commitPwd () {
      // this.$manageApi.resetPwd({
      //   password: this.oldPassword,
      //   new_password: this.newPassword
      // })
      this.$manageApi({
        password: this.oldPassword,
        new_password: this.newPassword
      }).then(res => {
        if (res.status === 200) {
          this.$message.success(res.message)
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        } else {
          this.$message.warning(res.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
.edit-box {
  display: flex;
  flex-direction: column;
  .edit-item {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin-bottom: 20px;
  }
}
</style>
