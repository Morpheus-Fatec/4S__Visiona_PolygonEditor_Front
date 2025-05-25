import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../view/AnalystDashboardView.vue';
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
import AnalystDashboardView from '@/view/AnalystDashboardView.vue';
import ConsultantDashboardView from '@/view/ConsultantDashboardView.vue';
import TalhaoDashboardView from '@/view/TalhaoDashboardView.vue';
import ControlPanelView from '@/view/ControlPanelView.vue';

function isAuthenticated() {
  const usuarioJson = localStorage.getItem("usuario");

  if (!usuarioJson) return false;

  try {
    const usuario = JSON.parse(usuarioJson);
    return !!usuario.token;
  } catch (e) {
    return false;
  }
}

function getUser() {
  const usuarioJson = localStorage.getItem("usuario");
  if (!usuarioJson) return null;
  try {
    return JSON.parse(usuarioJson);
  } catch (e) {
    return null;
  }
}


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
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador']
       } 
    },
    {
      path: '/configuracao',
      name: 'configuracao',
      component: Configuracao,
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador']
       } 
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
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador','Consultor']
       } 
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
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador','Consultor']
       } 
    },
    {
      path: '/solo',
      name:'solo',
      component: Solo,
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador','Consultor']
       }  
    },
    {
      path: '/fazenda',
      name:'fazenda',
      component: Fazenda,
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador','Consultor']
       } 
    },
    {
      path: '/usuario',
      name: 'usuario',
      component: UserRegisterView,       
      meta: { 
        requiresAuth: true, 
        roles: ['Administrador']
       }  
    },
    {
      path: '/analistas',
      name: 'analistas',
      component: AnalystDashboardView,
    },
    {
      path: '/consultores',
      name: 'consultores',
      component: ConsultantDashboardView,
    },
    {
      path: '/talhao',
      name: 'talhao',
      component: TalhaoDashboardView,
    },
        {
      path: '/painel',
      name: 'painel',
      component: ControlPanelView,
    }
  ]
});

router.beforeEach((to, from, next) => {
  const user = getUser();
  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles;

  if (!requiresAuth) {
    next();
    return;
  }

  if (!isAuthenticated()) {
    if (to.name !== 'login') {
      next({ name: 'login' });
    } else {
      next();
    }
    return;
  }

  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (user && allowedRoles.includes(user.role)) {
      next();
    } else {
      next('/mapa-global');
    }
  } else {
    next();
  }
});


export default router;
