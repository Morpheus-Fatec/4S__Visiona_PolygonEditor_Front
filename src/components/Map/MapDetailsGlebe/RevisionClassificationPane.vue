<!-- AvaliationPanel.vue -->
<template>
  <div v-if="data" class="sidebar d-flex flex-column p-3 h-100 gap-2 w-25">
    <!-- Card de instruções -->
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
            <p class="card-text text-black lh-sm">
              Clique no ícone de desenho no canto superior direito da tela para desenhar um polígono. Após concluir o desenho, adicione uma observação.
            </p>
          </div>
          <div>
            <h5 class="h5 card-title fw-semibold text-light">Editar um polígono:</h5>
            <p class="card-text text-black lh-sm">Clique no polígono para editar. Para finalizar, clique fora do polígono.</p>
          </div>
          <div>
            <h5 class="h5 card-title fw-semibold text-light">Apagar um polígono:</h5>
            <p class="card-text text-black lh-sm">Clique e segure no polígono para excluí-lo.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dados da avaliação -->
    <div class="card d-flex flex-column gap-3 overflow-auto border-dark-subtle">
      <div class="card-body d-flex flex-column gap-3">
        <h5 class="fw-bold border-bottom border-2 pb-2 h4 w-100">Avaliação da Classificação Manual</h5>
        <h5 class="fw-bold h5 w-100 text-body-secondary">Dados da Classificação</h5>

        <div>
          <p class="mb-2 text-muted fw-semibold">Analista responsável</p>
          <input class="form-control" disabled :value="selectedUser || ''" />
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Consultor responsável</p>
          <input class="form-control" disabled :value="usuario.nome" />
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

    <!-- Ações -->
    <div class="w-100 mt-auto d-flex flex-column gap-2">
      <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClickToAvaliation">Cancelar Avaliação</button>
      <button class="btn btn-success w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalSaveToAssess">Concluir Avaliação</button>
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
          A classificação manual foi realizada pelo consultor <span class="fw-bold"> {{ getConsultantName(selectedUserConsultant) }}</span>. Após a sua análise e verificação das informações fornecidas na classificação,
          você deseja aceitar ou recusar esta classificação manual de ervas daninhas?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-dark fw-bold border" @click="handleSaveAnalisct('REJECTED')">Recusar</button>
          <button type="button" class="btn btn-success fw-bold" @click="handleSaveAnalisct('APPROVED')">Aprovar</button>
        </div>
      </div>
    </div>
  </div>

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
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePolygonStore } from '../../../store/PolygonStore';
import api from "@/components/util/API.js";



const props = defineProps({
  data: Object,
  consultants: Array,
});

const data = ref(props.data)
const selectedUser = 1;
console.log('selectedUser', selectedUser);
const emit = defineEmits(['cancel']);
const polygonStore = usePolygonStore();
const polygonsAnalisct = computed(() => polygonStore.polygonsDrawAnalisct);
const isClickedToRevision = ref(false)
const selectedUserConsultant = ref('')
const beginTime = ref("");
const endTime = ref("");
const selectedConsultantId = ref('')
const modalMessageTitle = ref('');
const modalMessageBody = ref('');
const modalMessageType = ref('success');
const usuario = JSON.parse(localStorage.getItem('usuario'));

const getConsultantName = (selectedUserConsultantId) => {
  selectedConsultantId.value = selectedUserConsultantId;
  const consultant = props.consultants.find(user => user.id === selectedUserConsultantId);
  return consultant ? consultant.name : 'Consultor desconhecido';
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


handleClickToAssess();

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

const cancelClickToAvaliation = () => {
  emit('cancel');
};

async function handleClickToAssess() {
  if (!data.value || !data.value.properties.status) {
    showModalMessage(
      'Erro',
      'Não foi possível identificar o status do talhão.',
      'error'
    );
    return;
  }

  beginTime.value = formatDate(new Date());
  const status = data.value.properties.status;

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
      isClickedToRevision.value = true;
      break;

    default:
      showModalMessage(
        'Erro',
        'Status desconhecido. Não é possível realizar a avaliação.',
        'error'
      );
  }

  isClickedToRevision.value = true;
}

function buildSaveAvailablePayload(status) {
  endTime.value = formatDate(new Date());

  const userResponsable = selectedConsultantId.value;

  if (!userResponsable) {
    console.error("Usuário não encontrado");
    return;
  }

  const featuresGeometry = polygonsAnalisct.value.features.map(feature => {
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
    userResponsable: usuario.id,
    status: status,
    begin: beginTime.value,
    end: endTime.value,
    features: featuresGeometry,
  };

  return payload;
}


function canSaveAnalisct() {
  return selectedUserConsultant.value !== "";
}

async function handleSaveAnalisct(status) {
  const modalSaveEl = document.getElementById('modalSaveClassified');
  const modalSaveInstance = bootstrap.Modal.getInstance(modalSaveEl);
  if (modalSaveInstance) {
    modalSaveInstance.hide();
  }

  if (!canSaveAnalisct()) {
    showModalMessage(
      'Dados Incompletos',
      'Por favor, selecione um usuário e adicione um polígono.',
      'error'
    );
    return;
  }

  const payload = buildSaveAvailablePayload(status);  // Passando o status para a função

  try {
    const response = await api.post('/classification/revisonClassification', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    if (response && response.data) {
      showModalMessage(
        'Classificação Salva',
        'Sua classificação foi registrada corretamente no sistema!',
        'success'
      );
      isClickedToRevision.value = false;
      selectedUserConsultant.value = "";
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

  async function loadData() {
    window.location.reload();
  }
}

</script>
