import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'
import { decode } from 'js-base64'
import store from '../store'

const router = createRouter({
  history: createWebHistory(),
  routes: [...routes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta && to.meta.title) || ''
  // 设置面包屑
  const breadCrumbList = []
  to.matched.forEach(item => {
    breadCrumbList.push({ name: item.meta.title, path: item.path })
  })
  store.dispatch('setBreadCrumb', breadCrumbList)
  const jwt = sessionStorage.getItem('jwt') || ''

  if (to.path === '/login') {
    // 如果是登录状态 跳转到主页
    jwt ? next('/') : next()
  } else {
    if (from.name === 'Login' && !jwt) {
      next(false)
      return false
    }
    if (jwt) {
      if (Object.prototype.hasOwnProperty.call(to.meta, 'roles')) {
        const roles = to.meta.roles || []
        const { role } = jwt && JSON.parse(decode(jwt))
        roles.includes(role) ? next() : next('/error')
        return false
      }
      next()
    } else if (to.meta && to.meta.whiteList) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
