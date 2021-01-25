<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" style="background:#f0f2f5">
      <a-row :gutter="24">
        <a-col :xl="6" :lg="24" :md="24" :sm="24" style="padding:0">
          <div class="page-header-index-wide">
            <a-card :bordered="false" style="padding:20px;min-height:400px" v-if="!showDetailPop">
              <div class="search-box">
                <a-input v-model="searchValue" style="width:100%" placeholder="请输入关键字"></a-input>
                <a-button type="primary">搜索</a-button>
              </div>
              <tree
                v-if="cascaderList.length>0"
                v-model="checkedKeys"
                :expanded-keys="expandedKeys"
                :auto-expand-parent="autoExpandParent"
                :selected-keys="selectedKeys"
                :tree-data="cascaderList"
                :show-line="true"
                :blockNode="true"
                :selectable="true"
                @expand="onExpand"
                @select="onSelect"
                :defaultExpandAll="true"
                :defaultExpandParent="true"
              >
                <template slot="custom" slot-scope="item">
                  <div @click="chooseDep(item)" @mouseenter="treeMouseEnter(item)" @mouseleave="treeMouseLeave(item)">
                    <span>{{ item.title }}</span>
                    <a-tooltip placement="bottom" title="新增" v-if="item.scopedSlots.isAdd && item.scopedSlots.isMenu">
                      <a-icon type="plus-circle-o" class="but_type" style="right:70px;" @click.stop="() => append(item)" />
                    </a-tooltip>
                    <a-tooltip placement="bottom" title="修改" v-if="item.scopedSlots.isMenu">
                      <a-icon type="edit" class="but_type" style="right:10px;" @click.stop="() => edit(item)" />
                    </a-tooltip>
                    <a-tooltip placement="bottom" title="删除" v-if="item.scopedSlots.isMenu">
                      <a-icon type="minus-circle-o" class="but_type" @click.stop="e => remove(item)" />
                    </a-tooltip>
                  </div>
                  <!-- <a-button type="primary" class="but_type" style="right:200px;" @click="() => append(item)">新增</a-button
                  >
                  <a-button type="primary" class="but_type" style="right:120px;" @click="() => edit(item)">编辑</a-button
                  >
                  <a-button type="primary" class="but_type" @click="e => remove(item)">删除</a-button> -->
                </template>
              </tree>
            </a-card>
          </div>
        </a-col>
        <a-col :xl="18" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :bordered="false" class="ant-pro-components-tag-select" style="padding:20px" v-if="!showDetailPop">
            <div class="nav-box">
              <div class="input-list">
                <div class="input-item">
                  <span class="input-title">状态：</span>
                  <a-select style="width: 100%" placeholder="请选择" @change="statusSelect" v-model="status">
                    <a-select-option value="1">启用</a-select-option>
                    <a-select-option value="0">禁用</a-select-option>
                  </a-select>
                </div>
                <div class="input-item">
                  <span class="input-title">角色：</span>
                  <a-select style="width: 100%" placeholder="请选择" @change="roleSelect" v-model="role">
                    <a-select-option :value="roleItem.id" v-for="(roleItem, roleIndex) in roleList" :key="roleIndex">{{
                      roleItem.name
                    }}</a-select-option>
                  </a-select>
                </div>
                <div class="input-item">
                  <span class="input-title">详情：</span>
                  <a-input v-model="searchValue" placeholder="用户名/姓名/手机" />
                </div>
              </div>
              <div class="btn-list">
                <a-button type="primary" style="margin-right: 10px" @click="getBaseContent">查询</a-button>
                <a-button @click="reset">重置</a-button>
              </div>
            </div>
            <div class="table-operator">
              <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
              <a-button @click="handleAdd">批量删除</a-button>
            </div>
            <a-table
              :columns="columns"
              :data-source="loadData.info"
              :pagination="pagination"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              :rowKey="record => record.id"
              @change="handleTableChange"
              alert="true"
            >
              <span slot="contact" slot-scope="text, record">
                <a-switch :defaultChecked="record.contact == 1 ? true:false" @change="contactChange($event, record)"/>
              </span>
              <span slot="password" slot-scope="text, record">
                <a @click="resetPassword(record)">重置密码</a>
              </span>
              <span slot="status" slot-scope="text">
                <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
              </span>
              <span slot="action" slot-scope="text, record">
                <template>
                  <a @click="moredDetail(record)">详情</a>
                  <a-divider type="vertical" />
                  <a @click="delListItem(record)">删除</a>
                </template>
              </span>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
      <transition name="slide-fade">
        <user-detail-pop v-if="showDetailPop" @closePop="closePop" :id="checkId" :popType="popType" @getBaseContent="getBaseContent"> </user-detail-pop>
      </transition>
      <!-- 新增部门弹窗 -->
      <a-modal
        title="Title"
        :visible="addDepPop"
        :confirm-loading="confirmLoading"
        @ok="addDep"
        @cancel="addDepPop = false"
      >
        <span>请输入部门名字：</span>
        <a-input style="margin-top:20px" v-model="addDepName" placeholder="请输入"></a-input>
      </a-modal>
      <!-- 修改部门弹窗 -->
      <a-modal
        title="Title"
        :visible="editDepPop"
        :confirm-loading="confirmLoading"
        @ok="editDep"
        @cancel="editDepPop = false"
      >
        <span>请输入部门名字：</span>
        <a-input style="margin-top:20px" v-model="editDepName" placeholder="请输入"></a-input>
      </a-modal>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { Tree } from 'ant-design-vue'
import { STable, Ellipsis } from '@/components'
import { getAllDep } from '@/api/ship-api'
import { getAllRole, getUserList, setContact, delDep, addDep, editDep, delUser, resetPass } from '@/api/systemManage-api'
import userDetailPop from './components/userDetailPop'
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    width: '11%',
    align: 'center',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '姓名',
    width: '11%',
    align: 'center',
    dataIndex: 'real_name'
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    align: 'center',
    scopedSlots: { customRender: 'phone' }
  },
  {
    title: '部门',
    dataIndex: 'department',
    align: 'center',
    width: '8%',
    sorter: false,
    needTotal: false
  },
  {
    title: '角色',
    align: 'center',
    dataIndex: 'role',
    sorter: true
  },
  {
    title: '联络人',
    sorter: false,
    align: 'center',
    scopedSlots: { customRender: 'contact' }
  },
  {
    title: '重置密码',
    sorter: false,
    width: '8%',
    align: 'center',
    scopedSlots: { customRender: 'password' }
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
    Tree,
    STable,
    userDetailPop
  },
  data () {
    this.columns = columns
    return {
      expandedKeys: [],
      autoExpandParent: false,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
      editValue: '', // 编辑树形内容
      searchValue: '', // 搜索的关键字
      loadData: [],
      selectedRowKeys: [],
      visible: false,
      confirmLoading: false,
      mdl: null,
      showDetailPop: false,
      cascaderList: [], // 部门集合
      roleList: [], // 角色集合
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
      depId: undefined, // 部门ID
      limit: 10, // 每次请求多少数据
      status: undefined, // 状态
      role: undefined, // 角色
      checkId: '', // 选中的ID
      addDepPop: false, // 是否展示添加部门弹窗
      addDepFatherId: undefined, // 需要增加的部门父ID
      addDepName: '', // 添加的部门名称
      editDepName: '', // 修改部门名称
      editDepPop: false, // 修改部门弹窗
      editDepId: undefined // 需要修改的部门ID
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
    getBaseContent () {
      const _this = this
      getUserList({
        department: _this.depId,
        page: this.queryParam.page,
        limit: _this.limit,
        status: _this.status,
        role: _this.role,
        info: _this.searchValue
      }).then(res => {
        console.log(res)
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
    // 联络人设置
    contactChange (checked, record) {
      setContact({
        id: record.id,
        contact: checked ? '1' : '0'
      }).then((res) => {
        if (res.status === 200) {
          this.$message.success('设置成功')
        }
      })
    },
    onExpand (expandedKeys) {
      // console.log('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedKeys = expandedKeys
      console.log(expandedKeys)
      this.autoExpandParent = false
    },
    onCheck (checkedKeys) {
      console.log('onCheck', checkedKeys)
      this.checkedKeys = checkedKeys
    },
    onSelect (selectedKeys, info) {
      // console.log('onSelect', info)
      this.selectedKeys = selectedKeys
    },
    // 根据部门获取表格
    chooseDep (item) {
      this.depId = item.id
      this.getBaseContent()
      // console.log(item)
    },
    // 递归查找
    searchOption (option, arr, type = 'delect') {
      console.log(option, arr)
      for (let s = 0; s < arr.length; s++) {
        console.log(arr[s].key, option.key)
        if (arr[s].key === option.key) {
          if (type === 'delect') {
            arr.splice(s, 1)
          } else {
            // 这是模拟数据编辑数据
            this.$set(arr, s, {
              title: '12121212',
              key: '12121212',
              scopedSlots: { title: 'custom' }
            })
          }
          break
        } else if (arr[s].children && arr[s].children.length > 0) {
          // 递归条件
          this.searchOption(option, arr[s].children)
        } else {
          continue
        }
      }
    },
    // 打开增加部门弹窗
    append (data) {
      this.addDepPop = true
      this.addDepFatherId = data.id
    },
    // 提交增加部门
    addDep () {
      if (this.addDepName === '') {
        this.$message.info('部门名称不能为空')
      } else {
        addDep({
          pid: this.addDepFatherId,
          name: this.addDepName
        }).then((res) => {
        this.$message.success('添加成功')
        this.addDepPop = false
        this.getDep(this)
        })
      }
    },
    remove (data) {
      const _this = this
      this.$confirm({
        title: '你确定想删除部门吗？',
        content: h => <div style="color:red;">此操作不可逆，请谨慎考虑！！</div>,
        okText: '取消',
        cancelText: '确定',
        // 这里是取消
        onOk () {
          console.log('Cancel')
        },
        // 这里是确定
        onCancel () {
          delDep({
            id: data.id
          }).then((res) => {
            _this.$message.success('删除成功')
                  _this.searchOption(data, _this.cascaderList, 'delect')
          })
        },
        class: 'test'
      })
      // 先请求后端接口，删除成功后执行
    },
    // 打开修改部门弹窗
    edit (data) {
      this.editDepPop = true
      this.editDepId = data.id
      this.editDepName = data.title
      // console.log(data)
    },
    // 提交修改部门信息
    editDep () {
      editDep({
        id: this.editDepId,
        new_name: this.editDepName
      }).then((res) => {
        this.$message.success('修改成功')
        this.editDepPop = false
        this.getDep(this)
      })
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    // 新建
    handleAdd () {
      this.popType = 0
      this.showDetailPop = true
    },
    // 详情
    moredDetail (record) {
      this.popType = 1
      this.checkId = Number(record.id)
      this.showDetailPop = true
    },
    // 删除条目
    delListItem (record) {
      const _this = this
      this.$confirm({
        title: '你确定想删除此用户吗？',
        content: h => <div style="color:red;">此操作不可逆，请谨慎考虑！！</div>,
        okText: '取消',
        cancelText: '确定',
        // 这里是取消
        onOk () {
          console.log('Cancel')
        },
        // 这里是确定
        onCancel () {
          delUser({
            id: [record.id]
          }).then((res) => {
            _this.$message.success('删除成功')
            _this.getBaseContent()
          })
        },
        class: 'test'
      })
    },
    treeMouseEnter (item) {
      item.scopedSlots.isMenu = true
    },
    treeMouseLeave (item) {
      item.scopedSlots.isMenu = false
    },
    closePop () {
      this.showDetailPop = false
    },
    // 状态选择
    statusSelect (value) {
      this.status = value
    },
    // 角色选择
    roleSelect (value) {
      this.role = value
    },
    // 重置密码
    resetPassword (record) {
      const _this = this
      this.$confirm({
        title: '你确定想重置' + record.username + '的密码吗？',
        content: h => <div style="color:red;">此操作不可逆，请谨慎考虑！！</div>,
        okText: '取消',
        cancelText: '确定',
        // 这里是取消
        onOk () {
        },
        // 这里是确定
        onCancel () {
          resetPass({
            id: record.id
          }).then((res) => {
            _this.$message.success('重置成功,密码为：' + res.data.password)
          })
        },
        class: 'test'
      })
    },
    // 重置信息
    reset () {
      this.searchValue = ''
      this.depId = undefined
      this.role = undefined
      this.status = undefined
      this.getBaseContent()
    },
    // 获取所有部门
    getDep (_this) {
      _this.cascaderList = []
          getAllDep().then(res => {
            _this.expandedKeys.push(res.data[0]['0'].name)
      for (let n = 0; n < res.data.length; n++) {
        _this.cascaderList.push({
          key: res.data[n]['0'].name,
          title: res.data[n]['0'].name,
          id: res.data[n]['0'].id,
          level: 1,
          scopedSlots: {
            title: 'custom',
            isAdd: true,
            isEdite: false,
            isMenu: false
          },
          children: []
        })
        for (let i = 0; i < res.data[n]['0'].area.length; i++) {
          _this.cascaderList[n].children.push({
            value: res.data[n]['0'].area[i].id,
            key: res.data[n]['0'].area[i].name,
            title: res.data[n]['0'].area[i].name,
            id: res.data[n]['0'].area[i].id,
            level: 2,
            scopedSlots: {
              title: 'custom',
              isAdd: true,
              isEdite: false,
              isMenu: false
            },
            children: []
          })
          if (res.data[n]['0'].area[i].station) {
            for (let h = 0; h < res.data[n]['0'].area[i].station.length; h++) {
              _this.cascaderList[n].children[i].children.push({
                value: res.data[n]['0'].area[i].station[h].id,
                key: res.data[n]['0'].area[i].station[h].name,
                title: res.data[n]['0'].area[i].station[h].name,
                id: res.data[n]['0'].area[i].station[h].id,
                levle: 3,
                scopedSlots: {
                  title: 'custom',
                  isAdd: false,
                  isEdite: false,
                  isMenu: false
                }
              })
            }
          }
        }
      }
    })
    }
  },
  mounted () {
    this.getDep(this)
    this.getBaseContent()
    getAllRole().then(res => {
      this.roleList = res.data
    })
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
.ant-tree-title {
  width: 100%;
}
.title {
  float: left;
}
.ant-card-body {
  :global {
    .ant-tree {
      line-height: 3;
      li {
        position: relative;
      }
    }
  }
}
.ant-card-body .but_type {
  float: right;
  position: absolute;
  right: 40px;
  top: 10px;
}
.nav-box {
  width: 100%;
  display: flex;
  .input-list {
    display: flex;
    flex: 4;
    align-items: center;
    flex-wrap: wrap;
    .input-item {
      width: 30%;
      display: flex;
      align-items: center;
      margin-right: 20px;
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
// /deep/ .ant-tree li .ant-tree-node-content-wrapper:hover {
//   background-color: #fff;
// }
.search-box {
  width: 100%;
  height: 30px;
  border: 1px solid #f2f2f2;
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
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
.reset-btn{
  color:#1890ff;
  cursor: pointer;
}
</style>
