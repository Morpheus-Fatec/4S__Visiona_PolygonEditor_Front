<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 20
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1
  }
});

const emit = defineEmits(['pageChanged']);

const pagination = reactive({
  page: 1
});

const firstPages = computed(() => Math.min(props.totalPages, 3));

function changePage(newPage) {
  if (newPage < 1 || newPage > props.totalPages) return;
  pagination.page = newPage;
  emit('pageChanged', newPage);
}

watch(() => props.totalItems, () => {
  changePage(1);
});
</script>

<template>
  <nav aria-label="Page navigation example" class="d-flex justify-content-center mt-1">
    <ul class="pagination justify-content-center mb-0">

      <li :class="['page-item', { disabled: pagination.page === 1 }]">
        <a @click.prevent="changePage(pagination.page - 1)" class="page-link" href="#">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>

      <li v-for="n in firstPages" :key="n" :class="['page-item', { active: pagination.page === n }]">
        <a @click.prevent="changePage(n)" class="page-link" href="#">{{ n }}</a>
      </li>

      <li v-if="props.totalPages > 3" class="page-item disabled">
        <span class="page-link">...</span>
      </li>

      <li v-if="props.totalPages > 3" :class="['page-item', { active: pagination.page === props.totalPages }]">
        <a @click.prevent="changePage(props.totalPages)" class="page-link" href="#">{{ props.totalPages }}</a>
      </li>

      <li :class="['page-item', { disabled: pagination.page === props.totalPages }]">
        <a @click.prevent="changePage(pagination.page + 1)" class="page-link" href="#">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>

    </ul>
  </nav>
</template>

<style scoped>
.page-item .page-link {
  border-radius: 5px;
  width: 38px;
  height: 38px;
  padding: 0;
  line-height: 36px;
  text-align: center;
}
</style>
