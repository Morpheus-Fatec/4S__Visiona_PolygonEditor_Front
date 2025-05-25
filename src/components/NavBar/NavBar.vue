<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'NavBar',
  data() {
    return {
      userRole: null,
    };
  },
  created() {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.userRole = usuario.role || null;
      } catch (e) {
        this.userRole = null;
      }
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('usuario');
      this.$router.push('/login');
    }
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark navbar-custom" style="height: 100px;">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img alt="Morpheus Logo" src="../../assets/Logo_Morpheus.png" height="60">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-4">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/mapa-global">Mapa Global</RouterLink>
          </li>

          <!-- Exemplo: mostra para admin e manager -->
          <li class="nav-item">
            <RouterLink class="nav-link" to="/operacoes">Visualizar Talhões</RouterLink>
          </li>

          <!-- Só admin pode cadastrar -->
          <li class="nav-item" v-if="userRole === 'Administrador' || userRole === 'Consultor'">
            <RouterLink class="nav-link" to="/cadastro">Cadastrar Talhão</RouterLink>
          </li>

          <!-- Dropdown Gerenciar só admin -->
          <li class="nav-item dropdown" v-if="userRole === 'Administrador' || userRole === 'Consultor'">
            <a class="nav-link dropdown-toggle" href="#" id="gerenciarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              Gerenciar
            </a>
            <ul class="dropdown-menu" aria-labelledby="gerenciarDropdown">
              <li>
                <RouterLink class="dropdown-item" to="/fazenda">Fazendas</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/cultura">Culturas</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/solo">Solos</RouterLink>
              </li>
              <li v-if="userRole === 'Administrador'">
                <RouterLink class="dropdown-item" to="/usuario">Usuários</RouterLink>
              </li>
            </ul>
          </li>
          <li v-if="userRole === 'Administrador'" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="dashboardsDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              Dashboards
            </a>
            <ul class="dropdown-menu" aria-labelledby="gerenciarDropdown">
              <li>
                <RouterLink class="dropdown-item" to="/painel">Painel de Controle</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/analistas">Analistas</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/consultores">Consultores</RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" to="/talhao">Talhões</RouterLink>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="logout">Sair</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style>
.dropdown-menu {
  z-index: 1055 !important;
}
</style>
