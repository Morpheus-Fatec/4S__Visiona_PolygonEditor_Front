<script setup>
import { useRouter } from 'vue-router';
import areasSJC from '../Map/data/areasSJC';
import FilterComponent from '@/components/Operations/FilterComponent.vue';

const router = useRouter();

const handlePrintId = (id) => {
  if (!areasSJC || !Array.isArray(areasSJC.features)) {
    console.error("O objeto 'areasSJC' não está carregado corretamente");
    return;
  }

  const area = areasSJC.features.find(area => area.properties.id === id);

  if (area) {
    router.push({
      name: 'operacaoMapDetails',
      params: { id: area.properties.id },
      state: { operation: area }
    });
  } else {
    console.log(`Área com id ${id} não encontrada.`);
  }
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
            <th class="col text-center bg-dark text-white p-4" style="min-width: 200px">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="area in areasSJC.features" :key="area.properties.id">
            <td class="text-center px-3 py-3">{{ area.properties.alt }}</td>
            <td class="text-wrap py-3">{{ area.properties.description }}</td>
            <td class="text-center py-3">{{ area.properties.fazenda ? area.properties.fazenda.nome : 'N/A' }}</td>
            <td class="text-center py-3">{{ area.properties.fazenda.cidade + ' - ' + area.properties.fazenda.estado }}</td>
            <td class="text-center py-3">Pendente</td>
            <td class="text-center px-3">
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
  max-height: calc(100vh - 140px);
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
