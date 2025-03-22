<script setup>
import { ref, onMounted, computed } from 'vue';
import { areasSJC } from '../Mapa/data/areasSJC';
import FilterComponent from '@/components/Operations/FilterComponent.vue';
import Pagination from '@/components/util/PaginationVue.vue';

const handlePrintId = (id) => {
  const area = areasSJC.features.find(area => area.properties.id === id);
  console.log(area);
};

const fields = ref([]);
const currentPage = ref(1); // Página atual
const itemsPerPage = ref(10); // Quantidade de itens por página

async function getFields() {
  try {
    const response = await fetch('http://localhost:8080/field/simple');
    const data = await response.json();
    fields.value = data;
  } catch (error) {
    console.error('Erro ao buscar os campos:', error);
  }
}

onMounted(() => {
  getFields();
});

// Computed para paginar os campos
const paginatedFields = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return fields.value.slice(start, end);
});

const totalItems = computed(() => fields.value.length);
</script>

<template>
  <div class="w-100 container p-3 d-flex gap-3 flex-column">
    <FilterComponent />
      <div class="overflow">
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="col">Nome</th>
              <th class="col">Fazenda</th>
              <th class="col">Cidade/Estado</th>
              <th class="col">Solo</th>
              <th class="col">Cultura</th>
              <th class="col">Área (ha)</th>
              <th class="col">Situação</th>
              <th class="col">Ação</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="field in paginatedFields" :key="field.id">
              <td>{{ field.name }}</td>
              <td>{{ field.farm.name }}</td>
              <td>{{ field.farm.city + ' - ' + field.farm.state }}</td>
              <td>{{ field.soil }}</td>
              <td>{{ field.culture }}</td>
              <td>{{ field.area }}</td>
              <td>{{ field.status }}</td>
              <td>
                <button @click="handlePrintId(field.id)" class="btn btn-primary">Ver ID</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination
      :currentPage="currentPage"
      :totalItems="totalItems"
      :itemsPerPage="itemsPerPage"
      @update:currentPage="currentPage = $event" />
    </div>
</template>

<style scoped>
.table-container {
  max-height: 355px;
  overflow: hidden;
  border: 0.1px solid #dee2e6;
  border-radius: 8px;
  margin-top: 10px;
}

.overflow {
  max-height: 370px;
  overflow-y: auto;
}

.col {
  font-weight: bold;
}

thead th {
  position: sticky;
  top: 0;
}

th, td {
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
}

.break-text {
  word-wrap: break-word;
  white-space: normal;
  max-width: 300px;
}
</style>
