import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../view/DashboardView.vue';
import Configuracao from '../view/ConfiguracaoView.vue';
import Login from '../view/LoginView.vue';
import NotFound from '../view/NotFoundView.vue';
import Operacoes from '../view/OperacoesView.vue';
import MapaOperationView from '@/view/MapaOperationView.vue';
import RegisterView from '@/view/RegisterView.vue';

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
  ],
})

export default router
