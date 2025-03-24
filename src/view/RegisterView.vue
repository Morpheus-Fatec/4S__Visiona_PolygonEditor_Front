<script setup>
import Layout from '@/components/Layout/Layout.vue';
import Register from '@/components/Operations/RegisterComponent.vue';
</script>

<template>
    <Layout>
        <div class="background">
        <Register />
        </div>
    </Layout>
</template>

<style scoped>
.background {
  background-color: #FFFFFF; 
  width: 100%;
  height: 100%;
  padding: 20px; 
}
</style>
