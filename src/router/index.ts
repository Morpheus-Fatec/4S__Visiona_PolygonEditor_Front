import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../view/DashboardView.vue';
import MapaGlobal from '../view/MapaGlobalView.vue';
import Configuracao from '../view/ConfiguracaoView.vue';
import Login from '../view/LoginView.vue';
import NotFound from '../view/NotFoundView.vue';
import MapaDetailsGlebe from '../view/MapaDetailsGlebeView.vue';

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
      component: MapaGlobal,
    },
    {
      path: '/mapa',
      name: 'mapa',
      component: MapaDetailsGlebe,
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

export default router
