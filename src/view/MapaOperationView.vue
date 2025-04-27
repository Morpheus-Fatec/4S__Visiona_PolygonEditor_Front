<script setup>
import { ref, watchEffect, onMounted, watch, computed } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import MapDetailsGlebe from '../components/Map/MapDetailsGlebe/MapDetailsGlebe.vue';
import { useRoute } from 'vue-router';
import api from "@/components/util/API.js";
import { usePolygonStore } from '../store/PolygonStore';

const polygonStore = usePolygonStore();
const polygons = computed(() => polygonStore.polygonsDraw);
console.log(polygons.value);

const route = useRoute();
const areaId = route.params.id;
const data = ref(null);
const infoList = ref([]);
const originalInfoList = ref([]);
const isClickedClassified = ref(false);
const isClickedToAssess = ref(false);
const isEditing = ref(false);

const showRejectionInput = ref(false);
const showApprovalInput = ref(false);
const rejectionReason = ref('');

const cultures = ref([]);
const soils = ref([]);
const farms = ref([]);

const users = ref([]);
const selectedUser = ref('');
const analysts = computed(() => users.value.filter(user => user.isAnalyst));
const consultants = computed(() => users.value.filter(user => user.isConsultant));

const beginTime = ref(null);
const endTime = ref(null);

const modalMessageTitle = ref('');
const modalMessageBody = ref('');
const modalMessageType = ref('success');

const glebeAvailable = ref([]);
const isClickedClassifiedManual = ref(false);

function showModalMessage(title, body, type = 'success') {
  const openModals = document.querySelectorAll('.modal.show');
  openModals.forEach(modal => {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  });

  modalMessageTitle.value = title;
  modalMessageBody.value = body;
  modalMessageType.value = type;

  const modalEl = document.getElementById('modalMessage');
  const modalInstance = new bootstrap.Modal(modalEl);
  modalInstance.show();
}

onMounted(async () => {
  try {
   // Lógica para carregar os dados do talhão
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

function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }
}

// Responsável pela classificação
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function handleClickClassified() {
  isClickedClassified.value = true;
  beginTime.value = formatDate(new Date());
}

function cancelClassified() {
  isClickedClassified.value = false;
}

function buildSaveClassificationPayload() {
  endTime.value = formatDate(new Date());

  const featuresGeometry = polygons.value.features.map(feature => {
    const updatedFeature = {
      ...feature,
      geometry: {
        type: "MultiPolygon",
        coordinates: JSON.stringify(
          feature.geometry.type === "Polygon"
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates
        )
      }
    };
    return updatedFeature;
  });

  const payload = {
    idField: data.value.properties.id,
    userResponsable: selectedUser.value,
    status: "PENDING",
    begin: beginTime.value,
    end: endTime.value,
    features: featuresGeometry,
  };

  return payload;
}

function canSave() {
  return selectedUser.value !== "" && polygons.value && Array.isArray(polygons.value.features) && polygons.value.features.length > 0;
}

async function handleSaveClassification() {
  const modalSaveEl = document.getElementById('modalSaveClassified');
  const modalSaveInstance = bootstrap.Modal.getInstance(modalSaveEl);
  if (modalSaveInstance) {
    modalSaveInstance.hide();
  }

  if (!canSave()) {
    showModalMessage(
      'Dados Incompletos',
      'Por favor, selecione um usuário e adicione um polígono.',
      'error'
    );
    return;
  }

  const payload = buildSaveClassificationPayload();
  console.log(payload);

  try {
    // Requisição POST com axios
    const response = await api.post('/classification/manualClassification', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log('JSON:', payload);

    if (response && response.data) {
      console.log('Resposta da API:', response.data);
      showModalMessage(
        'Classificação Salva',
        'Sua classificação foi registrada corretamente no sistema!',
        'success'
      );
      isClickedClassified.value = false;
      selectedUser.value = "";
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'data'");
      showModalMessage(
        'Erro',
        'Ocorreu um erro ao salvar a classificação. Tente novamente.',
        'error'
      );
    }
  } catch (error) {
    console.error("Erro ao salvar classificação:", error);
    showModalMessage(
      'Erro',
      'Ocorreu um erro ao salvar a classificação. Tente novamente.',
      'error'
    );
  }
}

// Responsável pela avaliacao
async function handleClickToAssess() {
  if (!data.value || !data.value.properties.status) {
    showModalMessage(
      'Erro',
      'Não foi possível identificar o status do talhão.',
      'error'
    );
    return;
  }

  const status = data.value.properties.status;

  // Mensagens personalizadas para cada status
  switch (status) {
    case 'PENDING':
    case 'Pendente':
    case 'Pending':
      showModalMessage(
        'Ação não permitida',
        'O talhão está com o status "Pendente". Por favor, aguarde a análise inicial.',
        'error'
      );
      break;

    case 'APPROVED':
    case 'Aprovado':
    case 'Approved':
      showModalMessage(
        'Ação não permitida',
        'O talhão já foi aprovado. Não é possível realizar uma nova avaliação.',
        'error'
      );
      break;

    case 'REJECTED':
    case 'Reprovado':
    case 'Rejected':
      showModalMessage(
        'Ação não permitida',
        'O talhão foi reprovado. Não é possível realizar uma nova análise.',
        'error'
      );
      break;

    case 'NO_SOLUTION':
    case 'Sem Solução':
    case 'No Solution':
      showModalMessage(
        'Ação não permitida',
        'O talhão está marcado como "Sem Solução". Não é possível realizar uma avaliação.',
        'error'
      );
      break;

    case 'UNDER_ANALYSIS':
    case 'Em Análise':
    case 'Under Analysis':
      // Permite a avaliação
      isClickedToAssess.value = true;
      break;

    default:
      showModalMessage(
        'Erro',
        'Status desconhecido. Não é possível realizar a avaliação.',
        'error'
      );
  }

  const response = await api.get(`/field/manualCollection/${areaId}`, {
    withCredentials: true,
  });
  glebeAvailable.value = response.data;

  isClickedClassifiedManual.value = true;
}
function cancelClickToAssess() {
  isClickedToAssess.value = false;
  glebeAvailable.value = null;
  isClickedClassifiedManual.value = false;
}

function resetModal() {
  showRejectionInput.value = false;
  rejectionReason.value = '';
}

function confirmRejection() {
  if (!rejectionReason.value.trim()) {
    alert("Por favor, descreva o motivo da recusa.");
    return;
  }

  console.log("Motivo da recusa:", rejectionReason.value);
  resetModal();

  const modal = bootstrap.Modal.getInstance(document.getElementById('modalSaveToAssess'));
  modal.hide();

  const successModal = new bootstrap.Modal(document.getElementById('modalRejectionSuccess'));
  successModal.show();

  isClickedToAssess.value = false;
}
function confirmApproval() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalSaveToAssess'));
  modal.hide();

  const successModal = new bootstrap.Modal(document.getElementById('modalApprovalSuccess'));
  successModal.show();

  isClickedToAssess.value = false;
}

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
    const response = await api.put(`/field/${areaId}/update`, editedData, {
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

onMounted(async () => {
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
    console.log('users', users.value);

    if (featureRes && featureRes.data) {
      data.value = processGeoJsonCoordinates(featureRes.data.features);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
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
      <template v-if="isClickedClassified === false && isClickedToAssess === false">
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

      <!-- Avaliação -->
      <template v-if="isClickedToAssess === true">
        <div v-if="data" class="sidebar d-flex flex-column p-3 h-100 gap-2">
          <div class="card border-info bg-info bg-gradient">
            <div class="d-flex align-items-center px-3 pt-3">
              <button class="d-flex justify-content-between align-items-center w-100 bg-transparent border-0 fw-bold h4 border-bottom border-2 border-white pb-2 text-white"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#manualClassificationContent"
                      aria-expanded="false"
                      aria-controls="manualClassificationContent">
                <span>Como Avaliar?</span>
                <i class="bi bi-question-circle ms-2"></i>
              </button>
            </div>
            <div id="manualClassificationContent" class="collapse">
              <div class="card-body d-flex flex-column gap-3">
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Desenhar um polígono:</h5>
                  <p class="card-text text-black lh-sm">Clique no ícone de desenho no canto superior direito da tela para desenhar um polígono. Após concluir o desenho do polígono, é necessário adicionar uma observação à classificação.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Editar um polígono:</h5>
                  <p class="card-text text-black  lh-sm">Clique no polígono para realizar a edição. Para finalizar, clique fora do polígono.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Apagar um polígono:</h5>
                  <p class="card-text text-black lh-sm">Clique e segure no polígono para realizar a exclusão.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card d-flex flex-column gap-3 overflow-auto border-dark-subtle">
            <div class="card-body d-flex flex-column gap-3">
              <h5 class="fw-bold border-bottom border-2 pb-2 h4 w-100">Avaliação da Classificação Manual</h5>
              <h5 class="fw-bold h5 w-100 text-body-secondary">Dados da Classificação</h5>
              <div>
                <p class="mb-2 text-muted fw-semibold">Consultor responsável</p>
                <select class="form-select text-muted" v-model="selectedUser">
                  <option disabled value="">Consultor responsável</option>
                  <option
                    v-for="user in consultants"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }}
                  </option>
                </select>
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Nome Talhão</p>
                <input class="form-control" disabled :value=data.properties.name />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Fazenda</p>
                <input class="form-control" disabled :value=data.properties.farm.farmName />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Cidade</p>
                <input class="form-control" disabled :value=data.properties.farm.farmCity />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Estado</p>
                <input class="form-control" disabled :value=data.properties.farm.farmState />
              </div>
            </div>
          </div>
          <div class="w-100 mt-auto d-flex flex-column gap-2">
            <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClickToAssess">Cancelar Avaliação</button>
            <button class="btn btn-success w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalSaveToAssess">Realizar aprovação</button>
          </div>
        </div>
      </template>

      <!-- Classificação -->
      <template v-if="isClickedClassified === true">
        <div v-if="data" class="sidebar d-flex flex-column p-3 h-100 gap-2">
          <div class="card border-info bg-info bg-gradient">
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
                  <p class="card-text text-black lh-sm">Clique no ícone de desenho localizado no canto superior direito da tela para desenhar um polígono.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Editar um polígono:</h5>
                  <p class="card-text text-black  lh-sm">Clique no polígono para realizar a edição. Para finalizar, clique fora do polígono.</p>
                </div>
                <div>
                  <h5 class="h5 card-title fw-semibold text-light">Apagar um polígono:</h5>
                  <p class="card-text text-black lh-sm">Clique e segure no polígono para realizar a exclusão.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card d-flex flex-column gap-3 overflow-auto border-dark-subtle">
            <div class="card-body d-flex flex-column gap-3">
              <h5 class="fw-bold border-bottom border-2 pb-2 h4 w-100">Classificação Manual</h5>
              <h5 class="fw-bold h5 w-100 text-body-secondary">Dados da Classificação</h5>
              <div>
                <p class="mb-2 text-muted fw-semibold">Analista responsável</p>
                <select class="form-select text-muted" v-model="selectedUser">
                  <option disabled value="">Escolha o analista</option>
                  <option
                    v-for="user in analysts"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }}
                  </option>
                </select>
              </div>
              <div>
                <p class="mb-2 text-muted fw-semibold">Nome Talhão</p>
                <input class="form-control" disabled :value=data.properties.name />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Fazenda</p>
                <input class="form-control" disabled :value=data.properties.farm.farmName />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Cidade</p>
                <input class="form-control" disabled :value=data.properties.farm.farmCity />
              </div>

              <div>
                <p class="mb-2 text-muted fw-semibold">Estado</p>
                <input class="form-control" disabled :value=data.properties.farm.farmState />
              </div>
            </div>
          </div>
          <div class="w-100 mt-auto d-flex flex-column gap-2">
            <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClassified">Cancelar</button>
            <button class="btn btn-success w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalSaveClassified">Salvar Classificação</button>
          </div>
        </div>
      </template>

      <!-- Mapa -->
      <div class="flex-grow-1" v-if="data">
        <MapDetailsGlebe :data="data" :isClickedClassified="isClickedClassified" :glebeAvailable="glebeAvailable" :isClickedClassifiedManual="isClickedClassifiedManual"/>
      </div>

      <!-- Botões flutuantes -->
      <template v-if="!isEditing && !isClickedClassified && !isClickedToAssess">
        <div class="divButton">
          <button class="btn btn-primary button" @click="handleClickClassified">Classificar</button>
          <button class="btn btn-primary button" @click="handleClickToAssess">Avaliar</button>
        </div>
      </template>

      <!-- Modal modalSaveClassified -->
      <div class="modal fade" id="modalSaveClassified" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-4 " id="exampleModalLabel">Deseja salvar a classificação?</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body lh-base">
              Ao clicar em <span class="fw-bold">Salvar Classificação</span>, os dados inseridos na classificação manual serão registrados no sistema e
              armazenados no banco de dados. Em seguida, essa classificação será encaminhada automaticamente para o processo
              de análise.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-dark fw-bold border" data-bs-dismiss="modal">Revisar</button>
              <button type="button" class="btn btn-success fw-bold" @click="handleSaveClassification">Salvar Classificação</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Realizar avaliação -->
      <div class="modal fade" id="modalSaveToAssess" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-4" id="exampleModalLabel">Como deseja avaliar a classificação?</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetModal"></button>
            </div>
            <div class="modal-body lh-base">
              A classificação manual foi realizada pelo consultor <span class="fw-bold">Elbert Jean</span>. Após a sua análise e verificação das informações fornecidas na classificação,
              você deseja aceitar ou recusar esta classificação manual de ervas daninhas?

              <div v-if="showRejectionInput" class="mt-3">
                <label for="rejectionReason" class="form-label fw-bold">Descreva o motivo</label>
                <textarea id="rejectionReason" class="form-control" v-model="rejectionReason" rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <template v-if="!showRejectionInput">
                <button type="button" class="btn btn-dark fw-bold border" @click="showRejectionInput = true">Recusar</button>
                <button type="button" class="btn btn-success fw-bold" @click="confirmApproval">Aprovar</button>
              </template>
              <template v-else>
                <button type="button" class="btn btn-secondary fw-bold border" @click="resetModal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold" @click="confirmRejection">Confirmar Recusa</button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal modalApprovalSuccess -->
      <div class="modal fade" id="modalApprovalSuccess" tabindex="-1" aria-labelledby="modalApprovalSuccessLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-success">
            <div class="modal-header bg-success text-white">
              <h1 class="modal-title fs-4" id="modalApprovalSuccessLabel">Aprovação realizada com sucesso!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              A classificação foi aprovada e registrada com sucesso no sistema.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success fw-bold" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Recusa com Sucesso -->
      <div class="modal fade" id="modalRejectionSuccess" tabindex="-1" aria-labelledby="modalRejectionSuccessLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-danger">
            <div class="modal-header bg-danger text-white">
              <h1 class="modal-title fs-4" id="modalRejectionSuccessLabel">Classificação recusada com sucesso!</h1>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              A classificação foi recusada e o motivo foi registrado no sistema.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger fw-bold" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>

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
