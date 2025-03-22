<script setup>
import areasSJC from '../Map/data/areasSJC';
import FilterComponent from '@/components/Operations/FilterComponent.vue';
const handlePrintId = (id) => {
  const area = areasSJC.features.find(area => area.properties.id === id);
  console.log(area);
};

</script>

<template>
  <div class="w-100 container p-3">
    <FilterComponent />
    <div class="table-container">
      <div class="overflow">
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="col">Nome</th>
              <th class="col">Descrição</th>
              <th class="col">Fazenda</th>
              <th class="col">Cidade/Estado</th>
              <th class="col">Situação</th>
              <th class="col">Ação</th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="area in areasSJC.features" :key="area.properties.id">
              <td>{{ area.properties.alt }}</td>
              <td class="break-text">{{ area.properties.description }}</td>
              <td>{{ area.properties.fazenda ? area.properties.fazenda.nome : 'N/A' }}</td>
              <td>{{ area.properties.fazenda.cidade + ' - ' + area.properties.fazenda.estado }}</td>
              <td>Pendente</td>
              <td>
                <button @click="handlePrintId(area.properties.id)" class="btn btn-primary">Ver ID</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
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

