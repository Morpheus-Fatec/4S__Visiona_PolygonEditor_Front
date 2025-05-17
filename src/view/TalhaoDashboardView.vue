<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue';
import axios from 'axios'
import { ref, onMounted } from 'vue'
import LineChart2 from '../components/Dashboards/LineChartMonths.vue'
import type { ChartData } from 'chart.js'
import { isQualifiedName } from 'typescript';

const chartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: []
})
const metricData = ref({})
const chartTitle = 'Desempenho Mensal'

const metricTalhao = async () => {
  try {
    const response = await axios.get('/jsonQualiTalhao.json')
    metricData.value = response.data.qualidadeAnalise
  } catch (error) {
    console.error('Erro ao carregar dados do talhão:', error)
  }
};

onMounted(async () => {
  try {
    const response = await axios.get('/jsonTalhao.json')
    const meses = response.data.meses

    chartData.value = {
      labels: meses.map((item: any) => item.mes),
      datasets: [
        {
          label: 'Valor Inicial',
          data: meses.map((item: any) => item.valor_inicial),
          fill: false,
          borderColor: 'rgba(255, 205, 86, 1)',
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          tension: 0
        },
        {
          label: 'Valor Final',
          data: meses.map((item: any) => item.valor_final),
          fill: false,
          borderColor: 'rgba(54, 57, 107, 1)',
          backgroundColor: 'rgba(54, 57, 107, 0.5)',
          tension: 0
        }
      ]
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
});


metricTalhao()

</script>

<template>
  <Layout>
    <div class="container mt-4">
      <div class="row">

        <!-- Gráfico ocupa 80% -->
        <div class="col-12 col-lg-9 mb-4 mb-lg-0">
          <LineChart2 v-if="chartData.labels?.length" :chartData="chartData" :chartTitle="chartTitle" />
        </div>
        <!-- Cards ocupam 20% -->
        <div class="col-12 col-lg-3 d-flex flex-column gap-4">
          <div class="card shadow-sm h-100 text-center flex-fill">
            <div class="card-body d-flex flex-column justify-content-center" v-if="metricData !== null">
              <h5 class="card-title mb-2">Qualidade da Classificação</h5>
              <p class="card-text text-muted mb-3">Automática</p>
              <p class="card-text text-muted display-6 fw-bold">{{ metricData }}%</p>
            </div>
          </div>
          <div class="card shadow-sm h-100 text-center flex-fill">
            <div class="card-body d-flex flex-column justify-content-center" >
              <h5 class="card-title mb-2">Sem edição</h5>
              <p class="card-text text-muted mb-3">Resultado bruto</p>
              <p class="card-text text-muted display-6 fw-bold">{{  }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
