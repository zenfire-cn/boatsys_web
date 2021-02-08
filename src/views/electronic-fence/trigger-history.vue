<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" style="margin-bottom:20px">
      <a-row>
        <a-col :sm="8" :xs="24">
          <info title="今日触发(次)" :value="record_count.today + ''" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="本月触发(次)" :value="record_count.month + ''" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="累计触发(次)" :value="record_count.all + ''" />
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
              <span class="input-title">触发围栏：</span>
              <a-select style="width: 100%" placeholder="请选择" @change="fenceChange" v-model="fenceId">
                <a-select-option :value="fenceItem.id" v-for="(fenceItem, fenceIndex) in fenceList" :key="fenceIndex">{{ fenceItem.name }}</a-select-option>
              </a-select>
            </div>
            <div class="input-item">
              <span class="input-title">预警等级：</span>
              <a-select style="width: 100%" placeholder="请选择" @change="levelChange" v-model="level">
                <a-select-option :value="levelItem.id" v-for="(levelItem, levelIndex) in levelList" :key="levelIndex">{{ levelItem.name }}</a-select-option>
              </a-select>
            </div>
            <div class="input-item">
              <span class="input-title">触发时间：</span>
              <a-date-picker @change="eventStartChange" v-model="event_start" style="width: 100%" placeholder="请选择" />
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
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <a-table
          slot="expandedRowRender"
          slot-scope="record"
          :columns="innerColumns"
          :data-source="record.baseInfo"
          :pagination="false"
          @change="handleTableChange"
        >
        </a-table>

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
import { getTrigger } from '@/api/electronic-api'
import { getAllDep, exportExcel } from '@/api/ship-api'
import Info from '../list/components/Info'
const columns = [
  {
    title: 'ID',
    dataIndex: 'device_id',
    scopedSlots: { customRender: 'device_id' }
  },
  {
    title: '船名',
     align: 'center',
    dataIndex: 'boat_name'
  },
  {
    title: '主管部门',
    dataIndex: 'parent_department',
     align: 'center',
    scopedSlots: { customRender: 'parent_department' }
  },
  {
    title: '触发围栏',
    dataIndex: 'fence',
    sorter: false,
    needTotal: false,
     align: 'center'
  },
  {
    title: '预警等级',
    dataIndex: 'level',
    sorter: true,
    align: 'center',
    scopedSlots: { customRender: 'level' }
  },
  {
    title: '触发时间',
    dataIndex: 'event_time',
    sorter: true,
    align: 'center'
  }
  // {
  //   title: '详情',
  //   dataIndex: 'description',
  //   scopedSlots: { customRender: 'description' }
  // }
  // {
  //   title: '操作',
  //   dataIndex: 'action',
  //   width: '150px',
  //   scopedSlots: { customRender: 'action' }
  // }
]
const statusMap = {
  0: {
    status: 'default',
    text: 'Ⅰ级'
  },
  1: {
    status: 'processing',
    text: 'Ⅱ级'
  },
  2: {
    status: 'success',
    text: 'Ⅲ级'
  },
  3: {
    status: 'error',
    text: 'Ⅳ级'
  }
}
const innerColumns = [
  {
    title: '经度',
    align: 'center',
    dataIndex: 'latitude'
  },
    {
    title: '纬度',
    align: 'center',
    dataIndex: 'longitude'
  },
  {
    title: '航向',
    align: 'center',
    dataIndex: 'course'
  },
  {
    title: '航速',
    align: 'center',
    dataIndex: 'speed'
  },
    {
    title: '电量',
    align: 'center',
    dataIndex: 'electricity'
  }
]
export default {
  components: {
    Info
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  data () {
    this.columns = columns
    this.innerColumns = innerColumns
    return {
      status: 'all',
      advanced: false, // 高级搜索 展开/关闭
      loadData: [],
      visible: false,
      confirmLoading: false,
      mdl: null,
      depId: undefined, // 部门ID
      info: '', // 详细信息
      fenceId: undefined, // 围栏ID
      level: undefined, // 等级
      event_start: '', // 触发时间
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
        {
          value: 'Ⅰ级',
          name: 'Ⅰ级',
          id: 1
        },
        {
          value: 'Ⅱ级',
          name: 'Ⅱ级',
          id: 2
        },
        {
          value: 'Ⅲ级',
          name: 'Ⅲ级',
          id: 3
        },
        {
          value: 'Ⅳ级',
          name: 'Ⅳ级',
          id: 4
        },
        {
          value: 'Ⅴ级',
          name: 'Ⅴ级',
          id: 5
        }
      ], // 预警等级集合
      selectedRowKeys: [],
      fenceList: [], // 围栏集合
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
      getTrigger({
        department: _this.depId,
        info: _this.info,
        fence: _this.fenceId,
        level: _this.level,
        event_start: _this.event_start,
        limit: _this.limit,
        page: _this.queryParam.page
      }).then((res) => {
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        this.record_count = res.data.record_count
        for (let n = 0; n < res.data.data.length; n++) {
          res.data.data[n].baseInfo = []
          res.data.data[n].baseInfo.push({ longitude: res.data.data[n].lng,
          latitude: res.data.data[n].lat,
          speed: res.data.data[n].speed + 'km/h',
          electricity: res.data.data[n].electricity,
          course: res.data.data[n].course + '°' })
          // res.data.data[n].baseInfo.speed = res.data.data[n].speed
          // res.data.data[n].baseInfo.course = res.data.data[n].course
        }
        console.log(res.data.data)
        this.loadData = res.data
        this.fenceList = res.data.fence
      })
    },
    // 导出数据
    exportData () {
      exportExcel('/electronic/trigger/export').then((res) => {
        window.open(res.data)
        // this.exportList = res.data
      })
    },
    // 主管部门选择
    casChange (value) {
      console.log(value)
      this.depId = value.slice(-1)[0]
    },
    // 预警等级选择
    levelChange (value) {
      this.level = value
    },
    // 围栏选择
    fenceChange (value) {
      this.fenceId = value
      // console.log(this.fenceId)
    },
    // 多条选择
    onSelectChange (selectedRowKeys) {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
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
    // 触发时间选择
    eventStartChange (date, dateString) {
      this.event_start = dateString
    },
    searchBaseContent () {
      this.pagination.current = 1
      this.queryParam.page = 1
      this.getBaseContent()
    },
    // 重置
    reset () {
      this.info = ''
      this.fenceId = undefined
      this.level = undefined
      this.depId = 0
      this.event_start = null
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
