<template>
  <page-header-wrapper :title="false">
    <div>
      <a-card style="padding:40px 0">
        <div class="detail-info-box">
          <div class="detail-info-item">
            <span class="input-title">预警类型：</span>
            <a-select style="width: 100%" placeholder="请选择" @change="warningChange" v-model="warningType">
              <a-select-option value="1">离线预警</a-select-option>
              <a-select-option value="2">低电量预警</a-select-option>
              <a-select-option value="3">充电异常预警</a-select-option>
              <a-select-option value="4">破拆预警</a-select-option>
            </a-select>
          </div>
          <div class="detail-info-item">
            <span class="input-title">预警名称：</span>
            <a-input placeholder="给类型起个名字" v-model="warningName" style="width:100%" />
          </div>
          <div class="detail-info-item">
            <span class="input-title">预警媒体：</span>
            <a-checkbox-group v-model="checkValue">
              <a-checkbox value="0" disabled defaultChecked>
                系统
              </a-checkbox>
              <a-checkbox value="1" defaultChecked>
                短信
              </a-checkbox>
            </a-checkbox-group>
          </div>
          <!-- <div class="detail-info-item">
            <span class="input-title">预警内容：</span>
            <div class="textarea-box">
              <a-textarea rows="3" />
            </div>
          </div> -->
          <div class="detail-info-item">
            <span class="input-title">接收人：</span>
            <a-checkbox-group :options="recipientList" @change="recipientChange" v-model="defalutCheckList">
            </a-checkbox-group>
          </div>
          <div class="detail-info-item">
            <a-button class="detail-btn" type="primary" @click="commitData">提交</a-button>
            <a-button>取消</a-button>
          </div>
        </div>
      </a-card>
    </div>
  </page-header-wrapper>
</template>

<script>
import { warningTypeCommit, getWarningEdit } from '@/api/electronic-api'
export default {
  data () {
    return {
      checkValue: ['0'],
      warningType: '1',
      warningName: '', // 预警名称
      recipientList: [
        {
          label: '市局',
          value: '001',
          isCheck: 0,
          defaultCheck: true
        },
        {
          label: '分局',
          value: '002',
          isCheck: 0,
          defaultCheck: false
        },
        {
          label: '派出所',
          value: '003',
          isCheck: 0,
          defaultCheck: false
        }
      ], // 接收人列表
      recipientCheckValus: [], // 接收人选中结果
      defalutCheckList: []
    }
  },
  methods: {
    mediaChange (e) {
      console.log(e)
    },
    // 预警类型选择
    warningChange (value) {
      this.warningType = value
      this.getBaseContent()
    },
    // 接收人选择事件
    recipientChange (checkedValues) {
      this.recipientCheckValus = checkedValues
      console.log(this.recipientCheckValus)
    },
    // 提交数据
    commitData () {
      const _this = this
      if (this.warningName === '') {
        this.$message.info('预警名称尚未填写')
        return
      } else if (this.level === null) {
        this.$message.info('预警类型尚未选择')
        return
      } else if (this.recipientCheckValus.length < 1) {
         this.$message.info('未选择接收人')
        return
      }
        warningTypeCommit('equipment/edit/' + this.warningType, {
        name: _this.warningName,
        level: Number(_this.warningType),
        sms: _this.checkValue.length > 1 ? 1 : 0,
        city: _this.recipientCheckValus.indexOf('001') > -1 ? 1 : 0,
        area: _this.recipientCheckValus.indexOf('002') > -1 ? 1 : 0,
        station: _this.recipientCheckValus.indexOf('003') > -1 ? 1 : 0
      }).then((res) => {
        this.$message.success('提交成功')
        this.getBaseContent()
      })
      // console.log(_this.recipientCheckValus.indexOf('002'))
    },
    getBaseContent () {
      this.defalutCheckList = []
      getWarningEdit('/equipment/edit/' + this.warningType).then((res) => {
        this.warningName = res.data.data.name
                if (res.data.data.city === 1) {
          this.defalutCheckList.push('001')
          this.recipientCheckValus.push('001')
        }
        if (res.data.data.area === 1) {
          this.defalutCheckList.push('002')
          this.recipientCheckValus.push('002')
        }
        if (res.data.data.station === 1) {
          this.defalutCheckList.push('003')
          this.recipientCheckValus.push('003')
        }
        if (res.data.data.sms === 1) {
          this.checkValue.push('1')
        }
      })
    }
  },
  mounted () {
    this.getBaseContent()
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-card-body {
  padding: 0;
}
.menu-list {
  display: flex;
  flex-direction: column;
  .menu-item-box {
    display: flex;
    padding: 14px 0 14px 20px;
    box-sizing: border-box;
    cursor: pointer;
    margin-bottom: 10px;
    &:hover {
      color: #1890ff;
    }
  }
  .menu-item-check {
    border-right: 2px solid #1890ff;
    background-color: #e6f7ff;
    color: #1890ff;
  }
}
.detail-info-box {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  .detail-info-item {
    width: 50%;
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    .textarea-box {
      width: 100%;
    }
    .input-title {
      flex-shrink: 0;
      margin-right: 10px;
    }
  }
}
.detail-btn {
  margin-left: 100px;
  margin-right: 20px;
}
</style>
