<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import MapDetailsGlebe from '../components/Map/MapDetailsGlebe/MapDetailsGlebe.vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const areaId = route.params.id;
const data = ref(null);
const infoList = ref([]);

function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }
}

const processGeoJsonCoordinates = (geoJson) => {
  if (!geoJson || typeof geoJson !== "object") {
    console.error("GeoJSON inválido:", geoJson);
    return geoJson;
  }

  // Corrigir coordenadas do objeto principal (geometry)
  if (geoJson.geometry && typeof geoJson.geometry.coordinates === 'string') {
    geoJson.geometry.coordinates = parseCoordinatesString(geoJson.geometry.coordinates);
  }

  // Corrigir coordenadas da classificação, caso existam
  if (geoJson.classification && Array.isArray(geoJson.classification.features)) {
    geoJson.classification.features = geoJson.classification.features.map(classificationItem => {
      if (typeof classificationItem.geometry.coordinates === 'string') {
      classificationItem.geometry.coordinates = parseCoordinatesString(classificationItem.geometry.coordinates);
    }
    return classificationItem;
  });
}

  return geoJson;
};

onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:8090/field/featureCollection/${areaId}`, {
      withCredentials: true
    });

    if (response && response.data) {
      console.log("Dados recebidos da API:", response.data.features);

      // Processa os dados principais e a classificação de uma vez
      data.value = processGeoJsonCoordinates(response.data.features);
      console.log("Dados processados:", data.value);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);
  }
});

watchEffect(() => {
  if (!data.value) return;

  infoList.value = [
    { title: 'ID', value: data.value.properties.id },
    { title: 'Nome', value: data.value.properties.name },
    { title: 'Cultura', value: data.value.properties.culture },
    { title: 'Área (ha)', value: data.value.properties.area },
    { title: 'Safra', value: data.value.properties.harvest },
    { title: 'Status', value: data.value.properties.status },
    { title: 'Solo', value: data.value.properties.soil },
    { title: 'Produtividade', value: data.value.properties.productivity ?? 'Não informado' },
    { title: 'Nome da Fazenda', value: data.value.properties.farm?.farmName ?? 'Não informado' },
    { title: 'Cidade', value: data.value.properties.farm?.farmCity ?? 'Não informado' },
    { title: 'Estado', value: data.value.properties.farm?.farmState ?? 'Não informado' }
  ];
});

</script>

<template>
  <Layout>
    <div class="d-flex w-100">
      <div v-if="data" class="sidebar d-flex flex-column align-items-center p-3 h-100">
        <h5 class="fw-bold border-bottom border-2 py-3 mb-3 h3 w-100">Detalhes da Área</h5>
        <div class="w-100 overflow-auto">
          <div v-for="(item, index) in infoList" :key="index" class="mb-3">
            <p class="mb-1 text-muted fw-semibold">{{ item.title }}</p>
            <p class="mb-1">{{ item.value }}</p>
            <hr class="my-2">
          </div>
        </div>
      <button class="btn w-100 buttonEdit text-white fw-bold">Editar</button>
      </div>
      <div class="flex-grow-1" v-if="data">
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

.buttonEdit {
  background-color: #18813d;
}
</style>
