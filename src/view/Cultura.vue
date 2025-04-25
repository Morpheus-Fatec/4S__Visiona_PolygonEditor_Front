<script setup>
import Layout from '@/components/Layout/Layout.vue';
import Culture from '@/components/Culture/Mananger.vue';

</script>

<template>
    <Layout>
        <div class="background">
          <Culture/>
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
