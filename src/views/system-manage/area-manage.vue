<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select" v-if="!isShowModelPop">
      <div class="nav-box">
        <div class="input-list">
          <div class="input-item">
            <span class="input-title">港口名称：</span>
            <a-select style="width: 100%" placeholder="请选择" @change="levelChange" v-model="level">
              <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in levelList" :key="levelIndex">{{
                levelItem.name
              }}</a-select-option>
            </a-select>
          </div>
          <!-- <div class="input-item">
            <span class="input-title">预警等级：</span>
            <a-select style="width: 100%" placeholder="请选择" @change="levelChange" v-model="level">
              <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in levelList" :key="levelIndex">{{
                levelItem.name
              }}</a-select-option>
            </a-select>
          </div>
          <template v-if="advanced">
            <div class="input-item">
              <span class="input-title">预警媒体：</span>
              <a-select style="width: 100%" placeholder="请选择" v-model="mediaSms">
                <a-select-option value="0">系统通知</a-select-option>
                <a-select-option value="1">短信通知</a-select-option>
              </a-select>
            </div>
            <div class="input-item">
              <span class="input-title">状态 ：</span>
              <a-select style="width: 100%" placeholder="请选择" v-model="fenceState">
                <a-select-option value="2">全部</a-select-option>
                <a-select-option value="0">关闭</a-select-option>
                <a-select-option value="1">开启</a-select-option>
              </a-select>
            </div>
            <div class="input-item">
              <span class="input-title">启用开始时间：</span>
              <a-date-picker
                @change="departureTimeChange"
                v-model="startTime"
                style="width: 100%"
                placeholder="请选择"
              />
            </div>
            <div class="input-item">
              <span class="input-title">启用结束时间：</span>
              <a-date-picker @change="returnTimeChange" v-model="endTime" style="width: 100%" placeholder="请选择" />
            </div>
          </template> -->
        </div>
        <div class="btn-list">
          <a-button type="primary" style="margin-right: 10px" @click="searchBaseContent">查询</a-button>
          <a-button @click="reset">重置</a-button>
          <!-- <a @click="toggleAdvanced" style="margin-left: 8px">
            {{ advanced ? '收起' : '展开' }}
            <a-icon :type="advanced ? 'up' : 'down'" />
          </a> -->
        </div>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="createNewItem">新建</a-button>
        <a-button @click="delAll">批量删除</a-button>
      </div>
      <div class="top-bg">
        <template>
          {{ `已选中 ${selectedRowKeys.length} ` }}
        </template>
      </div>
      <a-table
        :columns="columns"
        :data-source="loadData"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :rowKey="record => record.id"
        @change="handleTableChange"
              :pagination="pagination"
        alert="true"
      >
        <span slot="latAndLng" slot-scope="text, record">
          {{ `(${record.lat},${record.lng})` }}
        </span>
        <span slot="sms" slot-scope="text, record">
            <a-switch :defaultChecked="record.sms == 1 ? true:false" @change="contactChange($event, record)"/>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">详情</a>
            <a-divider type="vertical" />
            <a @click="delItem(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
    <modelPop
      v-if="isShowModelPop"
      @closePop="closePop"
      :id="checkFenceId"
      @getBaseContent="getBaseContent"
      :openType="openType"
    ></modelPop>
  </page-header-wrapper>
</template>

<script>
import { getArea, getAllHarbour, editSms, delArea } from '@/api/systemManage-api'
import modelPop from './components/modelPop'
const columns = [
      {
    title: '区域名称',
    align: 'center',
    dataIndex: 'name'
  },
  {
    title: '港口名称',
    align: 'center',
    dataIndex: 'harbour',
    scopedSlots: { customRender: 'harbour' }
  },

  {
    title: '区域范围',
    dataIndex: 'range',
    align: 'center',
    scopedSlots: { customRender: 'range' }
  },
    {
    title: '经纬度',
    dataIndex: 'latAndLng',
    align: 'center',
    scopedSlots: { customRender: 'latAndLng' }
  },
      {
    title: '短信通知',
    dataIndex: 'sms',
    align: 'center',
    scopedSlots: { customRender: 'sms' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    align: 'center',
    scopedSlots: { customRender: 'action' }
  }
]
export default {
    components: {
modelPop
    },
  data () {
    this.columns = columns
    return {
      status: 'all',
      advanced: false, // 高级搜索 展开/关闭
      loadData: [],
      visible: false,
      confirmLoading: false,
      mdl: null,
      isShowModelPop: false,
      fenceInput: '', // 围栏名称
      level: undefined, // 预警等级
      mediaSms: undefined, // 预警媒体
      fenceState: undefined, // 状态
      startTime: null, // 开始时间
      endTime: null, // 结束时间
      limit: 10, // 限制一次请求几条数据
      pagination: {
        current: 1, // 当前指示器选中第几页
        total: 0,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10'] // 每页中显示的数据
      },
      queryParam: {
        page: 1, // 第几页
        size: 10, // 每页中显示数据的条数
        hosName: ' ',
        hosCode: '',
        province: '',
        city: ''
      },
      levelList: [
      ], // 预警等级集合
      selectedRowKeys: [],
      cascaderList: [], // 主管部门集合
      checkFenceId: 0, // 选中需要查询的围栏ID
      openType: 0 // 打开类型， 0是新建  1是详情
    }
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 批量删除
    delAll () {
      const _this = this
      this.$confirm({
        title: '你想批量删除选中的信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '是',
        cancelText: '否',
        onOk () {
          delArea({
            id: _this.selectedRowKeys
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('删除成功')
              _this.getBaseContent()
            } else {
              _this.$message.success(res.message)
            }
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    // 新建
    createNewItem () {
      this.openType = 0
      this.isShowModelPop = true
    },
    // 详情
    handleEdit (record) {
      this.openType = 1
      this.checkFenceId = record.id
      this.isShowModelPop = true
    },
    // 删除
    delItem (record) {
      const _this = this
      this.$confirm({
        title: '你想删除选中的信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '是',
        cancelText: '否',
        onOk () {
          delArea({
            id: [record.id]
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('删除成功')
              _this.getBaseContent()
            } else {
              _this.$message.success(res.message)
            }
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    closePop () {
      this.isShowModelPop = false
    },
    // 获取基础列表信息
    getBaseContent () {
      const _this = this
      getArea({
          harbour: this.level,
          limit: 10,
          page: this.queryParam.page
      }).then(res => {
        if (res.status === 200) {
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
           this.loadData = res.data.data
        } else {
            this.$message.warning(res.message)
        }
      })
    },
    searchBaseContent () {
      this.pagination.current = 1
      this.queryParam.page = 1
      this.getBaseContent()
    },
    // 多条选择
    onSelectChange (selectedRowKeys) {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
    },
    // 点击分页触发
    handleTableChange (pagination) {
      // this.pagination.current = pagination.current
      // this.pagination.pageSize = pagination.pageSize
      this.queryParam.page = pagination.current
      // this.queryParam.size = pagination.pageSize
      this.getBaseContent()
    },
    // 预警等级选择
    levelChange (value) {
      this.level = value
    },
    // 上船时间选择
    departureTimeChange (date, dateString) {
      this.startTime = dateString
    },
    // 下船时间选择
    returnTimeChange (date, dateString) {
      this.endTime = dateString
    },
    // 重置
    reset () {
      this.fenceInput = ''
      this.startTime = null
      this.endTime = null
      this.fenceState = undefined
      this.mediaSms = undefined
      this.level = undefined
      this.getBaseContent()
    },
    getHarbourList () {
        getAllHarbour().then((res) => {
            this.levelList = res.data
        })
    },
        // 联络人设置
    contactChange (checked, record) {
      editSms({
        id: record.id,
        sms: checked ? '1' : '0'
      }).then((res) => {
        if (res.status === 200) {
          this.$message.success('设置成功')
        }
      })
    }
  },
  mounted () {
    this.getHarbourList()
    this.getBaseContent()
  }
}
</script>

<style lang="less" scoped>
.nav-box {
  width: 100%;
  display: flex;
  .input-list {
    display: flex;
    flex: 4;
    align-items: center;
    flex-wrap: wrap;
    .input-item {
      width: 41%;
      display: flex;
      align-items: center;
      margin-right: 70px;
      margin-bottom: 20px;
      .input-detail {
        width: 80% !important;
      }
      .input-title {
        flex-shrink: 0;
      }
    }
  }
  .btn-list {
    flex: 1;
  }
}
.top-bg {
  width: 100%;
  height: 40px;
  background: rgb(230, 248, 255);
  display: flex;
  align-self: center;
  padding-left: 20px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 40px;
  margin-bottom: 18px;
}
</style>
