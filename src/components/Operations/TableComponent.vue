<script setup>
import { onMounted, ref } from 'vue';
import api from "../util/API.js";
import { useRouter } from 'vue-router';
import areasMock from '../Map/data/areasMock.json'
import { useFilterStore } from '@/store/FilterStore';
import FilterComponent from '@/components/Operations/FilterComponent.vue';

const router = useRouter();
const dataList = ref([])
const store = useFilterStore();

const fetchData = async () => {
  try {
    const response = await api.get("/field/featureCollectionSimple", {
      withCredentials: true
    });

    if (response && response.data && Array.isArray(response.data.features)) {
      dataList.value = response.data;
      console.log(dataList.features);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da tabela:", error);
  }
};

const handlePrintId = (id) => {
  if (!dataList || !Array.isArray(dataList.value.features)) {
    console.error("O objeto 'areasSJC' não está carregado corretamente");
    return;
  }

  const area = dataList.value.features.find(area => area.properties.id === id);


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

const updateTable = async (filters) => {
  try {
    let url = `${api.defaults.baseURL}/field/featureCollectionSimple?`;

    if (filters.harvest) {
      url += `harvest=${filters.harvest.nome}&`;
    }
    if (filters.farm) {
      url += `farmName=${filters.farm}&`;
    }
    if (filters.soil) {
      url += `soil=${filters.soil.nome}&`;
    }
    if (filters.name) {
      url += `name=${filters.name}&`;
    }
    if (filters.culture) {
      url += `culture=${filters.culture}&`;
    }

    if (url.endsWith('&')) {
      url = url.slice(0, -1);
    }

    const response = await api.get(url, { withCredentials: true });

    if (response && response.data && Array.isArray(response.data.features)) {
      dataList.value = response.data;
      console.log(dataList.value);
      console.log(dataList.value.features);
      console.log(dataList.features);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da tabela:", error);
  }
};
</script>

<template>
  <div class="w-100 h-100 d-flex gap-3 rounded bg-red pt-3">
    <FilterComponent @filteredData="updateTable" />
    <div class="table-container flex-grow-1 overflow-auto rounded shadow">
      <table class="table table-striped table-bordered">
        <thead class="sticky-top">
          <tr>
            <th class="col text-center bg-dark text-white p-4">Nome</th>
            <th class="col text-center bg-dark text-white p-4">Cultura</th>
            <th class="col text-center bg-dark text-white p-4">Area</th>
            <th class="col text-center bg-dark text-white p-4">Solo</th>
            <th class="col text-center bg-dark text-white p-4">Safra</th>
            <th class="col text-center bg-dark text-white p-4">Fazenda</th>
            <th class="col text-center bg-dark text-white p-4">Cidade/Estado</th>
            <th class="col text-center bg-dark text-white p-4">Situação</th>
            <th class="col text-center bg-dark text-white p-4" style="width:100px">Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!dataList || !dataList.features || dataList.features.length === 0">
            <td colspan="9" class="text-center py-3 text-muted">Nenhum talhão cadastrado</td>
          </tr>
          <tr v-for="data in dataList.features" :key="data.properties.id">
            <td class="text-center px-3 py-3">{{ data.properties.name }}</td>
            <td class="text-wrap py-3">{{ data.properties.culture.nome }}</td>
            <td class="text-wrap py-3">{{ data.properties.area }}</td>
            <td class="text-wrap py-3">{{ data.properties.soil.nome }}</td>
            <td class="text-wrap py-3">{{ data.properties.harvest }}</td>
            <td class="text-center py-3">{{ data.properties.farm ? data.properties.farm.farmName : 'N/A' }}</td>
            <td class="text-center py-3">
              {{ (data.properties.farm.farmCity || 'Sem registro') + '/' + (data.properties.farm.farmState || 'Sem registro') }}
            </td>
            <td class="text-center py-3">{{ data.properties.status }}</td>
            <td class="text-center px-3">
              <button @click="handlePrintId(data.properties.id)" class="btn btn-primary">+</button>
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
