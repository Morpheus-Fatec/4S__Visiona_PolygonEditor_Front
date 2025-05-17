<script setup lang="ts">
import Layout from '../components/Layout/Layout.vue';
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
    const dados = response.data
    dadosGrafico.value = dados

    chartData1.value = {
      labels: meses.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
      datasets: [
        {
          label: 'Consultores (média geral)',
          data: meses.map(m => dados.consultores[m] || 0),
          borderColor: 'rgba(128, 128, 128, 1)',
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          fill: true,
          tension: 0.4
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
    const response = await api.get('/user/listarUsuarios');
    consultantList.value = response.data.filter(user => user.isConsultant).map(user => ({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      isConsultant: user.isConsultant,
      isAnalyst: user.isAnalyst
    }))
    if (consultantList.value.length === 0) {
      errorMessage.value = 'Não há consultores disponíveis.'
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    errorMessage.value = error.response?.data?.error || 'Erro ao buscar usuários.'
  }
}

const selectConsultant = (analystId: number) => {
  const selected = consultantList.value.find(consultant => consultant.id === analystId)
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
        fill: true,
        tension: 0.4
      },
      {
        label: selected.name, 
        data: meses.map(m => dadosGrafico.value.consultor[m] || 0),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  }
}
</script>

<template>
  <Layout>
  <div class="container mt-4">
    <div class="dropdown mb-3">
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

    <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>

    <LineChartMeses :chart-data="chartData1" chart-title="Desempenho dos Consultores" />
  </div>
  </Layout>
</template>
