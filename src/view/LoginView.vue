<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <div class="d-flex flex-column justify-content-center align-items-center vh-100 gap-4">
        <h1 class="h1 text-center mt-5">Tela Login</h1>
        <button type="button" class="btn btn-primary btn-lg w-25">
            <RouterLink class="nav-link text-white" to="/mapa-global">Login</RouterLink>
        </button>
    </div>
</template>