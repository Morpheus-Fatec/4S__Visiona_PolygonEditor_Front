<script setup>
import { ref } from 'vue';
import Layout from '../components/Layout/Layout.vue';
import Mapa from '../components/Mapa/Mapa.vue';

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <Layout>
    <div class="d-flex w-100">
      <div :class="['sidebar', isSidebarOpen ? 'expanded' : 'collapsed', 'd-flex flex-column align-items-center p-2']">
        <button class="btn btn-primary w-100 mb-3" @click="toggleSidebar">
          ☰
        </button>
        <div v-if="isSidebarOpen" class="w-100 text-center flex-grow-1 d-flex flex-column">
          <h5>Menu</h5>
          <ul class="list-unstyled flex-grow-1">
            <li><a href="#" class="text-decoration-none d-block p-2">Opção 1</a></li>
            <li><a href="#" class="text-decoration-none d-block p-2">Opção 2</a></li>
            <li><a href="#" class="text-decoration-none d-block p-2">Opção 3</a></li>
          </ul>
          <p class="text-muted small">Rodapé</p>
        </div>
      </div>

      <div class="flex-grow-1">
        <Mapa />
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.sidebar {
  background-color: #f8f9fa;
  transition: width 0.3s ease;
  border-right: 1px solid #ddd;
  overflow: hidden;
}

.collapsed {
  width: 80px;
}

.expanded {
  width: 250px;
}

.d-flex {
  display: flex;
}

.flex-grow-1 {
  flex-grow: 1;
  height: 100%;
}
</style>
