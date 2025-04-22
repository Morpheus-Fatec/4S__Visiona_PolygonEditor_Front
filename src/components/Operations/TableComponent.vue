<script setup>
import { onMounted, ref } from 'vue';
import api from "@/components/util/API.js";
import { useRouter } from 'vue-router';
import { useFilterStore } from '@/store/FilterStore';
import FilterComponent from '@/components/Operations/FilterComponent.vue';
import PaginationComponent from '@/components/Operations/PaginationComponent.vue';

const router = useRouter();
const dataList = ref([])
const store = useFilterStore();
const totalItems = ref(20);
const totalPages = ref(1);
const currentFilters = ref({});

const fetchData = async () => {
  try {
    const response = await api.get("/field/featureCollectionSimple", {
      withCredentials: true
    });
    
    if (response && response.data && Array.isArray(response.data.features)) {
      dataList.value = response.data;
      totalItems.value = response.data.totalItems;
      totalPages.value = response.data.totalPages;

    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da tabela:", error);
  }
};

async function handlePageChange(page) {
  const response = await api.get("/field/featureCollectionSimple", {
    params: {
      page: page,   
      harvest: currentFilters.value.harvest,      
      farmName: currentFilters.value.farmName,      
      soil: currentFilters.value.soil,      
      name: currentFilters.value.name,      
      culture: currentFilters.value.culture     
    }
  });
  dataList.value = response.data;
  totalItems.value = response.data.totalItems;
  totalPages.value = response.data.totalPages;
}
  
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
};

onMounted(() => {
  fetchData();
});

const updateTable = async (filters) => {
  currentFilters.value = {
    harvest: filters.harvest || '',
    farmName: filters.farm || '',
    soil: filters.soil || '',
    name: filters.name || '',
    culture: filters.culture || ''
  };

  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    let url = `${apiUrl}/field/featureCollectionSimple?`;

    console.log(url)

    if (filters.harvest) {
      url += `harvest=${filters.harvest}&`;
    }
    if (filters.farm) {
      url += `farmName=${filters.farm}&`;
    }
    if (filters.soil) {
      url += `soil=${filters.soil}&`;
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
      totalItems.value = response.data.totalItems;
      totalPages.value = response.data.totalPages;
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da tabela:", error);
  }
};
</script>

<template>
  <div class="w-100 h-80 d-flex gap-3 rounded bg-red mt-3">
    <FilterComponent @filteredData="updateTable" />
    <div>
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
            <tr v-for="data in dataList.features" :key="data.properties.id">
              <td class="text-center px-3 py-3">{{ data.properties.name }}</td>
              <td class="text-wrap py-3">{{ data.properties.culture }}</td>
              <td class="text-wrap py-3">{{ data.properties.area }}</td>
              <td class="text-wrap py-3">{{ data.properties.soil }}</td>
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
            <tr v-if="!dataList.features || dataList.features.length === 0">
              <td class="text-center py-4" colspan="9">Nenhum item encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationComponent
      :total-items="totalItems"
      :total-pages="totalPages"
      :items-per-page="20"
      @pageChanged="handlePageChange"/>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  max-height: calc(100vh - 160px);
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
