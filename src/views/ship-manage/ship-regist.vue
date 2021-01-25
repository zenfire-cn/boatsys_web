<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select" v-show="!isShowEditPop">
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
              <a-tree-select-node
                v-for="(firstItem, firstIndex) in cascaderList[0]"
                :key="'first' + firstIndex"
                :value="firstItem.id"
                :title="firstItem.name"
              >
                <a-tree-select-node
                  v-for="(secondItem, secondIndex) in firstItem.area"
                  :key="'second' + secondIndex"
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
          </div>
          <div class="input-item">
            <span class="input-title">详细信息：</span>
            <a-input placeholder="请输入船主/船管姓名/手机号" v-model="inputDetail" />
          </div>
          <!-- <template v-if="advanced">
            <div class="input-item">
              <span class="input-title">登船时间：</span>
              <a-date-picker style="width: 100%" placeholder="请选择" />
            </div>
            <div class="input-item">
              <span class="input-title">下船时间：</span>
              <a-date-picker style="width: 100%" placeholder="请选择" />
            </div>
          </template> -->
        </div>
        <div class="btn-list">
          <a-button type="primary" style="margin-right: 10px" @click="searchContent">查询</a-button>
          <a-button @click="reset">重置</a-button>
          <!-- <a @click="toggleAdvanced" style="margin-left: 8px">
            {{ advanced ? '收起' : '展开' }}
            <a-icon :type="advanced ? 'up' : 'down'" />
          </a> -->
        </div>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="createShip">新建</a-button>
        <a-button @click="allDelete">批量删除</a-button>
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
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">详情</a>
            <a-divider type="vertical" />
            <a @click="handleSub(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
    <transition name="slide-fade">
      <editPop v-if="isShowEditPop" @closePop="closePop" :id="checkId" :type="btnType" @getBaseContent="getBaseContent"></editPop>
    </transition>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getRegister, getAllDep, deleteShip } from '@/api/ship-api'
import editPop from './components/edit-pop'

const columns = [
  {
    title: 'ID',
    dataIndex: 'device_id',
    sorter: true
  },
  {
    title: '船名',
    dataIndex: 'boat_name'
  },
  {
    title: '主管部门',
    dataIndex: 'competent_department'
  },
  // {
  //   title: '描述',
  //   dataIndex: 'competent_department',
  //   scopedSlots: { customRender: 'competent_department' }
  // },
  {
    title: '船籍港',
    dataIndex: 'harbour',
    sorter: false,
    needTotal: false
  },
  {
    title: '船主姓名',
    dataIndex: 'owner_name',
    sorter: false,
    needTotal: false
  },
  {
    title: '船主手机号',
    dataIndex: 'owner_phone',
    sorter: false,
    needTotal: false
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
    editPop
  },
  data () {
    this.columns = columns
    return {
      status: 'all',
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
      current: 1,
      visible: false,
      confirmLoading: false,
      mdl: null,
      isShowEditPop: false, // 是否打开详情弹窗
      checkId: '', // 选中的ID
      cascaderList: [], // 选中的ID
      depId: undefined, // 选择的主管部门ID
      inputDetail: '', // 详细信息
      btnType: 0 // 0新建 1详情
    }
  },
  computed: {
    hasSelected () {
      return this.selectedRowKeys.length > 0
    }
  },
  methods: {
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 批量删除
    allDelete () {
      const _this = this
      if (this.selectedRowKeys.length > 0) {
          this.$confirm({
        title: '你想批量删除选中的信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '否',
        cancelText: '是',
        onOk () {},
        onCancel () {
          deleteShip('/ship/shipDel', {
            id: _this.selectedRowKeys
          }).then(res => {
            _this.$message.success('删除成功', 3)
            _this.getBaseContent()
          })
        }
      })
      } else {
        _this.$message.warning('未勾选任何数据', 3)
      }
      console.log(this.selectedRowKeys)
    },
    // 新建船只
    createShip () {
      this.checkId = -1
      this.btnType = 0
      this.isShowEditPop = true
    },
    // 打开详情弹窗
    handleEdit (record) {
      this.checkId = record.id
      this.btnType = 1
      this.isShowEditPop = true
    },
    // 删除
    handleSub (record) {
      const _this = this
      this.$confirm({
        title: '你想删除此条信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '是',
        cancelText: '否',
        onOk () {
          deleteShip('/ship/shipDel', {
            id: [record.id]
          }).then(res => {
            _this.$message.success('删除成功', 3)
            _this.getBaseContent()
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    // 关闭详情弹窗
    closePop () {
      this.isShowEditPop = false
    },
    // 主管部门选择
    casChange (value) {
      this.depId = value.slice(-1)[0]
    },
    // 获取列表
    getBaseContent () {
      const _this = this
      getRegister({
        page: this.queryParam.page,
        department: _this.depId,
        info: _this.inputDetail,
        limit: 10
      }).then(res => {
        // res.data.pageSize = 10
        // res.data.pageNo = res.data.page
        // res.data.totalPage = res.data.count % 10 < 1 ? 1 : res.data.count % 10
        // res.data.totalCount = res.data.count
          if (res.status === 200) {
                    this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        this.loadData = res.data
        console.log(this.loadData)
          } else {
            this.$message.warning(res.message)
          }
      })
    },
    // 根据条件筛选内容
    searchContent () {
      this.queryParam.page = 1
      this.pagination.current = 1
      this.getBaseContent()
    },
    // 全选操作
    onSelectChange (selectedRowKeys) {
      // console.log('selectedRowKeys changed: ', selectedRowKeys)
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
    // 重置
    reset () {
      this.depId = undefined
      this.inputDetail = ''
      this.getBaseContent()
    }
  },
  mounted () {
    this.getBaseContent()
    getAllDep().then(res => {
      if (res.status === 200) {
        this.cascaderList = res.data
      } else {
        this.$message.warning(res.message)
      }
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
  transition: all 0.4s ease;
}
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
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
