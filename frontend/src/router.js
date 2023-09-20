import { createRouter, createWebHistory } from 'vue-router';




import Authentication from './components/Authentication.vue';
import MainPage from './components/display/MainPage.vue';
// import TestPage from './components/display/TestPage.vue';





const routes = [

  { path: '/auth', component: Authentication, name: 'auth' },
  { path: '/', component: MainPage, name: 'main-page', meta: { requiresAuth: true }  },
  // { path: '/', component: MainPage, name: 'main-page'  },
  { path: '/:pathMatch(.*)*', name: 'auth', component: Authentication },
]




const router = createRouter({
  history: createWebHistory(),
  routes
});

router.resolve({
  name: 'auth',
  params: { pathMatch: ['not', 'found'] },
}).href // '/not/found'

router.beforeEach((to, _, next) => {
  let isLoggedIn = sessionStorage.getItem("token");
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/auth')
  }
  else {
    next();
  }
});

export default router;