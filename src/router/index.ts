import { createRouter, createWebHistory } from 'vue-router'
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
      component: () => import('../view/MapaGlobalView.vue'),
    },
    {
      path: '/operacao/:id',
      name: 'operacaoMapDetails',
      props: true,
      component: MapaOperationView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/configuracao',
      name: 'configuracao',
      component: Configuracao,
    },
    {
      path: '/operacoes',
      name: 'operacoes',
      component: Operacoes,
    },
    {
      path: '/cadastro',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
    {
      path: '/cultura',
      name: 'cultura',
      component: Cultura
    },
    {
      path: '/solo',
      name: 'solo',
      component: Solo
    },
    {
      path: '/fazenda',
      name: 'fazenda',
      component: Fazenda
    },
    {
      path: '/usuario',
      name: 'usuario',
      component: UserRegisterView,
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
    }
  ]
})

export default router
