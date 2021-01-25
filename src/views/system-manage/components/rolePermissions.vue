<template>
  <div class="more-detail">
    <a-card :bordered="false" align="center">
      <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="commitResult">
        <a-form-item label="角色名">
          <a-input v-decorator="['userName', { rules: [{ required: true, message: '请输入角色名' }] }]" />
        </a-form-item>
        <!-- <a-form-item :wrapper-col="{ span: 12, offset: 5 }">

          </a-form-item> -->
      </a-form>
      <a-table :columns="columns" :data-source="loadData" bordered :pagination="false">
        <span slot="describe" slot-scope="record">
          <a-checkbox-group>
            <a-checkbox :value="record" name="type">
              {{ record }}
            </a-checkbox>
          </a-checkbox-group>
        </span>
        <span slot="data" slot-scope="record">
          <a-checkbox
            :checked="defalutCheckList.indexOf(record.id) === -1 ? false : true"
            @change="subMenuChange($event, record.id)"
          >
            {{ record.describe }}
          </a-checkbox>
        </span>
        <span slot="btnPer" slot-scope="record">
          <a-checkbox-group :options="record" :default-value="defalutCheckList" @change="btnChange($event, record)">
            <!-- <a-checkbox name="type" v-for="ageItem in record" :key="ageItem.id">
              {{ ageItem.describe }}
            </a-checkbox> -->
          </a-checkbox-group>
        </span>
      </a-table>
      <a-button type="primary" html-type="submit" style="margin-top:30px" @click="commitResult">
        提交
      </a-button>
      <a-button style="margin-left:20px;margin-top:30px" @click="closePop">取消</a-button>
    </a-card>
  </div>
</template>
<script>
import { getRoleInfo, createPer, editPer } from '@/api/systemManage-api'
const renderContent = (value, row, index) => {
  const obj = {
    children: value,
    attrs: {}
  }
  if (index === 4) {
    obj.attrs.colSpan = 0
  }
  return obj
}
export default {
  props: {
    id: {
      type: Number,
      default: 0
    },
    openType: {
      type: Number,
      default: 0
    },
    checkRoleName: {
      type: String,
      default: ''
    }
  },
  data () {
    const columns = [
      {
        title: '父级菜单',
        dataIndex: 'describe',
        scopedSlots: { customRender: 'describe' },
        customRender: (value, row, index) => {
          const obj = {
            children: value,
            attrs: {}
          }
          if (index === 0) {
            obj.attrs.rowSpan = 3
          }
          if (index === 3 || index === 5 || index === 7) {
            obj.attrs.rowSpan = 2
          }
          // These two are merged into above cell
          if (index === 1 || index === 2 || index === 4 || index === 6 || index === 8) {
            obj.attrs.rowSpan = 0
          }
          return obj
        }
      },
      {
        title: '子菜单',
        dataIndex: 'data',
        scopedSlots: { customRender: 'data' }
      },
      {
        title: '按钮权限',
        dataIndex: 'btnPer',
        scopedSlots: { customRender: 'btnPer' }
      }
    ]
    return {
      formLayout: 'horizontal',
      loadData: [],
      columns,
      form: this.$form.createForm(this, { name: 'coordinated' }),
      checkValue: '',
      defalutCheckList: [], // 默认选中的ID
      commitSubId: [] // 需要提交的子菜单ID
    }
  },
  methods: {
    closePop () {
      this.$emit('closePop')
    },
    // 序列化数据
    serialization (data) {
      const result = data
      for (let n = 0; n < result.length; n++) {
        result[n].label = result[n].describe
        result[n].value = result[n].id
        result[n]['data'].label = result[n]['data'].describe
        result[n]['data'].value = result[n]['data'].id
        for (let h = 0; h < result[n]['btnPer'].length; h++) {
          result[n]['btnPer'][h].label = result[n]['btnPer'][h].describe
          result[n]['btnPer'][h].value = result[n]['btnPer'][h].id
        }
      }
      return result
    },
    // 子菜单动态
    subMenuChange (e, id) {
      if (this.defalutCheckList.indexOf(id) !== -1) {
        this.defalutCheckList.splice(this.defalutCheckList.indexOf(id), 1)
      } else {
        this.defalutCheckList.push(id)
      }
      if (this.commitSubId.indexOf(id) !== -1) {
        this.commitSubId.splice(this.commitSubId.indexOf(id), 1)
      } else {
        this.commitSubId.push(id)
      }
      console.log(this.commitSubId)
    },
    // 按钮权限控制
    btnChange (checkedValues, record) {
      const idList = []
      let lastIdList
      for (let n = 0; n < record.length; n++) {
        idList.push(record[n].id)
      }
      if (checkedValues.length < 1) {
        for (let i = 0; i < idList.length; i++) {
          if (this.defalutCheckList.indexOf(idList[i]) !== -1) {
            this.defalutCheckList.splice(this.defalutCheckList.indexOf(idList[i]), 1)
          }
        }
      } else {
        for (let h = 0; h < checkedValues.length; h++) {
          if (idList.indexOf(checkedValues[h]) !== -1) {
            idList.splice(idList.indexOf(checkedValues[h]), 1)
            for (let a = 0; a < idList.length; a++) {
              if (this.defalutCheckList.indexOf(idList[a]) !== -1) {
                this.defalutCheckList.splice(this.defalutCheckList.indexOf(idList[a]), 1)
              }
            }
            if (this.defalutCheckList.indexOf(checkedValues[h]) === -1) {
              this.defalutCheckList.push(checkedValues[h])
            }
          }
        }
      }
    },
    // 提交
    commitResult (e) {
      const _this = this
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.openType === 0) {
            createPer({
              name: _this.form.getFieldsValue().userName,
              secondary: _this.commitSubId,
              permission: _this.defalutCheckList
            }).then(res => {
              if (res.status === 200) {
                _this.$message.success('操作成功')
                _this.$emit('getBaseContent')
                _this.closePop()
              } else {
                _this.$message.warning(res.message)
              }
            })
          } else {
            editPer({
              id: _this.id,
              name: _this.form.getFieldsValue().userName,
              secondary: _this.commitSubId,
              permission: _this.defalutCheckList
            }).then(res => {
              if (res.status === 200) {
                _this.$message.success('操作成功')
                _this.$emit('getBaseContent')
                _this.closePop()
              } else {
                _this.$message.warning(res.message)
              }
            })
          }
        }
      })
      // console.log(this.commitSubId)
    }
  },
  created () {
    const _this = this
    if (this.openType === 0) {
      this.$nextTick(() => {
        this.form.setFieldsValue({
          userName: ''
        })
      })
      getRoleInfo().then(res => {
        this.loadData = this.serialization(
          res.data.sort((a, b) => {
            return a.id - b.id
          })
        )
        console.log(this.loadData)
      })
    } else if (this.openType === 1) {
      this.$nextTick(() => {
        this.form.setFieldsValue({
          userName: _this.checkRoleName
        })
      })
      getRoleInfo({
        role: this.id
      }).then(res => {
        this.defalutCheckList = res.permissionId
        this.commitSubId = res.second
        this.loadData = this.serialization(
          res.data.sort((a, b) => {
            return a.id - b.id
          })
        )
        console.log(this.loadData)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.model-pop {
  width: auto;
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
