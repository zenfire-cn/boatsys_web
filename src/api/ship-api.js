import request from '@/utils/request'

const api = {
    register: '/ship/ship-register', // 获取船只列表
    allDep: '/system-manage/department', // 获取所有部门
    editShip: '/ship/shipEdit/{boat_id}', // 获取船只的具体信息
    qiniuToken: '/system-manage/qiniu/token', // 获取七牛云token
    getStation: '/ship/station', // 获取用户名下的部门
    addShip: '/ship/shipAdd', // 添加船只
    voyageRecord: '/ship/voyage-record', // 获取航次记录
    reportedInfo: '/ship/no-reported', // 未报备出港记录
    delImg: '/system-manage/qiniu/delImg', // 未报备出港记录
    crimina: '/ship/fail-stop' // 未报备出港记录
}

export default api

export function getRegister (parameter) {
  return request({
    url: api.register,
    method: 'get',
    params: parameter
  })
}
export function getAllDep (parameter) {
  return request({
    url: api.allDep,
    method: 'get',
    params: parameter
  })
}
export function editShip (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
export function getQiniuToken (parameter) {
  return request({
    url: api.qiniuToken,
    method: 'get',
    params: parameter
  })
}
// 修改数据
export function updateShipInfo (url, parameter) {
  return request({
    url: url,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
export function deleteShip (url, parameter) {
  return request({
    url: url,
    method: 'post',
    data: parameter
  })
}
export function getStation (parameter) {
  return request({
    url: api.getStation,
    method: 'get',
    params: parameter
  })
}
export function addShip (parameter) {
  return request({
    url: api.addShip,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
export function getVoyaeRecord (parameter) {
  return request({
    url: api.voyageRecord,
    method: 'get',
    params: parameter
  })
}
// 获取详细航次记录
export function getVoyaeDetail (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
export function getReportedInfo (parameter) {
  return request({
    url: api.reportedInfo,
    method: 'get',
    params: parameter
  })
}
export function delImg (parameter) {
  return request({
    url: api.delImg,
    method: 'post',
    data: parameter
  })
}
// 根据ID获取港口信息
export function getHabor (parameter) {
  return request({
    url: '/ship/departmentHarbour',
    method: 'get',
    params: parameter
  })
}
export function exportExcel (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
export function getCriminaList (parameter) {
  return request({
    url: api.crimina,
    method: 'get',
    params: parameter
  })
}
