<script>
import {RouterLink} from 'vue-router'
    export default {
        name: 'NavBar'
    }
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark navbar-custom" style="height: 100px;">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <img alt="Morpheus Logo" src="../../assets/Logo_Morpheus.png" width="auto" height="60">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-4">
        <li class="nav-item">
            <RouterLink class="nav-link" to="/mapa-global">Mapa Global</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/operacoes">Visualizar Talhões</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/cadastro">Cadastrar Talhão</RouterLink>
        </li>

        <!-- Dropdown Gerenciar -->
        <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="gerenciarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Gerenciar
            </a>
            <ul class="dropdown-menu" aria-labelledby="gerenciarDropdown">
                <li><RouterLink class="dropdown-item" to="/fazenda">Fazendas</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/cultura">Culturas</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/solo">Solos</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/usuario">Usuários</RouterLink></li>
            </ul>
        </li>

        <!-- Itens comentados -->
        <!--
        <li class="nav-item">
            <RouterLink class="nav-link" to="/dashboard">Dashboard</RouterLink>
        </li>
        <li class="nav-item">
            <RouterLink class="nav-link" to="/configuracao">Configuração</RouterLink>
        </li>
        -->

        <li class="nav-item">
            <RouterLink class="nav-link" to="/">Sair</RouterLink>
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
