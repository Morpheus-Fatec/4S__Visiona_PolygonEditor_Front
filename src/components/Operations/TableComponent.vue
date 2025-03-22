<script setup>
import areasSJC from '../Map/data/areasSJC';
import FilterComponent from '@/components/Operations/FilterComponent.vue';
const handlePrintId = (id) => {
  const area = areasSJC.features.find(area => area.properties.id === id);
  console.log(area);
};
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column gap-5 rounded bg-red pt-5">
    <FilterComponent />
    <div class="table-container flex-grow-1 overflow-auto rounded">
      <table class="table table-striped table-bordered">
        <thead class="sticky-top">
          <tr>
            <th class="col text-center bg-dark text-white p-4">Nome</th>
            <th class="col text-center bg-dark text-white p-4">Descrição</th>
            <th class="col text-center bg-dark text-white p-4">Fazenda</th>
            <th class="col text-center bg-dark text-white p-4">Cidade/Estado</th>
            <th class="col text-center bg-dark text-white p-4">Situação</th>
            <th class="col text-center bg-dark text-white p-4">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="area in areasSJC.features" :key="area.properties.id">
            <td class="text-center" style="padding-top: 15px; padding-bottom: 15px;">{{ area.properties.alt }}</td>
            <td class="text-wrap" style="padding-top: 15px; padding-bottom: 15px;">{{ area.properties.description }}</td>
            <td class="text-center" style="padding-top: 15px; padding-bottom: 15px;">{{ area.properties.fazenda ? area.properties.fazenda.nome : 'N/A' }}</td>
            <td class="text-center" style="padding-top: 15px; padding-bottom: 15px;">{{ area.properties.fazenda.cidade + ' - ' + area.properties.fazenda.estado }}</td>
            <td class="text-center" style="padding-top: 15px; padding-bottom: 15px;">Pendente</td>
            <td class="text-center" style="padding-top: 15px; padding-bottom: 15px;">
              <button @click="handlePrintId(area.properties.id)" class="btn btn-primary">Ver operação</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: calc(100vh - 140px); /* Subtraímos o espaço do cabeçalho e filtros */
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 1020;
}

.text-wrap {
  word-wrap: break-word;
  white-space: normal;
}
</style>
