import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../view/DashboardView.vue';
import Mapa from '../view/MapaView.vue';
import Configuracao from '../view/ConfiguracaoView.vue';
import Login from '../view/LoginView.vue';
import NotFound from '../view/NotFoundView.vue';
import Talhoes from '../view/TalhoesView.vue';
import Register from '../view/RegisterView.vue' ;
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/mapa',
      name: 'mapa',
      component: Mapa,
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
      path: '/talhoes',
      name: 'talhoes',
      component: Talhoes,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
    {
      path: '/cadastro',
      name: 'cadatro',
      component: Register,
    },
  ],
})

export default router
