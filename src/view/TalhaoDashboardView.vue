<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue'
import { ref, onMounted } from 'vue'
import LineChart2 from '../components/Dashboards/LineChartMonths.vue'
import type { ChartData } from 'chart.js'
import api from '@/components/util/api.js'


const chartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: []
})
const chartTitle = ref('Saúde da análise automática')
const metricNoEditing = ref<number | null>(null)

const noEditing = async () => {
  try {
    const response = await api.get('/analise/talhoes-nao-revisados')
    metricNoEditing.value = response.data.uneditedField
  } catch (error) {
    console.error('Erro ao carregar dados', error)
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/analise/qualidadeanalises')
    const meses = response.data.meses
    console.log('meses', meses)
    chartData.value = {
      labels: meses.map((item: any) => item.month),
      datasets: [
        {
          label: 'Valor Inicial',
          data: meses.map((item: any) => item.initialArea),
          fill: false,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          tension: 0,
          yAxisID: 'y1'
        },
        {
          label: 'Valor Final',
          data: meses.map((item: any) => item.finalArea),
          fill: false,
          borderColor: 'rgba(54, 57, 107, 1)',
          backgroundColor: 'rgba(54, 57, 107, 0.5)',
          tension: 0,
          yAxisID: 'y'
        }
      ]
    }
  } catch (error) {
    console.error('Erro ao carregar dados', error)
  }
})

noEditing()
</script>

<template>
  <Layout>
    <div class="container py-3">
      <h4 class="fw-bold fs-4 text-center mb-4">Desempenho dos Talhões</h4>
      <div class="row g-3 align-items-stretch">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-center" style="min-height: 420px;">
              <LineChart2 v-if="chartData.labels?.length" :chartData="chartData" :chartTitle="chartTitle" />
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4 d-flex flex-column gap-3">
          <div class="card shadow-sm text-center">
            <div class="card-body py-3 px-2">
              <h6 class="card-title mb-1 fw-semibold">Talhões Aprovados</h6>
              <small class="text-muted mb-2 d-block">Sem edição</small>
              <div class="fw-bold fs-3">{{ metricNoEditing }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
