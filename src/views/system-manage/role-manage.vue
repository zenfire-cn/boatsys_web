<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" class="ant-pro-components-tag-select" v-if="!isShowEditPop">
      <div class="nav-box">
        <div class="input-list">
          <div class="input-item">
            <span class="input-title">角色名：</span>
            <a-input v-model="searchValue" placeholder="请输入姓名、手机号、邮箱等" />
          </div>
          <!-- <div class="input-item">
            <span class="input-title">描述：</span>
            <a-input placeholder="请输入关键词" />
          </div> -->
        </div>
        <div class="btn-list">
          <a-button type="primary" style="margin-right: 10px" @click="getBaseContent">查询</a-button>
          <a-button @click="reset">重置</a-button>
        </div>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="createdNewPer">新建</a-button>
        <a-button @click="delAllList">批量删除</a-button>
      </div>
      <div class="top-bg">
        <template>
          {{ `已选中 ${selectedRowKeys.length} ` }}
        </template>
      </div>
      <a-table
        :columns="columns"
        :data-source="loadData.data.role"
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
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">编辑</a>
            <a-divider type="vertical" />
            <a @click="delSub(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
    <transition name="slide-fade">
      <rolePermissions
        v-if="isShowEditPop"
        @closePop="closePop"
        :id="checkId"
        :openType="openType"
        @getBaseContent="getBaseContent"
        :checkRoleName="checkRoleName"
      ></rolePermissions>
    </transition>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getRoleList, delPer } from '@/api/systemManage-api'
import Info from '../list/components/Info'
import rolePermissions from './components/rolePermissions'
const columns = [
  {
    title: '角色名',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
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
    Ellipsis,
    Info,
    rolePermissions
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
      isShowEditPop: false,
      searchValue: '', // 查询的名字
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
      checkId: 0, // 选中需要查询权限的ID
      openType: 0, // 0 是新建， 1是查看详情
      checkRoleName: '' // 选中的角色名
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
    // 编辑
    handleEdit (record) {
      this.openType = 1
      this.checkId = record.id
      this.checkRoleName = record.name
      this.isShowEditPop = true
    },
    // 删除信息
    delSub (record) {
      const _this = this
      this.$confirm({
        title: '你想删除此条信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '是',
        cancelText: '否',
        onOk () {
          delPer({
            id: [record.id]
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('删除成功')
              _this.getBaseContent()
            } else {
              _this.$message.warning(res.message)
            }
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    // 批量删除
    delAllList () {
      const _this = this
      this.$confirm({
        title: '你想删除选中的信息吗?',
        content: h => <div style="color:red;">删除后将无法恢复</div>,
        okText: '是',
        cancelText: '否',
        onOk () {
          delPer({
            id: _this.selectedRowKeys
          }).then(res => {
            if (res.status === 200) {
              _this.$message.success('删除成功')
              _this.getBaseContent()
            } else {
              _this.$message.warning(res.message)
            }
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    // 新建
    createdNewPer () {
      this.openType = 0
      this.isShowEditPop = true
    },
    closePop () {
      this.isShowEditPop = false
    },
    handleAdd () {},
    // 获取基础列表数据
    getBaseContent () {
      getRoleList({
        limit: 10,
        page: this.queryParam.page,
        info: this.searchValue
      }).then(res => {
        this.pagination.total = res.data.count
        this.queryParam.page = res.data.page
        this.pagination.current = res.data.page
        this.loadData = res
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
    reset () {
      this.searchValue = ''
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
