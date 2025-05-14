<template>
  <div v-if="data" class="sidebar d-flex flex-column p-3 h-100 gap-2">
    <!-- Ajuda para classificar -->
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

    <!-- Dados da classificação -->
    <div class="card d-flex flex-column gap-3 overflow-auto border-dark-subtle">
      <div class="card-body d-flex flex-column gap-3">
        <h5 class="fw-bold border-bottom border-2 pb-2 h4 w-100">Classificação Manual</h5>
        <h5 class="fw-bold h5 w-100 text-body-secondary">Dados da Classificação</h5>

        <div>
          <p class="mb-2 text-muted fw-semibold">Analista responsável</p>
          <select class="form-select text-muted" v-model="localSelectedUser">
            <option disabled :value="null">Escolha o analista</option>
            <option v-for="user in analysts" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Nome Talhão</p>
          <input class="form-control" disabled :value="data.properties.name" />
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Fazenda</p>
          <input class="form-control" disabled :value="data.properties.farm.farmName" />
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Cidade</p>
          <input class="form-control" disabled :value="data.properties.farm.farmCity" />
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Estado</p>
          <input class="form-control" disabled :value="data.properties.farm.farmState" />
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="w-100 mt-auto d-flex flex-column gap-2">
      <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClassified">Cancelar</button>
      <button class="btn btn-success w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalSaveClassified">Salvar Classificação</button>
    </div>
  </div>

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
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { usePolygonStore } from '../../../store/PolygonStore';
import api from "@/components/util/API.js";

const props = defineProps({
  data: Object,
  analysts: Array,
  selectedUser: Number
});
const emit = defineEmits(['update:selectedUser', 'cancel']);
const polygonStore = usePolygonStore();
const polygons = computed(() => polygonStore.polygonsDraw);
const localSelectedUser = ref(props.selectedUser);
const beginTime = ref("");
beginTime.value = formatDate(new Date());
const endTime = ref("");
const isClickedClassified = ref(false);



watch(localSelectedUser, (newVal) => {
  emit('update:selectedUser', newVal);
});

const cancelClassified = () => {
  emit('cancel');
};

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

const modalMessageTitle = ref('');
const modalMessageBody = ref('');
const modalMessageType = ref('success');

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
    idField: props.data.properties.id,
    userResponsable: localSelectedUser.value,
    status: "PENDING",
    begin: beginTime.value,
    end: endTime.value,
    features: featuresGeometry,
  };

  return payload;
}

function canSave() {
  return localSelectedUser.value !== "" && polygons.value && Array.isArray(polygons.value.features) && polygons.value.features.length > 0;
}

async function handleSaveClassification() {
  const modalSaveEl = document.getElementById('modalSaveClassified');
  const modalSaveInstance = bootstrap.Modal.getInstance(modalSaveEl);
  if (modalSaveInstance) {
    modalSaveInstance.hide();
  }

  console.log("user id: ", localSelectedUser.value)
  console.log(polygons.value);

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
      localSelectedUser.value = "";
      loadData();
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
async function loadData() {
  window.location.reload();
}
</script>
