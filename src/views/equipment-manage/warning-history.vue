<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" style="margin-bottom:20px">
      <a-row>
        <a-col :sm="8" :xs="24">
          <info title="今日预警(次)" :value="record_count.today + ''" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="本月预警(次)" :value="record_count.month + ''" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="累计预警(次)" :value="record_count.all + ''" />
        </a-col>
      </a-row>
    </a-card>
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <div class="nav-box">
        <div class="input-list">
          <div class="input-item">
            <span class="input-title">主管部门：</span>
            <a-tree-select
              v-model="depId"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
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
          </div>
          <div class="input-item">
            <span class="input-title">详细信息：</span>
            <a-input v-model="info" placeholder="请输入船主/船管姓名/手机号" />
          </div>
          <template v-if="advanced">
            <div class="input-item">
              <span class="input-title">预警类型：</span>
              <a-select style="width: 100%" placeholder="请选择" @change="warningChange" v-model="warningType">
                <a-select-option value="1">离线预警</a-select-option>
                <a-select-option value="2">低电量预警</a-select-option>
                <a-select-option value="3">充电异常预警</a-select-option>
                <a-select-option value="4">破拆预警</a-select-option>
              </a-select>
            </div>
            <div class="input-item">
              <span class="input-title">预警时间：</span>
              <a-date-picker style="width: 100%" placeholder="请选择" @change="eventTimeChange" v-model="eventTime" />
            </div>
          </template>
        </div>
        <div class="btn-list">
          <a-button type="primary" style="margin-right: 10px" @click="searchBaseContent">查询</a-button>
          <a-button @click="reset">重置</a-button>
          <a @click="toggleAdvanced" style="margin-left: 8px">
            {{ advanced ? '收起' : '展开' }}
            <a-icon :type="advanced ? 'up' : 'down'" />
          </a>
        </div>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="download" @click="exportData">导出</a-button>
        <!-- <a-button @click="handleAdd">打印</a-button> -->
      </div>
      <div class="top-bg">
        <template>
          {{ `已选中 ${selectedRowKeys.length} ` }}
        </template>
      </div>
      <a-table
        :columns="columns"
        :data-source="loadData.data"
        :pagination="pagination"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :rowKey="record => record.id"
        @change="handleTableChange"
        alert="true"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <!-- <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span> -->
        <p slot="expandedRowRender" slot-scope="record" style="margin: 0">
          实时经纬度：（{{ record.lat }},{{ record.lng }}）
        </p>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看</a>
            <!-- <a-divider type="vertical" /> -->
            <!-- <a @click="handleSub(record)">订阅报警</a> -->
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getRoleList, getServiceList } from '@/api/manage'
import { getAllDep, exportExcel } from '@/api/ship-api'
import { getWarning } from '@/api/electronic-api'
import Info from '../list/components/Info'
const columns = [
  {
    title: 'ID',
    dataIndex: 'device_id',
    align: 'center',
    scopedSlots: { customRender: 'device_id' }
  },
  {
    title: '船名',
    align: 'center',
    dataIndex: 'boat_name'
  },
  {
    title: '主管部门',
    align: 'center',
    dataIndex: 'department',
    scopedSlots: { customRender: 'department' }
  },
  {
    title: '预警类型',
    dataIndex: 'level',
    align: 'center',
    sorter: false,
    needTotal: false
  },
  {
    title: '预警时间',
    dataIndex: 'event_time',
    align: 'center',
    sorter: true
  }
  // {
  //   title: '操作',
  //   dataIndex: 'action',
  //   width: '150px',
  //   scopedSlots: { customRender: 'action' }
  // }
]
export default {
  components: {
    STable,
    Ellipsis,
    Info
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
      depId: undefined, // 部门ID
      info: '', // 详细信息
      warningType: undefined, // 预警类型
      eventTime: null, // 触发时间
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
      selectedRowKeys: [],
      record_count: [], // 顶部数量
      cascaderList: [] // 主管部门集合
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
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    // 获取基础数据
    getBaseContent () {
      const _this = this
      getWarning({
        department: _this.depId,
        info: _this.info,
        level: _this.warningType,
        event: _this.eventTime,
        limit: _this.limit,
        page: _this.queryParam.page
      }).then((res) => {
          _this.loadData = res.data
          _this.record_count = res.data.record_count
          _this.pagination.total = res.data.count
          _this.queryParam.page = res.data.page
          _this.pagination.current = res.data.page
      })
    },
        // 导出数据
    exportData () {
      exportExcel('/equipment/trigger/export').then((res) => {
        window.open(res.data)
        // this.exportList = res.data
      })
    },
    // 点击分页触发
    handleTableChange (pagination) {
      console.log(pagination)
      // this.pagination.current = pagination.current
      // this.pagination.pageSize = pagination.pageSize
      this.queryParam.page = pagination.current
      // this.queryParam.size = pagination.pageSize
      this.getBaseContent()
    },
    // 多条选择
    onSelectChange (selectedRowKeys) {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
    },
    // 主管部门选择
    casChange (value) {
      console.log(value)
      this.depId = value.slice(-1)[0]
    },
    searchBaseContent () {
      this.pagination.current = 1
      this.queryParam.page = 1
      this.getBaseContent()
    },
    // 预警类型选择
    warningChange () {
      this.warningType = value
    },
    // 触发时间选择
    eventTimeChange (date, dateString) {
      this.eventTime = dateString
    },
    // 重置
    reset () {
      this.info = ''
      this.warningType = undefined
      this.eventTime = null
      this.depId = 0
      this.depId = undefined
      this.getBaseContent()
    }
  },
  mounted () {
    this.getBaseContent()
    getAllDep().then(res => {
     this.cascaderList = res.data
    })
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
