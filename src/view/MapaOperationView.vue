<script setup>
import { ref, watchEffect } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import MapDetailsGlebe from '../components/Map/MapDetailsGlebe/MapDetailsGlebe.vue';
import { useRoute } from 'vue-router';
import areasSJC from '@/components/Map/data/areasSJC';

const route = useRoute();
const areaId = route.params.id;
const data = ref(null);
const infoList = ref([]);

watchEffect(() => {
  if (!areaId) {
    console.error("Area ID is missing");
    return;
  }

  const area = areasSJC.features.find(area => String(area.properties.id) === areaId);

  if (!area) {
    console.error(`Area with ID ${areaId} not found.`);
    return;
  }
  data.value = area;

  infoList.value = [
    { title: 'Cultura', value: area.properties.cultura || 'Não informado' },
    { title: 'Área (ha)', value: area.properties.area || '150.54' },
    { title: 'Produtor', value: area.properties.produtor || 'Não informado' },
    { title: 'Safra', value: area.properties.safra || 'Não informado' },
    { title: 'Solo', value: area.properties.safra || 'Não informado' },
    { title: 'Cidade', value: area.properties.safra || 'Não informado' },
    { title: 'Estado', value: area.properties.safra || 'Não informado' },
    { title: 'Nome da Fazenda', value: area.properties.safra || 'Não informado' },
  ];
});
</script>

<template>
  <Layout>
    <div class="d-flex w-100">
      <div class="sidebar d-flex flex-column align-items-center p-3 h-100">
        <div class="w-100">
          <h5 class="fw-bold border-bottom border-2 py-3 mb-3 h3">Detalhes da Área</h5>
          <div v-for="(item, index) in infoList" :key="index" class="mb-3">
            <p class="mb-1 text-muted fw-semibold">{{ item.title }}</p>
            <p class="mb-1">{{ item.value }}</p>
            <hr class="my-2">
          </div>
        </div>
      </div>
      <div class="flex-grow-1">
        <MapDetailsGlebe :data="data" />
      </div>
      
    </div>
  </Layout>
</template>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  width: 350px;
  border-right: 1px solid #ddd;
  overflow: auto;
  height: 100vh;
}

.flex-grow-1 {
  flex-grow: 1;
  height: 100%;
}

hr {
  border-top: 1px solid #dee2e6;
}
</style>
