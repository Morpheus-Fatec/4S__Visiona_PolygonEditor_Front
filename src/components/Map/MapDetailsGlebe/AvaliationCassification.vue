<!-- AvaliationPanel.vue -->
<template>
  <div v-if="isClickedToAvaliation && data" class="sidebar d-flex flex-column p-3 h-100 gap-2">
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
          <input class="form-control" disabled :value="currentAnalyst?.name || ''" />
        </div>

        <div>
          <p class="mb-2 text-muted fw-semibold">Consultor responsável</p>
          <select class="form-select text-muted" v-model="selectedUserConsultant">
            <option disabled value="">Escolha o consultor</option>
            <option v-for="user in consultants" :key="user.id" :value="user.id">{{ user.name }}</option>
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

    <!-- Ações -->
    <div class="w-100 mt-auto d-flex flex-column gap-2">
      <button class="btn btn-outline-white w-100 fw-bold border text-success" @click="cancelClickToAssess">Cancelar Avaliação</button>
      <button class="btn btn-success w-100 fw-bold" data-bs-toggle="modal" data-bs-target="#modalSaveToAssess">Realizar aprovação</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: Object,
  analysts: Array,
  selectedUser: Number
});

// Props ou valores reativos compartilhados
const isClickedToAvaliation = ref(false)
const selectedUserConsultant = ref('')

const consultants = ref([])

// Mock temporário para analista
const currentAnalyst = computed(() => props.analysts.value.find(u => u.id) || {})

function cancelClickToAssess() {
  isClickedToAvaliation.value = false
  selectedUserConsultant.value = ''
}
</script>
