<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select" v-if="!isShowModelPop">
      <div class="nav-box">
        <div class="input-list">
          <div class="input-item">
            <span class="input-title">围栏名称：</span>
            <a-input v-model="fenceInput" placeholder="请输入" />
          </div>
          <div class="input-item">
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
          {{ text == 0 ? '关闭' : '开启' }}
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
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
import { STable, Ellipsis } from '@/components'
import { getRoleList, getServiceList } from '@/api/manage'
import { getModelList, delFence } from '@/api/electronic-api'
import Info from '../list/components/Info'
import modelPop from './components/modelPop'
const columns = [
  {
    title: '围栏名称',
    align: 'center',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '预警等级',
    align: 'center',
    dataIndex: 'level'
  },
  {
    title: '预警媒体',
    dataIndex: 'media',
    align: 'center',
    scopedSlots: { customRender: 'media' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    align: 'center',
    scopedSlots: { customRender: 'status' },
    sorter: false,
    needTotal: true
  },
  {
    title: '启用开始时间',
    dataIndex: 'begin_date',
    align: 'center',
    sorter: false
  },
  {
    title: '启用结束时间',
    align: 'center',
    dataIndex: 'end_date',
    sorter: false
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
    STable,
    Ellipsis,
    Info,
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
          delFence({
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
          delFence({
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
      getModelList({
        name: _this.fenceInput,
        level: _this.level,
        sms: _this.mediaSms,
        status: _this.fenceState,
        start: _this.startTime,
        end: _this.endTime,
        limit: _this.limit,
        page: _this.queryParam.page
      }).then(res => {
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        this.loadData = res.data
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
    }
  },
  mounted () {
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
