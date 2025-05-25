<template>
  <div class="chart-wrapper">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  chartData: ChartData<'bar'>
  chartOptions?: ChartOptions<'bar'>
}>()
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-width: 900px;
  height: 400px;
  margin: 0 auto;
}
</style>
