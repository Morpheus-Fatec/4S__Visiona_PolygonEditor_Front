<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  chartData: ChartData<'line'>
  chartTitle: string
}>()

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: props.chartTitle,
      font: {
        size: 16
      }
    },
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      position: 'left',
      title: {
        display: true,
        text: 'Área Final'
      }
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false 
      },
      title: {
        display: true,
        text: 'Área Inicial'
      }
    }
  }
}
</script>

<template>
  <Line
    :data="chartData"
    :options="{
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: { ...chartOptions.plugins!.title, text: chartTitle }
      }
    }"
  />
</template>
