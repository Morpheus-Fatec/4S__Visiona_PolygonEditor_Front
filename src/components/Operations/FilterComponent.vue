<script setup>
import { ref } from 'vue';

const emit = defineEmits();


const filters = ref({
  name: "",
  farm: "",
  culture: "",
  soil: "",
  harvest: ""
});

const applyFilter = () => {
  emit('filteredData', filters.value);
};

</script>

<template>
  <div class="filter-component bg-white shadow">
<div class="filters-container h-100 pt-4 pe-4 ps-4 pb-0">
      <div class="filter-item">
        <label for="talhaoFilter" class="h6">Nome do talhão</label>
        <input type="text" id="input-talhao" class="form-control" v-model="filters.name" maxlength="8" size="10" placeholder="Insira talhão..."/>
      </div>

      <div class="filter-item">
        <label for="farmFilter" class="h6">Fazenda</label>
        <input type="text" id="input-farm" class="form-control" v-model="filters.farm" maxlength="8" size="10" placeholder="Insira..."/>
      </div>

      <div class="filter-item">
        <label for="cultureFilter" class="h6">Cultura</label>
        <input type="text" id="input-culture" class="form-control" v-model="filters.culture" maxlength="8" size="10" placeholder="Insira..."/>
      </div>

      <div class="filter-item">
        <label for="soilFilter" class="h6">Solo</label>
        <input type="text" id="input-soil" class="form-control" v-model="filters.soil" maxlength="8" size="10" placeholder="Insira..."/>
      </div>

      <div class="filter-item">
        <label for="harvestFilter" class="h6">Safra</label>
        <input type="text" id="input-harvest" class="form-control" v-model="filters.harvest" maxlength="8" size="10" placeholder="Insira..."/>
      </div>
    </div>

    <div class="w-100 d-flex justify-content-center">
      <button @click="applyFilter" class="btn btn-primary w-100">Aplicar filtros</button>
    </div>
  </div>
</template>

<style scoped>
.filter-component {
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  width: 400px;
  gap: 1rem;
}

.btn-component h1 {
  font-weight: bold;
  font-size: 1.5rem;
  padding-bottom: 10px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  color: #333;
  letter-spacing: 0.2px;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-item {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}
</style>
