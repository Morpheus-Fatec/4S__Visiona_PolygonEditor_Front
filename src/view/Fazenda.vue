<script setup>
import Layout from '@/components/Layout/Layout.vue';
import Farm from '@/components/Farm/Mananger.vue';

</script>

<template>
    <Layout>
        <div class="background">
          <Farm/>
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
