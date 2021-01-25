// eslint-disable-next-line
import * as loginService from '@/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'
// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  '403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  '404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  '500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  // 你需要动态引入的页面组件
  // 'Workplace': () => import('@/views/dashboard/Workplace'),
  // 'Analysis': () => import('@/views/dashboard/Analysis'),
  // 地图
  'map': () => import('@/views/map/map-demo'),
  // 监控
  'monitoring': () => import('@/views/monitoring/monitoring-list'),
  // 船舶监管
  'no-reported': () => import('@/views/ship-manage/no-reported'), // 未报备出港
  'voyage-record': () => import('@/views/ship-manage/voyage-record'), // 航次记录
  'ship-register': () => import('@/views/ship-manage/ship-regist'), // 船舶登记
  // 电子围栏
  'trigger': () => import('@/views/electronic-fence/trigger-history'), // 触发历史
  'fence-model': () => import('@/views/electronic-fence/fence-model'), // 围栏模型
  // 设备预警
  'warning-history': () => import('@/views/equipment-manage/warning-history'), // 预警历史
  'warning-model': () => import('@/views/equipment-manage/warning-model'), // 预警模型
  // 系统设置
  'user-manage': () => import('@/views/system-manage/user-manage'), // 用户管理
  'role-manage': () => import('@/views/system-manage/role-manage'), // 角色管理
  // 港口管理
  'harbour': () => import('@/views/harbour-manage/harbour'),
  // 'no-reported': () => import('@/views/ship-manage/no-reported'),
  // form
  // 'BasicForm': () => import('@/views/form/basicForm'),
  // 'StepForm': () => import('@/views/form/stepForm/StepForm'),
  // 'AdvanceForm': () => import('@/views/form/advancedForm/AdvancedForm'),

  // list
  // 'TableList': () => import('@/views/list/TableList'),
  // 'StandardList': () => import('@/views/list/BasicList'),
  // 'CardList': () => import('@/views/list/CardList'),
  // 'SearchLayout': () => import('@/views/list/search/SearchLayout'),
  // 'SearchArticles': () => import('@/views/list/search/Article'),
  // 'SearchProjects': () => import('@/views/list/search/Projects'),
  // 'SearchApplications': () => import('@/views/list/search/Applications'),
  // 'ProfileBasic': () => import('@/views/profile/basic'),
  // 'ProfileAdvanced': () => import('@/views/profile/advanced/Advanced'),

  // result
  // 'ResultSuccess': () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
  // 'ResultFail': () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),

  // exception
  'Exception403': () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  'Exception404': () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  'Exception500': () => import(/* webpackChunkName: "fail" */ '@/views/exception/500')

  // account
  // 'AccountCenter': () => import('@/views/account/center'),
  // 'AccountSettings': () => import('@/views/account/settings/Index'),
  // 'BaseSettings': () => import('@/views/account/settings/BaseSetting'),
  // 'SecuritySettings': () => import('@/views/account/settings/Security'),
  // 'CustomSettings': () => import('@/views/account/settings/Custom'),
  // 'BindingSettings': () => import('@/views/account/settings/Binding'),
  // 'NotificationSettings': () => import('@/views/account/settings/Notification')

  // 'TestWork': () => import(/* webpackChunkName: "TestWork" */ '@/views/dashboard/TestWork')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*', redirect: '/404', hidden: true
}

// 根级菜单
const rootRouter = {
  key: '',
  name: 'index',
  path: '/',
  component: 'BasicLayout',
  redirect: '/map',
  meta: {
    title: '首页'
  },
  children: []
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = (token) => {
  return new Promise((resolve, reject) => {
    loginService.getCurrentUserNav(token).then(res => {
      // console.log('res', res)
      res.routerMap = [
            {
              path: '/map',
              name: 'map',
              pid: 0,
              id: 1,
              component: 'map',
              meta: { title: '电子海图', icon: 'map' }
            },
            // 监控列表
            {
              path: '/monitoring',
              name: 'monitoring',
              pid: 0,
              id: 2,
              component: 'monitoring',
              meta: { title: '实时监控', icon: 'map' }
            },
            {
              name: 'ship',
              path: '/ship',
              pid: 0,
              id: 3,
              component: 'RouteView',
              redirect: '/ship/no-reported',
              meta: { title: '船舶监管', icon: bxAnaalyse }
            },
            {
              path: '/ship/no-reported',
              name: 'reported',
              component: 'no-reported',
              id: 32,
              pid: 3,
              meta: { title: '未报备出港', keepAlive: false }
            },
            {
              path: '/ship/ship-register',
              name: 'ShipRegistration',
              component: 'ship-register',
              id: 33,
              pid: 3,
              meta: { title: '船舶登记', keepAlive: false }
            }
      ]
      console.log(res)
      var result = res.data
      const menuNav = []
      const childrenNav = []

      //      后端数据, 根级树数组,  根级 PID
      listToTree(result, childrenNav, 0)
      rootRouter.children = childrenNav
      menuNav.push(rootRouter)
      console.log('menuNav', menuNav)
      const routers = generator(menuNav)
      routers.push(notFoundRouter)
      console.log('routers', routers)
      resolve(routers)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = (routerMap, parent) => {
  return routerMap.map(item => {
    const { title, show, hideChildren = false, hiddenHeaderContent, target, icon } = item.meta || {}
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.path || `${parent && parent.path || ''}/${item.key}`,
      // 路由名称，建议唯一
      name: item.name || item.key || '',
      // 该路由对应页面的 组件 :方案1
      // component: constantRouterComponents[item.component || item.key],
      // 该路由对应页面的 组件 :方案2 (动态加载)
      component: (constantRouterComponents[item.component || item.key]) || (() => import(`@/views/${item.component}`)),

      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: title,
        icon: icon || undefined,
        hiddenHeaderContent: hiddenHeaderContent,
        target: target,
        permission: item.name
      }
    }
    // 是否设置了隐藏菜单
    if (show === false) {
      currentRouter.hidden = true
    }
    // 是否设置了隐藏子菜单
    if (hideChildren) {
      currentRouter.hideChildrenInMenu = true
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
const listToTree = (list, tree, parentId) => {
  list.forEach(item => {
    // 判断是否为父级菜单
    if (item.pid === parentId) {
      const child = {
        ...item,
        key: item.key || item.name,
        children: []
      }
      // 迭代 list， 找到当前菜单相符合的所有子菜单
      listToTree(list, child.children, item.id)
      // 删掉不存在 children 值的属性
      if (child.children.length <= 0) {
        delete child.children
      }
      // 加入到树中
      tree.push(child)
    }
  })
}
