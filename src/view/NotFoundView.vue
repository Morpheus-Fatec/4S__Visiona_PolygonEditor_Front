<script setup lang="ts">

</script>

<template>
    <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center gap-2">
        <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="404 Not Found" class="img-fluid" style="max-width: 300px;">
        <h1 class="mt-4 text-danger fw-bold">Oops! Página não encontrada</h1>
        <p class="text-muted">Parece que você se perdeu... Vamos te levar de volta para casa!</p>
        <RouterLink class="btn btn-primary btn-lg mt-3" to="/">Voltar ao Início</RouterLink>
    </div>
</template>