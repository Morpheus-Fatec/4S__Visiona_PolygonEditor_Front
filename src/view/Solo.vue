<script setup>
import Layout from '@/components/Layout/Layout.vue';
import Soil from '@/components/Soil/Mananger.vue';

</script>

<template>
    <Layout>
        <div class="background">
          <Soil/>
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
