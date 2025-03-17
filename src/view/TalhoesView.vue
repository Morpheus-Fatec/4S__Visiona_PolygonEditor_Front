<script setup>
import Layout from '../components/Layout/Layout.vue';
import TableComponent from '@/components/Operations/TableComponent.vue';
import FilterComponent from '@/components/Operations/FilterComponent.vue';

</script>

<template>
  <Layout>
    <div class='w-100 bg-success'>
      <FilterComponent />
      <TableComponent />
    </div>
  </Layout>
</template>
