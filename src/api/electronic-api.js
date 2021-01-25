import request from '@/utils/request'

const api = {
    trigger: '/electronic/trigger', // 获取触发历史列表
    fenceModel: '/electronic/fence-model',
    warningHistory: '/equipment/warning-history', // 预警历史
    addFenceInfo: '/electronic/add', // 新增电子围栏
    delFence: '/electronic/del' // 删除电子围栏
}

export default api

export function getTrigger (parameter) {
  return request({
    url: api.trigger,
    method: 'get',
    params: parameter
  })
}
export function getModelList (parameter) {
  return request({
    url: api.fenceModel,
    method: 'get',
    params: parameter
  })
}
// 获取电子围栏详情
export function getFenceDetail (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
// 获取电子围栏详情
export function getWarning (parameter) {
  return request({
    url: api.warningHistory,
    method: 'get',
    params: parameter
  })
}
// 预警模型提交
export function warningTypeCommit (url, parameter) {
  return request({
    url: url,
    method: 'post',
    data: parameter
  })
}
// 修改电子围栏模型
export function editFenceInfo (url, parameter) {
  return request({
    url: url,
    method: 'post',
    data: parameter
  })
}
// 新增电子围栏模型
export function addFenceInfo (parameter) {
  return request({
    url: api.addFenceInfo,
    method: 'post',
    data: parameter
  })
}
// 删除电子围栏
export function delFence (parameter) {
  return request({
    url: api.delFence,
    method: 'post',
    data: parameter
  })
}
// 获取设备预警模型修改信息
export function getWarningEdit (url, parameter) {
  return request({
    url: url,
    method: 'get',
    params: parameter
  })
}
