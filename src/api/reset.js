import request from '@/utils/request'

// 重置密码
export function resetPwd (parameter) {
  return request({
    url: '/system-manage/password',
    method: 'post',
    data: parameter
  })
}
export default resetPwd
