<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <div class="nav-box">
        <div class="input-list">
          <div class="input-item">
            <span class="input-title">主管部门：</span>
            <!-- <a-select style="width: 100%" placeholder="请选择" default-value="0">
              <a-select-option value="0">全部</a-select-option>
              <a-select-option value="1">关闭</a-select-option>
              <a-select-option value="2">运行中</a-select-option>
            </a-select> -->
            <!-- <a-cascader :options="cascaderList" ref="dep" placeholder="请选择" @change="casChange" style="width: 100%" /> -->
            <a-tree-select
              v-model="depId"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
            >
              <a-tree-select-node v-for="(firstItem,firstIndex) in cascaderList[0]" :key="'first' + firstIndex" :value="firstItem.id" :title="firstItem.name">
                <a-tree-select-node v-for="(secondItem,secondIndex) in firstItem.area" :key="'second' + secondIndex" :value="secondItem.id" :title="secondItem.name">
                  <a-tree-select-node v-for="(threeItem,threeIndex) in secondItem.station" :key="threeIndex" :value="threeItem.id" :title="threeItem.name">
                  </a-tree-select-node>
                </a-tree-select-node>
              </a-tree-select-node>
            </a-tree-select>
          </div>
          <div class="input-item">
            <span class="input-title">船舶信息：</span>
            <a-input v-model="inputDetail" placeholder="请输入ID/船名" />
          </div>
          <template v-if="advanced">
            <div class="input-item">
              <span class="input-title">船员信息：</span>
              <a-input v-model="shipPeopleDetail" placeholder="请输入船主/船管姓名/手机号" />
            </div>
            <div class="input-item">
              <span class="input-title">离岗时间：</span>
              <a-date-picker v-model="departure_time" @change="departureTimeChange" style="width: 100%" placeholder="请选择" />
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
        <!-- <download-excel :data="exportList" :fields="exportFields" name="filename.xls" >
        </download-excel> -->
          <a-button type="primary" icon="download" @click="exportData">导出</a-button>
        <!-- <a-button @click="handleAdd">打印</a-button> -->
      </div>
            <!-- <div class="top-bg">
        <template>
          {{ `已选中 ${selectedRowKeys.length} ` }}
        </template>
      </div> -->
      <a-table
        :columns="columns"
        :data-source="loadData.data"
        :pagination="pagination"
        @change="handleTableChange"
        alert="true"
      >
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
import { getReportedInfo, getAllDep, exportExcel } from '@/api/ship-api'
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
    dataIndex: 'competent_department',
    scopedSlots: { customRender: 'competent_department' }
  },
  {
    title: '船主',
    align: 'center',
    dataIndex: 'owner_name',
    sorter: false,
    needTotal: false
    // customRender: text => text + ' 次'
  },
      {
    title: '联系电话',
    align: 'center',
    dataIndex: 'owner_phone',
    sorter: false
  },
  {
    title: '离岗时间',
    align: 'center',
    dataIndex: 'departure_time',
    sorter: false
  }

  // {
  //   title: '操作',
  //   dataIndex: 'action',
  //   width: '150px',
  //   scopedSlots: { customRender: 'action' }
  // }
]
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
  }
]
export default {
  data () {
    this.columns = columns
    this.innerColumns = innerColumns
    return {
      advanced: false, // 高级搜索 展开/关闭
      loadData: [],
      selectedRowKeys: [],
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
      visible: false,
      confirmLoading: false,
      mdl: null,
      departure_time: null, // 上船时间
      return_time: '', // 下船时间
      depId: undefined, // 部门ID
      checkId: '', // 选择查看的ID
      inputDetail: '', // 搜索信息
      shipPeopleDetail: '', // 船员信息
      cascaderList: [], // 选中的ID
      exportFields: {
        'id': 'id',
        '船名': 'boat_name',
        '主管部门': 'department',
        '船主': 'owner_name',
        '电话': 'owner_phone',
        '离岗时间': 'departure_time'
      },
      exportList: []
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
    // 导出数据
    exportData () {
      exportExcel('/ship/no-reported/export').then((res) => {
        window.open(res.data)
        // this.exportList = res.data
      })
    },
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
    },
    // 获取基础信息
    getBaseContent () {
      const _this = this
      getReportedInfo({
        page: this.queryParam.page,
        department: _this.depId,
        owner: _this.shipPeopleDetail,
        info: _this.inputDetail,
        departure_time: _this.departure_time,
        limit: 10
      }).then((res) => {
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        for (let n = 0; n < res.data.data.length; n++) {
          res.data.data[n].baseInfo = []
          res.data.data[n].baseInfo.push({ longitude: res.data.data[n].longitude,
          latitude: res.data.data[n].latitude,
          speed: res.data.data[n].speed + 'km/h',
          course: res.data.data[n].course + '°' })
          // res.data.data[n].baseInfo.speed = res.data.data[n].speed
          // res.data.data[n].baseInfo.course = res.data.data[n].course
        }
        this.loadData = res.data
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
    // 查询列表信息
    searchBaseContent () {
      this.pagination.current = 1
      this.queryParam.page = 1
      this.getBaseContent()
    },
    // 主管部门选择
    casChange (value) {
      this.depId = value.slice(-1)[0]
    },
    // 上船时间选择
    departureTimeChange (date, dateString) {
      this.departure_time = dateString
    },
    // 重置
    reset () {
      this.inputDetail = ''
      this.departure_time = null
      this.shipPeopleDetail = ''
      this.depId = undefined
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
.table-operator{
  display: flex;
  flex-direction: row;
}
</style>
