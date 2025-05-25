<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue'
import axios from 'axios'
import { ref, onMounted } from 'vue'
import LineChart2 from '../components/Dashboards/LineChartMonths.vue'
import type { ChartData } from 'chart.js'
import api from '@/components/util/api.js'

const chartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: []
})

const metricData = ref<number | null>(null)

const loadMetricTalhao = async () => {
  try {
    const response = await axios.get('/jsonQualiTalhao.json')
    metricData.value = response.data.qualidadeAnalise
  } catch (error) {
    // Erro silencioso
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/analise/qualidadeanalises')
    const meses = response.data.meses

    chartData.value = {
      labels: meses.map((item: any) => item.month),
      datasets: [
        {
          label: 'Valor Inicial',
          data: meses.map((item: any) => item.initialArea),
          fill: false,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          tension: 0
        },
        {
          label: 'Valor Final',
          data: meses.map((item: any) => item.finalArea),
          fill: false,
          borderColor: 'rgba(54, 57, 107, 1)',
          backgroundColor: 'rgba(54, 57, 107, 0.5)',
          tension: 0
        }
      ]
    }
  } catch (error) {
    // Erro silencioso
  }
})

loadMetricTalhao()
</script>

<template>
  <Layout>
    <div class="container py-3">
      <h4 class="fw-bold fs-4 text-center mb-4">Desempenho dos Talhões</h4>
      <div class="row g-3 align-items-stretch">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-center" style="min-height: 420px;">
              <LineChart2
                v-if="chartData.labels?.length"
                :chartData="chartData"
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4 d-flex flex-column gap-3">
          <div class="card shadow-sm text-center flex-fill">
            <div class="card-body d-flex flex-column justify-content-center">
              <h5 class="card-title mb-2">Qualidade da Classificação</h5>
              <p class="card-text text-muted mb-3">Automática</p>
              <p class="card-text text-muted display-6 fw-bold">{{ metricData }}%</p>
            </div>
          </div>

          <div class="card shadow-sm text-center flex-fill">
            <div class="card-body d-flex flex-column justify-content-center">
              <h5 class="card-title mb-2">Sem edição</h5>
              <p class="card-text text-muted mb-3">Resultado bruto</p>
              <p class="card-text text-muted display-6 fw-bold">—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
