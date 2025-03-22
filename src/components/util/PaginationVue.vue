<script>
export default {
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      required: true
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.$emit('update:currentPage', page);
      }
    }
  }
};
</script>

<template>
  <div class="pagination">
    <button
      class="btn btn-primary"
      :disabled="currentPage <= 1"
      @click="changePage(currentPage - 1)">
      Anterior
    </button>

    <span>{{ currentPage }} de {{ totalPages }}</span>

    <button
      class="btn btn-primary"
      :disabled="currentPage >= totalPages"
      @click="changePage(currentPage + 1)">
      Próximo
    </button>
  </div>
</template>

<style scoped>
.pagination {
  justify-content: center;
  align-items: center;
  gap: 10px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
