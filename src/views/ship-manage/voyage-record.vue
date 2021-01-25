<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select" v-show="!isShowChild">
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
            <a-input placeholder="请输入船主/船管姓名/手机号" v-model="inputDetail" />
          </div>
          <template v-if="advanced">
            <div class="input-item">
              <span class="input-title">登船时间：</span>
              <a-date-picker @change="departureTimeChange" v-model="departure_time" style="width: 100%" placeholder="请选择" />
            </div>
            <div class="input-item">
              <span class="input-title">下船时间：</span>
              <a-date-picker @change="returnTimeChange" v-model="return_time" style="width: 100%" placeholder="请选择" />
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
      <a-radio-group v-model="status" style="margin-bottom:20px" @change="radioChange">
        <a-radio-button value="1">全部</a-radio-button>
        <a-radio-button value="0">已出港</a-radio-button>
        <!-- <a-radio-button value="waiting">等待中</a-radio-button> -->
      </a-radio-group>
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
      >
        <!-- <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span> -->

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看</a>
            <!-- <a-divider type="vertical" /> -->
            <!-- <a @click="handleSub(record)">订阅报警</a> -->
          </template>
        </span>
      </a-table>
    </a-card>
    <transition name="slide-fade">
    <recordPop v-if="isShowChild" @closePop="closePop" :id="checkId"></recordPop>
    </transition>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getVoyaeRecord, getAllDep } from '@/api/ship-api'
import recordPop from './components/recordPop'
const columns = [
  {
    title: 'ID',
     dataIndex: 'device_id',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '船名',
    dataIndex: 'boat_name'
  },
  {
    title: '主管部门',
    dataIndex: 'competent_department',
    scopedSlots: { customRender: 'competent_department' }
  },
  {
    title: '报备人',
    dataIndex: 'owner_name',
    sorter: false,
    needTotal: false
  },
  {
    title: '登船时间',
    dataIndex: 'departure_time',
    sorter: false
  },
  {
    title: '下船时间',
    dataIndex: 'return_time',
    sorter: false
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]
export default {
  components: {
    STable,
    recordPop
  },
  data () {
    this.columns = columns
    return {
      status: '1',
      advanced: false, // 高级搜索 展开/关闭
      loadData: [],
      visible: false,
      confirmLoading: false,
      mdl: null,
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
      isShowChild: false, // 显示子组件
      departure_time: '', // 上船时间
      return_time: '', // 下船时间
      depId: undefined, // 部门ID
      checkId: '', // 选择查看的ID
      inputDetail: '', // 搜索信息
      cascaderList: [] // 选中的ID
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
      this.checkId = record.id
      console.log(record)
      this.isShowChild = true
    },
    closePop () {
      this.isShowChild = false
    },
    // 获取列表信息
    getBaseContent () {
      const _this = this
      getVoyaeRecord({
        page: this.queryParam.page,
        department: _this.depId,
        info: _this.inputDetail,
        return_time: this.return_time,
        departure_time: this.departure_time,
        genre: this.status,
        limit: 10
      }).then(res => {
        // res.data.pageSize = 10
        // res.data.pageNo = res.data.page
        // res.data.totalPage = res.data.count % 10 < 1 ? 1 : res.data.count % 10
        // res.data.totalCount = res.data.count
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        this.loadData = res.data
      })
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
    // 多条选择
    onSelectChange (selectedRowKeys) {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      this.selectedRowKeys = selectedRowKeys
    },
    // 上船时间选择
    departureTimeChange (date, dateString) {
      this.departure_time = dateString
    },
    // 下船时间选择
    returnTimeChange (date, dateString) {
      this.return_time = dateString
    },
    // 列表类型选择
    radioChange (e) {
      this.status = e.target.value
      this.pagination.current = 1
      this.queryParam.page = 1
      this.return_time = ''
      this.departure_time = ''
      this.inputDetail = ''
      this.getBaseContent()
    },
    // 点击分页触发
    handleTableChange (pagination) {
      // this.pagination.current = pagination.current
      // this.pagination.pageSize = pagination.pageSize
      this.queryParam.page = pagination.current
      // this.queryParam.size = pagination.pageSize
      this.getBaseContent()
    },
    // 重置
    reset () {
      this.inputDetail = ''
      this.departure_time = null
      this.return_time = null
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
.slide-fade-enter-active {
  transition: all .4s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  transform: translateX(10px);
  opacity: 0;
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
