import request from '@/utils/request'

const api = {
  user: '/user',
  role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getRoleList (parameter) {
  return request({
    url: api.role,
    method: 'get',
    params: parameter
  })
}

export function getServiceList (parameter) {
  return request({
    url: api.service,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return request({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return request({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}
export function mapInfo (parameter) {
  return request({
    url: '/map/',
    method: 'get',
    params: parameter
  })
}
export function searchShip (parameter) {
  return request({
    url: '/map/search',
    method: 'get',
    params: parameter
  })
}
// 船只信息查询
export function searchShipInfo (parameter) {
  return request({
    url: '/map/playback',
    method: 'get',
    params: parameter
  })
}
// 重置密码
export function resetPwd (parameter) {
  return request({
    url: '/system-manage/password',
    method: 'post',
    data: parameter
  })
}
