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
  <div class="filter-component">
    <div class="filters-container">
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
    </div>

    <button class="btn btn-primary" @click="applyFilters">
      Aplicar Filtros
    </button>
  </div>
</template>

<style scoped>
.filter-component {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 1rem;
  padding: 1rem;
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

.btn-primary {
  margin-top: 1rem;
  width: 100%;
}
</style>
