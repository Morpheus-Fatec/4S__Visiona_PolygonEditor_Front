<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import api from '@/components/util/api';

const analystQuality = ref({})
const allAnalystQuality = ref({})
const progressDataAnalyst = ref([])
const progressDataAllAnalysts = ref([])
const analistList = ref([])
const errorMessage = ref('')
const selectedAnalyst = ref(null)
const analystProdutivity = ref({})
const allAnalystProdutivity = ref({})


const analysisQualityGraph = async (analystId) => {
  try {
    //const response = await axios.get(`https://morpheus05.free.beeceptor.com/todos/${analystId}`);
    const response = await axios.get(`/jsonProgress.json`);
    const dados = response.data;
    console.log(dados);
    analystQuality.value = response.data.analista;
    allAnalystQuality.value = response.data.analistas;
    console.log('analystQuality:', analystQuality.value)
    console.log('allAnalystQuality:', allAnalystQuality.value)

    const totalAnalyst = analystQuality.value.ideal + analystQuality.value.aceitavel + analystQuality.value.plena
    const totalAnalysts = allAnalystQuality.value.ideal + allAnalystQuality.value.aceitavel + allAnalystQuality.value.plena

    progressDataAnalyst.value = [
      { label: 'Ideal', value: (analystQuality.value.ideal / totalAnalyst) * 100, color: 'bg-primary' },
      { label: 'Aceitável', value: (analystQuality.value.aceitavel / totalAnalyst) * 100, color: 'bg-warning' },
      { label: 'Plena', value: (analystQuality.value.plena / totalAnalyst) * 100, color: 'bg-danger' }
    ]

    progressDataAllAnalysts.value = [
      { label: 'Ideal', value: (allAnalystQuality.value.ideal / totalAnalysts) * 100, color: 'bg-primary' },
      { label: 'Aceitável', value: (allAnalystQuality.value.aceitavel / totalAnalysts) * 100, color: 'bg-warning' },
      { label: 'Plena', value: (allAnalystQuality.value.plena / totalAnalysts) * 100, color: 'bg-danger' }
    ]
    console.log('analystQuality:', analystQuality.value)
    console.log('allAnalystQuality:', allAnalystQuality.value)


  } catch (error) {
    console.error('Erro ao buscar dados do endpoint:', error)
  }
};

const fetchUsers = async () => {
  try {
    const response = await api.get('/user/listarUsuarios');
    analistList.value = response.data.filter(user => user.isAnalyst).map(user => ({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      isConsultant: user.isConsultant,
      isAnalyst: user.isAnalyst
    }));
    console.log('analistList:', analistList.value);
    if (analistList.value.length === 0) {
      errorMessage.value = 'Não há analistas.';
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data?.error || 'Erro ao buscar usuários.';
  }
};

const selectAnalyst = (analystId) => {
  selectedAnalyst.value = analistList.value.find(analyst => analyst.id === analystId);
  productivityMetric(analystId);
};

const productivityMetric = async (analystId) => {
  try {
    const response = await axios.get(`jsonMetAnalista.json`);

    //const response = await axios.get(`https://morpheus05.free.beeceptor.com/productivityMetric/${analystId}`);
    const dados = response.data;
    analystProdutivity.value = dados.analista
    allAnalystProdutivity.value = dados.analistas
    console.log('analystProdutivity:', analystProdutivity.value)
    console.log('allAnalystProdutivity:', allAnalystProdutivity.value)
  } catch (error) {
    console.error('Erro ao buscar dados do endpoint:', error)
  }
};

onMounted(() => {
  analysisQualityGraph()
  fetchUsers()
  productivityMetric()
})
</script>

<template>
  <div class="container mt-4">
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h4 class="fw-bold fs-4">Visão Geral dos Analistas</h4>
      </div>
      <div class="col-md-6 d-flex justify-content-between align-items-center">
        <h4 class="fw-bold fs-4 mb-0">Visão Geral do Analista</h4>
        <div class="dropdown">
          <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Selecionar Analista
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-for="analyst in analistList" :key="analyst.id">
              <a class="dropdown-item" href="#" @click.prevent="selectAnalyst(analyst.id)">
                {{ analyst.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="analistList.length" class="row g-4">
      <div class="col-md-6">
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <h5 class="card-title">Qualidade da análise</h5>
            <p class="card-text text-muted">Geral</p>
            <br />
            <div class="progress-stacked">
              <div v-for="(segment, index) in progressDataAllAnalysts" :key="index" class="progress" role="progressbar"
                :aria-label="'Segment ' + segment.label" :aria-valuenow="segment.value" aria-valuemin="0"
                aria-valuemax="100" :style="{ width: segment.value + '%' }">
                <div :class="['progress-bar', segment.color]"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="allAnalystProdutivity" class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Média de Tempo por Análise</h5>
            <p class="card-text text-muted display-6">{{ allAnalystProdutivity }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-6" v-if="selectedAnalyst">
        <div class="card shadow-sm mb-3">
          <div class="card-body">
            <h5 class="card-title">Qualidade da análise</h5>
            <p class="card-text text-muted">{{ selectedAnalyst.name }}</p>
            <br />
            <div class="progress-stacked">
              <div v-for="(segment, index) in progressDataAnalyst" :key="index" class="progress" role="progressbar"
                :aria-label="'Segment ' + segment.label" :aria-valuenow="segment.value" aria-valuemin="0"
                aria-valuemax="100" :style="{ width: segment.value + '%' }">
                <div :class="['progress-bar', segment.color]"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="analystProdutivity != null" class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Média de Tempo por Análise</h5>
            <p class="card-text text-muted display-6">{{ analystProdutivity }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-warning mt-4" role="alert">
      {{ errorMessage }}
    </div>
  </div>
</template>





<style>
.progress-stacked {
  display: flex;
  height: 35px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress {
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.progress-bar {
  height: 100%;
  width: 100%;
}
</style>