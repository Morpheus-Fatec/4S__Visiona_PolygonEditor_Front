<script setup>
import Layout from '@/components/Layout/Layout.vue';
import UserRegisterView from '@/components/Operations/UserRegusterComponent.vue';

</script>

<template>
    <Layout>
        <div class="background">
        <UserRegisterView />
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
