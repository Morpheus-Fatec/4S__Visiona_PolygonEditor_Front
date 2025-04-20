<script setup>
import { ref, watchEffect, onMounted, watch } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import MapDetailsGlebe from '../components/Map/MapDetailsGlebe/MapDetailsGlebe.vue';
import { useRoute } from 'vue-router';
import api from "@/components/util/API.js";

const route = useRoute();
const areaId = route.params.id;
const data = ref(null);
const infoList = ref([]);
const originalInfoList = ref([]);
const isClickedClassified = ref(false);
const isEditing = ref(false);

function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }
}

function handleClickClassified() {
  isClickedClassified.value = true;
}

function cancelClassified() {
  isClickedClassified.value = false;
}

function handleEdit() {
  originalInfoList.value = infoList.value.map(item => ({ ...item }));
  isEditing.value = true;
}

function cancelEdit() {
  infoList.value = originalInfoList.value.map(item => ({ ...item }));
  isEditing.value = false;
}

function saveEdit() {
  alert("Dados salvos com sucesso!");
  isEditing.value = false;
}

const processGeoJsonCoordinates = (geoJson) => {
  if (!geoJson || typeof geoJson !== "object") {
    console.error("GeoJSON inválido:", geoJson);
    return geoJson;
  }

  if (geoJson.geometry && typeof geoJson.geometry.coordinates === 'string') {
    geoJson.geometry.coordinates = parseCoordinatesString(geoJson.geometry.coordinates);
  }

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
    const response = await api.get(`/field/featureCollection/${areaId}`, {
      withCredentials: true
    });

    if (response && response.data) {
      data.value = processGeoJsonCoordinates(response.data.features);
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
    { title: 'Solo', value: data.value.properties.soil ?? 'Não informado' },
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

      <!-- Detalhes da Área -->
      <template v-if="isClickedClassified === false">
        <div v-if="data" class="sidebar d-flex flex-column align-items-center p-3 h-100">
          <h5 class="fw-bold border-bottom border-2 py-3 mb-3 h3 w-100">Detalhes da Área</h5>
          <div class="w-100 overflow-auto">
            <div v-for="(item, index) in infoList" :key="index" class="mb-3">
              <p class="mb-1 text-muted fw-semibold">{{ item.title }}</p>
              <template v-if="isEditing">
                <input v-model="item.value" class="form-control" />
              </template>
              <template v-else>
                <p class="mb-1">{{ item.value }}</p>
              </template>
              <hr class="my-2">
            </div>
          </div>
          <template v-if="isEditing">
            <div class="w-100 mt-auto d-flex flex-column gap-2">
              <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelEdit">Cancelar</button>
              <button class="btn btn-success w-100 fw-bold" @click="saveEdit">Salvar Edição</button>
            </div>
          </template>
          <template v-else>
            <div class="w-100 mt-auto d-flex flex-column gap-2">
              <button class="btn btn-success w-100 fw-bold" @click="handleEdit">Editar</button>
            </div>
          </template>  
        </div>
      </template>

      <!-- Classificação -->
      <template v-if="isClickedClassified === true">
        <div v-if="data" class="sidebar d-flex flex-column p-3 h-100 gap-2">
          <div class="card border-info bg-info">
            <div class="d-flex align-items-center px-3 pt-3">
              <button class="d-flex justify-content-between align-items-center w-100 bg-transparent border-0 fw-bold h4 border-bottom border-2 border-white pb-2 text-white"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#manualClassificationContent"
                      aria-expanded="false"
                      aria-controls="manualClassificationContent">
                <span>Como Classificar?</span>
                <i class="bi bi-question-circle ms-2"></i>
              </button>
            </div>
            <div id="manualClassificationContent" class="collapse">
              <div class="card-body d-flex flex-column gap-3">
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Desenhar um polígono:</h5>
                  <p class="card-text text-edited lh-sm">Clique no ícone de desenho localizado no canto superior direito da tela para desenhar um polígono.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Editar um polígono:</h5>
                  <p class="card-text text-edited  lh-sm">Clique no polígono para realizar a edição. Para finalizar, clique fora do polígono.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Apagar um polígono:</h5>
                  <p class="card-text text-edited lh-sm">Clique e segure no polígono para realizar a exclusão.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card d-flex flex-column gap-3 overflow-auto border-dark-subtle">
            <div class="card-body d-flex flex-column gap-3">
              <h5 class="fw-bold border-bottom border-2 pb-2 h4 w-100 ">Classificação Manual</h5>
              <h5 class="fw-bold h5 w-100 text-body-secondary">Dados do Classificação</h5>
              <div>
                <p class="mb-2 text-muted fw-semibold">Editor</p>
                <input class="form-control"  />
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Área</p>
                <input class="form-control"  />
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Data Iniciada</p>
                <input class="form-control"  />
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Data Encerrada</p>
                <input class="form-control"  />
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Pipipi</p>
                <input class="form-control"  />
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Popopo</p>
                <input class="form-control"  />
              </div>
            </div>
          </div>
          <div class="w-100 mt-auto d-flex flex-column gap-2">
            <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClassified">Cancelar</button>
            <button class="btn btn-success w-100 fw-bold">Salvar Classificação</button>
          </div>
        </div>
      </template>

      <!-- Mapa -->
      <div class="flex-grow-1" v-if="data">
        <MapDetailsGlebe :data="data" :isClickedClassified="isClickedClassified"/>
      </div>

      <!-- Botões flutuantes -->
      <template v-if="!isEditing && !isClickedClassified">
        <div class="divButton">
          <button class="btn btn-primary button" @click="handleClickClassified">Classificar</button>
          <button class="btn btn-primary button" @click="zoom = zoom + 1">Avaliar</button>
        </div>
      </template>
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
  display: flex;
  flex-direction: column;
  position: relative;
}

.flex-grow-1 {
  flex-grow: 1;
  height: 100%;
}

hr {
  border-top: 1px solid #dee2e6;
}

.divButton {
  z-index: 9999;
  position: absolute;
  bottom: 20px;
  right: 30%;
  display: flex;
  gap: 20px;
}

.button {
  width: 150px;
}
.text-edited {
  color: #343A40 !important;
}
</style>
