import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    name: 'notFound',
    component: () => import(/* webpackChunkName: "notFound" */ '../views/NotFound.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/example',
    component: () => import(/* webpackChunkName: 'exampleWrapper' */ '../views/example/wrapper.vue'),
    children: [
      {
        path: '/',
        name: 'exampleWelcome',
        component: () => import(/* webpackChunkName:  'exampleWelcome' */ '../views/example/index.vue')
      },
      {
        path: 'upload',
        name: 'uploadExample',
        component: () => import(/* webpackChunkName: 'uploadExample' */ '../views/example/upload/index.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
