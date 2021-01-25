<template>
  <div class="more-detail">
    <a-card :bordered="false" title="基本信息">
      <a-form @submit="commitEdit" :form="form" class="form">
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item label="主管部门">
              <!-- <a-select
                v-decorator="['competentDep', { rules: [{ required: true, message: '请选择主管部门' }] }]"
                placeholder="请选择"
                @change="portRegistrySelectChange"
              >
                <a-select-option :value="item.name" v-for="(item, index) in competentDepList" :key="index">
                  {{ item.name }}
                </a-select-option>
              </a-select> -->
              <a-tree-select
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                tree-default-expand-all
                @change="depChange"
                v-decorator="['competentDep', { rules: [{ required: true, message: '请选择主管部门' }] }]"
              >
                <a-tree-select-node
                  v-for="(firstItem, firstIndex) in cascaderList[0]"
                  :key="'first' + firstIndex"
                  :value="firstItem.id"
                  :title="firstItem.name"
                >
                  <a-tree-select-node
                    v-for="(secondItem, secondIndex) in firstItem.area"
                    :key="'second' + secondIndex + 1"
                    :value="secondItem.id"
                    :title="secondItem.name"
                  >
                    <a-tree-select-node
                      v-for="(threeItem, threeIndex) in secondItem.station"
                      :key="threeIndex"
                      :value="threeItem.id"
                      :title="threeItem.name"
                    >
                    </a-tree-select-node>
                  </a-tree-select-node>
                </a-tree-select-node>
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 8 }" :md="{ span: 12 }" :sm="24">
            <a-form-item label="ID">
              <a-input
                placeholder="请输入"
                v-decorator="['shipId', { rules: [{ required: true, message: '请输入ID', whitespace: true }] }]"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{ span: 9, offset: 1 }" :lg="{ span: 10 }" :md="{ span: 24 }" :sm="24">
            <a-form-item label="船名">
              <a-input
                placeholder="请输入"
                v-decorator="['shipName', { rules: [{ required: true, message: '请输入船名', whitespace: true }] }]"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item label="船籍港">
              <a-select
                v-decorator="['portRegistry', { rules: [{ required: true, message: '请选择船籍港' }] }]"
                placeholder="请选择"
              >
                <a-select-option :value="item.id" v-for="(item, index) in portRegistryList" :key="index">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 8 }" :md="{ span: 12 }" :sm="24">
            <a-form-item label="作业类型">
              <a-input
                placeholder="请输入"
                v-decorator="['workType', { rules: [{ required: false, message: '请输入任务描述', whitespace: true }] }]"
              />
            </a-form-item>
          </a-col> -->
          <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 10 }" :md="{ span: 24 }" :sm="24">
            <a-form-item label="备注">
              <a-input
                placeholder="请输入"
                v-decorator="['remark', { rules: [{ required: false, message: '请输入备注', whitespace: true }] }]"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card :bordered="false" title="船主信息" style="margin:24px 0">
      <a-form @submit="commitEdit" :form="form" class="form">
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item label="船主姓名">
              <a-input
                placeholder="请输入"
                v-decorator="[
                  'shipUserName',
                  { rules: [{ required: true, message: '请输入船主姓名', whitespace: true }] }
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 8 }" :md="{ span: 12 }" :sm="24">
            <a-form-item label="船主手机号">
              <a-input
                placeholder="请输入"
                v-decorator="[
                  'shipPhone',
                  { rules: [{ required: true, message: '请输入手机号', whitespace: true }] }
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{ span: 9, offset: 1 }" :lg="{ span: 10 }" :md="{ span: 24 }" :sm="24">
            <a-form-item label="身份证号">
              <a-input
                placeholder="请输入"
               v-model="idCard"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row" :gutter="16">
          <a-col :lg="6" :md="12" :sm="24">
            <a-form-item label="住址">
              <a-input
                placeholder="请输入"
                v-decorator="['address', { rules: [{ required: false, message: '请输入地址', whitespace: true }] }]"
              />
            </a-form-item>
          </a-col>
          <!-- <a-col :xl="{ span: 7, offset: 1 }" :lg="{ span: 8 }" :md="{ span: 12 }" :sm="24">
            <a-form-item label="紧急联系人">
              <a-input
                placeholder="请输入"
                v-decorator="[
                  'emergencyPeople',
                  { rules: [{ required: false, message: '请输入任务描述', whitespace: true }] }
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{ span: 9, offset: 1 }" :lg="{ span: 10 }" :md="{ span: 24 }" :sm="24">
            <a-form-item label="紧急联系方式">
              <a-input
                placeholder="请输入"
                v-decorator="[
                  'emergencyPhone',
                  { rules: [{ required: false, message: '请输入任务描述', whitespace: true }] }
                ]"
              />
            </a-form-item>
          </a-col> -->
        </a-row>
      </a-form>
    </a-card>
    <a-card title="船舶照片">
      <div class="clearfix">
        <a-upload
          action="https://upload-z2.qiniup.com"
          list-type="picture-card"
          :file-list="fileList"
          @preview="handlePreview"
          @change="handleChange"
          :remove="removeImg"
          :data="{ token: qiniuToken.token }"
        >
          <div v-if="fileList.length < 8">
            <a-icon type="plus" />
            <div class="ant-upload-text">
              上传
            </div>
          </div>
        </a-upload>
        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
          <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
      </div>
    </a-card>
    <a-card class="bottom-nav">
      <a-button style="margin-right:10px" @click="closePop">取消</a-button>
      <a-button type="primary" @click="commitEdit">提交</a-button>
    </a-card>
  </div>
</template>

<script>
import {
  editShip,
  getQiniuToken,
  updateShipInfo,
  getStation,
  addShip,
  delImg,
  getAllDep,
  getHabor
} from '@/api/ship-api'

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 }
}
const formTailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8, offset: 4 }
}
export default {
  props: {
    id: {
      type: Number,
      default: 0
    },
    type: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      formItemLayout,
      formTailLayout,
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      previewVisible: false,
      previewImage: '',
      fileList: [],
      deviceId: '', // 设备ID
      harbourId: '', // 船籍港ID
      shipName: '', // 船名
      portRegistry: '', // 船籍港
      portRegistryList: [], // 船籍港列表
      cascaderList: [], // 主管部门列表
      uploadImgList: [], // 要上传的图片
      qiniuToken: '', // 七牛云Token
      imgHeadUrl: '', // 图片的前缀地址
      idCard: ''
    }
  },
  methods: {
    check () {
      this.form.validateFields(err => {
        if (!err) {
          console.info('success')
        }
      })
    },
    handleChange ({ file, fileList, event }) {
      if (file.status === 'done') {
        this.uploadImgList.push(this.imgHeadUrl + '/' + file['response']['hash'])
      }
      console.log(this.uploadImgList)
      this.fileList = fileList
    },
    handleCancel () {
      this.previewVisible = false
    },
    removeImg (e) {
      let url
      if (e.url) {
        url = e.url
      } else {
        url = e.response.hash
      }
          for (let n = 0; n < this.uploadImgList.length; n++) {
          if (this.uploadImgList[n].indexOf(url) !== -1) {
            this.uploadImgList.splice(n, 1)
            break
          }
        }

      console.log(this.uploadImgList)
      // return false
    },
    handleSubmit () {
      console.log('111')
    },
    showSubmit () {
      console.log('111')
    },
    portRegistrySelectChange (value) {
      // this.portRegistry = value
    },
    getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    async handlePreview (file) {
      if (!file.url && !file.preview) {
        file.preview = await this.getBase64(file.originFileObj)
        console.log(file.preview)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },
    closePop () {
      this.$emit('closePop')
    },
    depChange (e) {
      this.getHaborList(e)
      this.form.setFieldsValue({
        portRegistry: undefined
      })
    },
    // 获取港口信息
    getHaborList (id) {
      getHabor({
        department: id
      }).then(haborRes => {
        if (haborRes.status === 200) {
          this.portRegistryList = haborRes.data
        } else {
          this.$message.warning(haborRes.message)
        }
      })
    },
    // 提交修改
    commitEdit (e) {
      const _this = this
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.form.getFieldsValue().shipPhone.length !== 11) {
            this.$message.warning('手机号格式有误')
            return false
          } else if (this.idCard.length > 0 && this.idCard.length !== 18) {
            this.$message.warning('身份证输入有误')
            return false
          } else {
            if (this.type === 1) {
              updateShipInfo('/ship/shipEdit/' + this.id, {
                device: this.form.getFieldsValue().shipId,
                department: this.form.getFieldsValue().competentDep,
                boat: this.form.getFieldsValue().shipName,
                harbour: this.form.getFieldsValue().portRegistry,
                owner_name: this.form.getFieldsValue().shipUserName,
                owner_phone: this.form.getFieldsValue().shipPhone,
                owner_id_card: this.form.getFieldsValue().idCard,
                address: this.form.getFieldsValue().address,
                describe: this.form.getFieldsValue().remark,
                image: this.uploadImgList
              }).then(res => {
                if (res.status === 200) {
                  this.$message.success('提交成功', 3)
                  this.closePop()
                  _this.$emit('getBaseContent')
                } else {
                  this.$message.success(res.message, 3)
                }
              })
            } else {
              addShip({
                device: this.form.getFieldsValue().shipId,
                department: this.form.getFieldsValue().competentDep,
                boat: this.form.getFieldsValue().shipName,
                harbour: this.form.getFieldsValue().portRegistry,
                owner_name: this.form.getFieldsValue().shipUserName,
                owner_phone: this.form.getFieldsValue().shipPhone,
                owner_id_card: this.form.getFieldsValue().idCard,
                address: this.form.getFieldsValue().address,
                describe: this.form.getFieldsValue().remark,
                image: this.uploadImgList
              }).then(res => {
                if (res.status === 200) {
                  this.$message.success('提交成功', 3)
                  this.closePop()
                  _this.$emit('getBaseContent')
                } else {
                  this.$message.success(res.message, 3)
                }
              })
            }
          }
        }
      })
    }
  },
  created () {
    if (this.type === 1) {
      editShip('/ship/shipEdit/' + this.id).then(res => {
        this.deviceId = res.data.device_id
        this.uploadImgList = res.data.image
        // this.fileList = res.data.image
        this.getHaborList(res.data.competent_department)
        for (let h = 0; h < res.data.image.length; h++) {
          this.fileList.push({
            uid: h - 20,
            url: res.data.image[h],
            name: 'image.png',
            status: 'done'
          })
        }
        console.log(this.fileList)
        this.form.setFieldsValue({
          shipName: res.data.boat_name,
          address: res.data.address,
          shipId: this.id + '',
          remark: res.data.describe,
          shipUserName: res.data.owner_name,
          shipPhone: res.data.owner_phone,
          idCard: res.data.id_number,
          competentDep: res.data.competent_department,
          portRegistry: res.data.harbour
        })
      })
    }
    getAllDep().then(res => {
      this.cascaderList = res.data
    })
    // 获取七牛云token
    getQiniuToken().then(res => {
      this.qiniuToken = res
      this.imgHeadUrl = res.url
    })
  }
}
</script>
<style lang="less" scoped>
.bottom-nav {
  margin-top: 20px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
