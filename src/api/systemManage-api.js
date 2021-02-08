import request from '@/utils/request'

const api = {
    getAllRole: '/system-manage/all-role', // 获取全部角色类型
    getUserList: '/system-manage/user-manage', // 获取全部角色类型
    setContact: '/system-manage/user-edit', // 设置联系人
    delDep: '/system-manage/department/del', // 删除部门
    addDep: '/system-manage/department/add', // 添加部门
    editDep: '/system-manage/department/edit', // 修改部门
    delUser: '/system-manage/user-del', // 删除用户
    resetPwd: '/system-manage/edit/password', // 重置密码
    addInfo: '/system-manage/user-add', // 重置密码
    roleList: '/system-manage/role', // 重置密码
    getRoleInfo: '/system-manage/role-manage', // 获取角色信息
    createPer: '/system-manage/add', // 创建新角色
    editPer: '/system-manage/edit', // 修改角色
    delPer: '/system-manage/del', // 删除角色
    editHarbour: '/harbour/edit', // 修改港口信息
    addHarbour: '/harbour/add', // 新增港口信息
    delHarbour: '/harbour/del', // 删除港口信息
    getAllHarbour: '/area/area-harbour', // 获取所有港口
    areaList: '/area/area', // 区域列表
    editSms: '/area/editSms', // 修改短信通知
    addArea: '/area/addArea', // 修改新增区域信息
    delArea: '/area/delArea' // 删除区域
}

export default api

export function getAllRole (parameter) {
  return request({
    url: api.getAllRole,
    method: 'get',
    params: parameter
  })
}
export function getUserList (parameter) {
    return request({
      url: api.getUserList,
      method: 'get',
      params: parameter
    })
  }
export function setContact (parameter) {
  return request({
    url: api.setContact,
    method: 'post',
    data: parameter
  })
}
// 获取详细信息
export function getUserInfo (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
// 设置详细信息
export function setUserInfo (url, parameter) {
  return request({
    url: url,
    method: 'post',
    data: parameter
  })
}
// 添加新用户
export function addUserInfo (parameter) {
  return request({
    url: api.addInfo,
    method: 'post',
    data: parameter
  })
}
// 删除部门
export function delDep (parameter) {
  return request({
    url: api.delDep,
    method: 'post',
    data: parameter
  })
}
// 添加部门
export function addDep (parameter) {
  return request({
    url: api.addDep,
    method: 'post',
    data: parameter
  })
}
// 修改部门
export function editDep (parameter) {
  return request({
    url: api.editDep,
    method: 'post',
    data: parameter
  })
}
// 删除用户
export function delUser (parameter) {
  return request({
    url: api.delUser,
    method: 'post',
    data: parameter
  })
}
// 重置密码
export function resetPass (parameter) {
  return request({
    url: api.resetPwd,
    method: 'post',
    data: parameter
  })
}
// 获取角色列表
export function getRoleList (parameter) {
  return request({
    url: api.roleList,
    method: 'get',
    params: parameter
  })
}
// 获取角色信息
export function getRoleInfo (parameter) {
  return request({
    url: api.getRoleInfo,
    method: 'get',
    params: parameter
  })
}
// 新建角色
export function createPer (parameter) {
  return request({
    url: api.createPer,
    method: 'post',
    data: parameter
  })
}
// 修改角色
export function editPer (parameter) {
  return request({
    url: api.editPer,
    method: 'post',
    data: parameter
  })
}
// 新建角色
export function delPer (parameter) {
  return request({
    url: api.delPer,
    method: 'post',
    data: parameter
  })
}
// 获取港口信息
export function getHarbour (parameter) {
  return request({
    url: '/harbour/',
    method: 'get',
    params: parameter
  })
}
// 获取港口信息
export function harbourInfo (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
// 获取港口信息
export function editHarbour (parameter) {
  return request({
    url: api.editHarbour,
    method: 'post',
    data: parameter
  })
}
// 新增港口信息
export function addHarbour (parameter) {
  return request({
    url: api.addHarbour,
    method: 'post',
    data: parameter
  })
}
// 新增港口信息
export function delHarbour (parameter) {
  return request({
    url: api.delHarbour,
    method: 'post',
    data: parameter
  })
}
// 获取区域信息
export function getArea (parameter) {
  return request({
    url: api.areaList,
    method: 'get',
    params: parameter
  })
}
// 获取港口信息
export function getAllHarbour (parameter) {
  return request({
    url: api.getAllHarbour,
    method: 'get',
    params: parameter
  })
}
// 设置短信通知
export function editSms (parameter) {
  return request({
    url: api.editSms,
    method: 'post',
    data: parameter
  })
}
// 新增修改区域
export function addArea (parameter) {
  return request({
    url: api.addArea,
    method: 'post',
    data: parameter
  })
}
// 新增修改区域
export function delArea (parameter) {
  return request({
    url: api.delArea,
    method: 'post',
    data: parameter
  })
}
