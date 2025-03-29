<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import areasSJC from '../Map/data/areasSJC';
import areasMock from '../Map/data/areasMock.json'
import { useFilterStore } from '@/store/FilterStore';
import FilterComponent from '@/components/Operations/FilterComponent.vue';

const router = useRouter();
const dataList = ref([])
const store = useFilterStore();

const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:8090/field/featureCollectionSimple", {
    withCredentials: true
    })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
    dataList.value = response.data;
    console.log(dataList.value)
  } catch (error) {
    console.error("Erro ao carregar dados da tabela:", error);
  }
};

const handlePrintId = (id) => {
  if (!dataList || !Array.isArray(dataList.features)) {
    console.error("O objeto 'areasSJC' não está carregado corretamente");
    return;
  }

  const area = dataList.features.find(area => area.properties.id === id);

  if (area) {
    router.push({
      name: 'operacaoMapDetails',
      params: { id: area.properties.id },
      state: { operation: area }
    });
  } else {
    console.log(`Área com id ${id} não encontrada.`);
  }
  console.log(areasMock);
};

onMounted(() => {
  fetchData();
});

const updateTable = (filters) => {
  console.log("Dados recebidos do filtro:", filters);
  // Aplica o filtro e atualiza filteredItems com os dados filtrados
  dataList.value = store.applyFilter(); 
  console.log("Dados filtrados", dataList.value);
};
</script>

<template>
  <div class="w-100 d-flex gap-3 rounded bg-red pt-3">
    <FilterComponent @filteredData="updateTable" />
    <div class="table-container flex-grow-1 overflow-auto rounded shadow">
      <table class="table table-striped table-bordered">
        <thead class="sticky-top">
          <tr>
            <th class="col text-center bg-dark text-white p-4">Nome</th>
            <th class="col text-center bg-dark text-white p-4">Cultura</th>
            <th class="col text-center bg-dark text-white p-4">Area</th>
            <th class="col text-center bg-dark text-white p-4">Solo</th>
            <th class="col text-center bg-dark text-white p-4">Fazenda</th>
            <th class="col text-center bg-dark text-white p-4">Cidade/Estado</th>
            <th class="col text-center bg-dark text-white p-4">Situação</th>
            <th class="col text-center bg-dark text-white p-4" style="min-width: 200px">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in dataList.features" :key="data.properties.id">
            <td class="text-center px-3 py-3">{{ data.properties.name }}</td>
            <td class="text-wrap py-3">{{ data.properties.culture }}</td>
            <td class="text-wrap py-3">{{ data.properties.area }}</td>
            <td class="text-wrap py-3">{{ data.properties.harvest }}</td>
            <td class="text-center py-3">{{ data.properties.farm ? data.properties.farm.farmName : 'N/A' }}</td>
            <td class="text-center py-3">{{ data.properties.farm.farmCity + '/' + data.properties.farm.farmState }}</td>
            <td class="text-center py-3">{{ data.properties.status }}</td>
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