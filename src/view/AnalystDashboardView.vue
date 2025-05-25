<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/components/util/api'
import BarChart from '@/components/Dashboards/BarChart.vue'
import Layout from '@/components/Layout/Layout.vue'

const analystQuality = ref({})
const allAnalystQuality = ref({})
const progressDataAnalyst = ref([])
const progressDataAllAnalysts = ref([])
const analistList = ref([])
const errorMessage = ref('')
const selectedAnalyst = ref(null)
const analystProdutivity = ref({})
const allAnalystProdutivity = ref({})
const chartData = ref(null)
const chartOptions = ref({})

const analysisQualityGraph = async (analystId?: number) => {
  try {
    const url = analystId
      ? `/analise/qualidadeanalistas/${analystId}`
      : `/analise/qualidadeanalistas`

    const response = await api.get(url)
    const dados = response.data

    analystQuality.value = dados.analyst
    allAnalystQuality.value = dados.team

    const totalAnalyst = analystQuality.value.ideal + analystQuality.value.acceptable + analystQuality.value.critical
    const totalAnalysts = allAnalystQuality.value.ideal + allAnalystQuality.value.acceptable + allAnalystQuality.value.critical

    progressDataAnalyst.value = [
      { label: 'Ideal', value: totalAnalyst ? (analystQuality.value.ideal / totalAnalyst) * 100 : 0, color: 'bg-primary' },
      { label: 'Aceitável', value: totalAnalyst ? (analystQuality.value.acceptable / totalAnalyst) * 100 : 0, color: 'bg-warning' },
      { label: 'Crítica', value: totalAnalyst ? (analystQuality.value.critical / totalAnalyst) * 100 : 0, color: 'bg-danger' }
    ]

    progressDataAllAnalysts.value = [
      { label: 'Ideal', value: totalAnalysts ? (allAnalystQuality.value.ideal / totalAnalysts) * 100 : 0, color: 'bg-primary' },
      { label: 'Aceitável', value: totalAnalysts ? (allAnalystQuality.value.acceptable / totalAnalysts) * 100 : 0, color: 'bg-warning' },
      { label: 'Crítica', value: totalAnalysts ? (allAnalystQuality.value.critical / totalAnalysts) * 100 : 0, color: 'bg-danger' }
    ]
  } catch (error) {
    console.error('Erro ao buscar dados do endpoint:', error)
  }
}

const fetchUsers = async () => {
  try {
    const response = await api.get('/user/listarUsuarios')
    analistList.value = response.data.filter(user => user.isAnalyst).map(user => ({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      isConsultant: user.isConsultant,
      isAnalyst: user.isAnalyst
    }))
    if (analistList.value.length === 0) {
      errorMessage.value = 'Não há analistas.'
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.error || 'Erro ao buscar usuários.'
  }
}

const selectAnalyst = (analystId: number) => {
  selectedAnalyst.value = analistList.value.find(analyst => analyst.id === analystId)
  productivityMetric(analystId)
}

const productivityMetric = async (analystId?: number) => {
  try {
    const url = analystId
      ? `/analise/metricadeprodutividade/${analystId}`
      : `/analise/metricadeprodutividade`

    const response = await api.get(url)
    const dados = response.data

    analystProdutivity.value = dados.analyst
    allAnalystProdutivity.value = dados.analysts
  } catch (error) {
    console.error('Erro ao buscar dados do endpoint:', error)
  }
}

const barChart = async () => {
  try {
    const response = await api.get('/analise/desempenhoanalistas')
    const dados = response.data

    chartData.value = {
      labels: dados.map(item => item.name || 'Sem Nome'),
      datasets: [
        {
          label: 'Aprovada',
          backgroundColor: '#4caf50',
          data: dados.map(item => item.approvedArea)
        },
        {
          label: 'Pendente',
          backgroundColor: '#ced4da',
          data: dados.map(item => item.pendingArea)
        },
        {
          label: 'Reprovada',
          backgroundColor: '#f44336',
          data: dados.map(item => item.rejectedArea)
        }
      ]
    }

    chartOptions.value = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: '' }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    errorMessage.value = 'Erro ao carregar os dados do gráfico.'
  }
}

onMounted(() => {
  analysisQualityGraph()
  fetchUsers()
  productivityMetric()
  barChart()
})
</script>

<template>
  <Layout>
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
                <div v-for="(segment, index) in progressDataAllAnalysts" :key="index" class="progress"
                  role="progressbar" :aria-label="'Segment ' + segment.label" :aria-valuenow="segment.value"
                  aria-valuemin="0" aria-valuemax="100" :style="{ width: segment.value + '%' }">
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

        <div class="col-12">
          <div v-if="chartData" class="card shadow-sm">
            <div class="card-body">
              <h4 class="fw-bold fs-4 mb-4 text-center">Desempenho dos Analistas</h4>
              <div style="height: 400px;">
                <BarChart :chart-data="chartData" :chart-options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-warning mt-4" role="alert">
        {{ errorMessage }}
      </div>
    </div>
  </Layout>
</template>

<style scoped>
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
