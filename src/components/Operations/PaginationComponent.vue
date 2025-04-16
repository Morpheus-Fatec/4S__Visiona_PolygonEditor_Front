<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  totalElements: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 20
  }
});

const emit = defineEmits(['pageChanged']);

const pagination = reactive({
  page: 1
});

// Atualiza a página total automaticamente ao mudar os dados
const totalPages = computed(() =>
  Math.ceil(props.totalElements / props.itemsPerPage)
);

// Troca de página e emite para o pai
function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages.value) return;
  pagination.page = newPage;
  emit('pageChanged', newPage);
}

// Se totalElements mudar e a página atual for inválida, volta pra 1
watch(() => props.totalElements, () => {
  if (pagination.page > totalPages.value) {
    changePage(1);
  }
});
</script>

<template>
  <nav aria-label="Page navigation example" class="ms-3">
    <ul class="pagination justify-content-end mb-0">

      <!-- Botão anterior -->
      <li :class="['page-item', { disabled: pagination.page === 1 }]">
        <a @click.prevent="changePage(pagination.page - 1)" class="page-link" href="#">
          <i class="bi bi-caret-left-fill"></i>
        </a>
      </li>

      <!-- Lógica de páginas -->
      <li
        v-for="p in totalPages"
        :key="p"
        v-if="p <= 2 || p > totalPages - 2 || Math.abs(p - pagination.page) <= 1"
        :class="['page-item', { active: pagination.page === p }]"
      >
        <a @click.prevent="changePage(p)" class="page-link" href="#">{{ p }}</a>
      </li>

      <!-- Reticências -->
      <li
        v-if="totalPages > 6 && pagination.page < totalPages - 2"
        class="page-item disabled"
      >
        <span class="page-link">...</span>
      </li>

      <!-- Próximo -->
      <li :class="['page-item', { disabled: pagination.page === totalPages }]">
        <a @click.prevent="changePage(pagination.page + 1)" class="page-link" href="#">
          <i class="bi bi-caret-right-fill"></i>
        </a>
      </li>
    </ul>
  </nav>
</template>
