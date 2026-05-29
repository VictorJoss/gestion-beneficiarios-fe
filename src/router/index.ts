import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { 
    path: '/', 
    name: 'Login', 
    component: () => import('../views/Login.vue') // 🚀 Lazy loading 
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('../views/Dashboard.vue'), // 🚀 Lazy loading
    meta: { requiresAuth: true },
    children: [
      // Aquí agregaremos las rutas hijas que se cargarán al hacer click en el Sidebar
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  if ((to as any).meta?.requiresAuth && !token) return { path: '/' }
})

export default router
