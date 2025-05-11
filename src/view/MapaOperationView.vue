<script setup>
import { ref, watchEffect, onMounted, watch, computed } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import MapDetailsGlebe from '../components/Map/MapDetailsGlebe/MapDetailsGlebe.vue';
import ManualClassificationPanel from '../components/Map/MapDetailsGlebe/ManualClassificationPanel.vue'
import RevisionClassificationPanel from '../components/Map/MapDetailsGlebe/RevisionClassificationPane.vue'
import { useRoute } from 'vue-router';
import api from "@/components/util/API.js";
import { getFeatureCollection } from "@/components/Map/MapDetailsGlebe/util/LoadClassification.js";


const route = useRoute();
const areaId = route.params.id;
const data = ref(null);
const infoList = ref([]);
const originalInfoList = ref([]);;
const isClickedToManual = ref(false);
const isClickedToRevision = ref(false);
const isEditing = ref(false);

const cultures = ref([]);
const soils = ref([]);
const farms = ref([]);

const users = ref([]);
const selectedUser = ref('');
const analysts = computed(() => users.value.filter(user => user.isAnalyst));
const consultants = computed(() => users.value.filter(user => user.isConsultant));

const modalMessageTitle = ref('');
const modalMessageBody = ref('');
const modalMessageType = ref('success');

onMounted(async () => {
  try {
    const responseFeatureCollection = await getFeatureCollection(areaId);
    if (responseFeatureCollection) {
      data.value = responseFeatureCollection;
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
});


function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }
}

// EDITAR TALHÃO
function handleEdit() {
  originalInfoList.value = infoList.value.map(item => ({ ...item }));
  isEditing.value = true;
}

const errorDownload = ref("");

async function handleDownloadGlebe() {
  try {

    const response = await api.get(`/field/${areaId}/downloadTalhao`, {
      withCredentials: true,
      responseType: 'blob'
    });

    const link = document.createElement('a');
    const url = window.URL.createObjectURL(new Blob([response.data]));
    link.href = url;

    const disposition = response.headers['content-disposition'];
    const matches = /filename="([^"]*)"/.exec(disposition);
    const filename = matches && matches[1] ? matches[1] : 'download.zip';
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      errorDownload.value = error.response.data.error;
    } else {
      errorDownload.value = "Erro inesperado ao fazer download.";
    }

    const modal = new bootstrap.Modal(document.getElementById('modalDownloadError'));
    modal.show();
  }
}

function cancelEdit() {
  infoList.value = originalInfoList.value.map(item => ({ ...item }));
  isEditing.value = false;
}

// Editar
function mapInfoListToDataStructure() {
  const cultureName = getValueByTitle('Cultura');
  const soilName = getValueByTitle('Solo');
  const farmName = getValueByTitle('Nome da Fazenda');

  const selectedCulture = cultures.value.find(c => c.name === cultureName);
  const selectedSoil = soils.value.find(s => s.name === soilName);
  const selectedFarm = farms.value.find(f => f.farmName === farmName);

  return {
    id: data.value.properties.id,
    name: getValueByTitle('Nome'),
    culture: {
      id: selectedCulture?.id || null,
      name: cultureName
    },
    area: parseFloat(getValueByTitle('Área (ha)')) || null,
    harvest: getValueByTitle('Safra'),
    soil: {
      id: selectedSoil?.id || null,
      name: soilName
    },
    productivity: parseFloat(getValueByTitle('Produtividade')) || null,
    farm: {
      id: selectedFarm?.id || null,
      farmName: farmName,
      farmCity: getValueByTitle('Cidade'),
      farmState: getValueByTitle('Estado')
    }
  };
}

function getValueByTitle(title) {
  const item = infoList.value.find(i => i.title === title);
  return item ? item.value : null;
}

async function saveEdit() {
  const editedData = mapInfoListToDataStructure();

  try {
    await api.put(`/field/${areaId}/update`, editedData, {
      withCredentials: true
    });

    const modal = new bootstrap.Modal(document.getElementById('modalUpdateSuccess'));
    modal.show();
    isEditing.value = false;
  } catch (error) {
    console.error("Erro ao salvar dados:", error);

    const modal = new bootstrap.Modal(document.getElementById('modalUpdateError'));
    modal.show();
  }
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

watch(
  () => getValueByTitle('Nome da Fazenda'),
  (newFarmName) => {
    const selectedFarm = farms.value.find(f => f.farmName === newFarmName);
    if (selectedFarm) {
      setValueByTitle('Cidade', selectedFarm.farmCity ?? 'Não informado');
      setValueByTitle('Estado', selectedFarm.farmState ?? 'Não informado');
    }
  }

);

function setValueByTitle(title, newValue) {
  const item = infoList.value.find(i => i.title === title);
  if (item) item.value = newValue;
}

async function loadData() {
  try {
    const [culturesRes, soilsRes, farmsRes, featureRes, usersRes] = await Promise.all([
      api.get('/cultures', { withCredentials: true }),
      api.get('/soil', { withCredentials: true }),
      api.get('/farm', { withCredentials: true }),
      api.get(`/field/featureCollection/${areaId}`, { withCredentials: true }),
      api.get('/user/listarUsuarios', { withCredentials: true })
    ]);

    cultures.value = culturesRes.data;
    soils.value = soilsRes.data;
    farms.value = farmsRes.data;
    users.value = usersRes.data;

    if (featureRes && featureRes.data) {
      data.value = processGeoJsonCoordinates(featureRes.data.features);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
};

onMounted(() => {
  loadData();
});

watchEffect(() => {
  if (!data.value) return;

  infoList.value = [
    { title: 'ID', value: data.value.properties.id },
    { title: 'Nome', value: data.value.properties.name },
    { title: 'Cultura', value: data.value.properties.culture.nome },
    { title: 'Área (ha)', value: data.value.properties.area },
    { title: 'Safra', value: data.value.properties.harvest },
    { title: 'Status', value: data.value.properties.status },
    { title: 'Solo', value: data.value.properties.soil.nome ?? 'Não informado' },
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
      <template v-if="isClickedToManual === false && isClickedToRevision === false">
        <div v-if="data" class="sidebar d-flex flex-column align-items-center p-3 h-100">
          <h5 class="fw-bold border-bottom border-2 py-3 mb-3 h3 w-100">Detalhes do Talhão</h5>
          <div class="w-100 overflow-auto">
            <div v-for="(item, index) in infoList" :key="index" class="mb-3">
              <p class="mb-1 text-muted fw-semibold">{{ item.title }}</p>
              <template v-if="isEditing">
                <template v-if="item.title === 'Cultura'">
                  <select v-model="item.value" class="form-select">
                    <option v-for="culture in cultures" :key="culture.id" :value="culture.name">
                      {{ culture.name }}
                    </option>
                  </select>
                </template>

                <template v-else-if="item.title === 'Solo'">
                  <select v-model="item.value" class="form-select">
                    <option v-for="soil in soils" :key="soil.id" :value="soil.name">
                      {{ soil.name }}
                    </option>
                  </select>
                </template>

                <template v-else-if="item.title === 'Nome da Fazenda'">
                  <select v-model="item.value" class="form-select">
                    <option v-for="farm in farms" :key="farm.id" :value="farm.farmName">
                      {{ farm.farmName }}
                    </option>
                  </select>
                </template>

                <template v-else>
                  <input v-model="item.value" class="form-control" :disabled="['ID', 'Área (ha)', 'Status', 'Cidade', 'Estado'].includes(item.title)" />
                </template>
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
              <template v-if="infoList.find(item => item.title === 'Status')?.value === 'Aprovado'">
                <button class="btn btn-dark w-100 fw-bold" @click="handleDownloadGlebe">Download do talhão</button>
              </template>
            </div>
          </template>
        </div>
      </template>

      <!-- Classificação -->
      <ManualClassificationPanel
        v-if="isClickedToManual"
        :data="data"
        :analysts="analysts"
        :selectedUser="selectedUser"
        @update:selectedUser="val => selectedUser.value = val"
        @cancel="isClickedToManual = false"
      />

      <!-- Revisao -->
      <RevisionClassificationPanel
        v-if="isClickedToRevision"
        :data="data"
        :consultants="consultants"
        @cancel="isClickedToRevision = false"
      />

      <!-- Mapa -->
      <div class="flex-grow-1" v-if="data">
        <MapDetailsGlebe :data="data" :isClickedToManual="isClickedToManual" :isClickedToRevision="isClickedToRevision" />
      </div>

      <!-- Botões flutuantes -->
      <template v-if="!isEditing && !isClickedToManual && !isClickedToRevision">
        <div class="divButton">
          <template v-if="data?.properties?.status === 'Pendente' || data?.properties?.status === 'Reprovado'">
            <button class="btn btn-primary button" @click="isClickedToManual = true">Classificar</button>
          </template>
          <template v-if="data?.properties?.status === 'Em Análise'">
            <button class="btn btn-primary button" @click="isClickedToRevision = true">Avaliar</button>
          </template>
        </div>
      </template>


      <!-- Modal modalUpdateSuccess -->
      <div class="modal fade" id="modalUpdateSuccess" tabindex="-1" aria-labelledby="modalUpdateSuccessLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-success">
            <div class="modal-header bg-success text-white">
              <h1 class="modal-title fs-4" id="modalUpdateSuccessLabel">Dados atualizados com sucesso!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              Sua edição foi salva com sucesso.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success fw-bold" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal modalUpdateError -->
      <div class="modal fade" id="modalUpdateError" tabindex="-1" aria-labelledby="modalUpdateErrorLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-error">
            <div class="modal-header bg-danger text-white">
              <h1 class="modal-title fs-4" id="modalUpdateErrorLabel">Erro ao atualizar os dados!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              Por favor, revise os dados inseridos e tente novamente.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger fw-bold" data-bs-dismiss="modal">Revisar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal modalDownloadError -->
      <div class="modal fade" id="modalDownloadError" tabindex="-1" aria-labelledby="modalDownloadErrorLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-error">
            <div class="modal-header bg-danger text-white">
              <h1 class="modal-title fs-4" id="modalDownloadErrorLabel">Erro ao realizar o download!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              {{ errorDownload }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger fw-bold" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal modalClassifySuccess -->
      <div class="modal fade" id="modalClassifySuccess" tabindex="-1" aria-labelledby="modalClassifySuccessLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-success">
            <div class="modal-header bg-success text-white">
              <h1 class="modal-title fs-4" id="modalClassifySuccessLabel">Classificação salva com sucesso!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              Sua classificação foi registrada corretamente no sistema.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success fw-bold" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Generico -->
      <div class="modal fade" id="modalMessage" tabindex="-1" aria-labelledby="modalMessageLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header" :class="modalMessageType === 'success' ? 'bg-success text-white' : 'bg-danger text-white'">
              <h1 class="modal-title fs-4" id="modalMessageLabel">{{ modalMessageTitle }}</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
              {{ modalMessageBody }}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn fw-bold"
                      :class="modalMessageType === 'success' ? 'btn-success' : 'btn-danger'"
                      data-bs-dismiss="modal">
                Fechar
              </button>
            </div>
          </div>
        </div>
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
</style>
