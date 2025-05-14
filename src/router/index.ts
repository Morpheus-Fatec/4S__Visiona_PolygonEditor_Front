import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../view/DashboardView.vue';
import Configuracao from '../view/ConfiguracaoView.vue';
import Login from '../view/LoginView.vue';
import NotFound from '../view/NotFoundView.vue';
import Operacoes from '../view/OperacoesView.vue';
import MapaOperationView from '@/view/MapaOperationView.vue';
import RegisterView from '@/view/RegisterView.vue';
import Cultura from '@/view/Cultura.vue';
import Solo from '@/view/Solo.vue';
import Fazenda from '@/view/Fazenda.vue';
import UserRegisterView from '@/view/UserRegisterView.vue';

function isAuthenticated() {
  const token = localStorage.getItem("token");
  return token !== null; 
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/mapa-global',
      name: 'mapa-global',
      component: () => import ('../view/MapaGlobalView.vue'),
      meta: { requiresAuth: true } 
    },
    {
      path: '/operacao/:id',
      name: 'operacaoMapDetails',
      props: true,
      component: MapaOperationView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true } 
    },
    {
      path: '/configuracao',
      name: 'configuracao',
      component: Configuracao,
      meta: { requiresAuth: true } 
    },
    {
      path: '/operacoes',
      name: 'operacoes',
      component: Operacoes,
      meta: { requiresAuth: true } 
    },
    {
      path: '/cadastro',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { requiresAuth: true } 
    },
    {
      path: '/cultura',
      name:'cultura',
      component: Cultura,
      meta: { requiresAuth: true } 
    },
    {
      path: '/solo',
      name:'solo',
      component: Solo,
      meta: { requiresAuth: true } 
    },
    {
      path: '/fazenda',
      name:'fazenda',
      component: Fazenda,
      meta: { requiresAuth: true } 
    },
    {
      path: '/usuario',
      name: 'usuario',
      component: UserRegisterView,       
      meta: { requiresAuth: true } 
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/'); 
  } else {
    next();
  }
});

export default router;
