<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue';
import Analyst from '@/components/Dashboards/AnalystComponent.vue';
</script>

<template>
  <Layout>
    <div class="background">
    
      <Analyst />
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
