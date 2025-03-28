<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['apply-filters']);

const filters = ref({
  fazenda: '',
  cidade: '',
  estado: '',
  situacao: '',
});

const options = ['Opção 1', 'Opção 2', 'Opção 3'];

const applyFilters = () => {
  emit('apply-filters', { ...filters.value });
};
</script>

<template>
  <div class="filter-component py-4 px-4 bg-white shadow">
    <!-- Botão Criar Talhão -->
     <div class="d-flex w-100 gap-2 justify-content-around align-items-center">
       <h1 class="h1 display-5 fw-bold font-weight-bold font-size">Operações</h1>
        <div class="btn-component d-flex flex-column justify-content-end align-items-start align-items-center h-100">
          <button class="btn-criar btn btn-primary ">Criar Talhão</button>
        </div>

        <div class="filters-container d-flex">
          <!-- Filtro Fazenda -->
          <div class="filter-item">
            <label for="fazendaFilter" class="form-label">Fazenda</label>
            <select id="fazendaFilter" v-model="filters.fazenda" class="form-select">
              <option value="">Selecione a fazenda...</option>
              <option v-for="option in options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- Filtro Cidade -->
          <div class="filter-item">
            <label for="cidadeFilter" class="form-label">Cidade</label>
            <select id="cidadeFilter" v-model="filters.cidade" class="form-select">
              <option value="">Selecione a cidade...</option>
              <option v-for="option in options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- Filtro Estado -->
          <div class="filter-item">
            <label for="estadoFilter" class="form-label">Estado</label>
            <select id="estadoFilter" v-model="filters.estado" class="form-select">
              <option value="">Selecione o estado...</option>
              <option v-for="option in options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- Filtro Situação -->
          <div class="filter-item">
            <label for="situacaoFilter" class="form-label">Situação</label>
            <select id="situacaoFilter" v-model="filters.situacao" class="form-select">
              <option value="">Selecione a situação...</option>
              <option v-for="option in options" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <button @click="applyFilters" class="btn btn-primary">Aplicar filtros</button>
          </div>
        </div>
      </div>
  </div>
</template>

<style scoped>
.filter-component {
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 2px;
  justify-content: spa;
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

.btn-criar {
  padding: 1rem;
  width: 180px;
}

.filters-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
}
</style>
