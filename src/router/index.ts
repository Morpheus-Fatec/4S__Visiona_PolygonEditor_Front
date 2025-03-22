import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../view/DashboardView.vue';
import Configuracao from '../view/ConfiguracaoView.vue';
import Login from '../view/LoginView.vue';
import NotFound from '../view/NotFoundView.vue';
import Operacoes from '../view/OperacoesView.vue';

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
      component: ()=> import ('../view/MapaOperationView.vue'),
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

export default router
