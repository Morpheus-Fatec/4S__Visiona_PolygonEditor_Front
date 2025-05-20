<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue'
import LineChartMeses from '@/components/Dashboards/LineChartMonths.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { ChartData } from 'chart.js'
import api from '@/components/util/api.js'

const chartData1 = ref<ChartData<'line'>>({
  labels: [],
  datasets: []
})

const consultantList = ref([])
const errorMessage = ref('')
const selectedConsultant = ref(null)
const dadosGrafico = ref<any>(null)

const meses = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

onMounted(async () => {
  try {
    const response = await axios.get('/jsonConsultores.json')
    dadosGrafico.value = response.data

    chartData1.value = {
      labels: meses.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
      datasets: [
        {
          label: 'Consultores (média geral)',
          data: meses.map(m => dadosGrafico.value.consultores[m] || 0),
          borderColor: 'rgba(128, 128, 128, 1)',
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          fill: false,
          tension: 0
        }
      ]
    }
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error)
    errorMessage.value = 'Erro ao carregar os dados do gráfico.'
  }

  fetchUsers()
})

const fetchUsers = async () => {
  try {
    const response = await api.get('/user/listarUsuarios')
    consultantList.value = response.data.filter(user => user.isConsultant).map(user => ({
      id: user.id,
      name: user.name
    }))
    if (!consultantList.value.length) {
      errorMessage.value = 'Não há consultores disponíveis.'
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    errorMessage.value = error.response?.data?.error || 'Erro ao buscar usuários.'
  }
}

const selectConsultant = (analystId: number) => {
  const selected = consultantList.value.find(c => c.id === analystId)
  selectedConsultant.value = selected
  if (!dadosGrafico.value || !selected) return

  chartData1.value = {
    labels: meses.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
    datasets: [
      {
        label: 'Consultores (média geral)',
        data: meses.map(m => dadosGrafico.value.consultores[m] || 0),
        borderColor: 'rgba(128, 128, 128, 1)',
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        fill: false,
        tension: 0
      },
      {
        label: selected.name,
        data: meses.map(m => dadosGrafico.value.consultor[m] || 0),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        tension: 0
      }
    ]
  }
}
</script>

<template>
  <Layout>
    <div class="container-fluid min-vh-100 py-4 px-3 d-flex flex-column align-items-center">
      <div class="w-100 mb-4 d-flex justify-content-between align-items-center">
        <h4 class="fw-bold fs-4 text-dark mb-0 text-center w-100">Desempenho dos consultores</h4>
        <div class="dropdown position-absolute end-0 me-4">
          <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Selecionar Consultor
          </button>
          <ul class="dropdown-menu">
            <li v-for="consultant in consultantList" :key="consultant.id">
              <a class="dropdown-item" href="#" @click.prevent="selectConsultant(consultant.id)">
                {{ consultant.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p v-if="errorMessage" class="text-danger text-center">{{ errorMessage }}</p>

      <div class="card shadow border-0 rounded w-100" style="max-width: 900px;">
        <div class="card-body">
          <LineChartMeses :chart-data="chartData1" chart-title="" />
        </div>
      </div>
    </div>
  </Layout>
</template>
