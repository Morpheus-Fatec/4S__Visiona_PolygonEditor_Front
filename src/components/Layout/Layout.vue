<script>
import NavBar from '../NavBar/NavBar.vue';

export default {
  name: 'Layout',
  components: {
    NavBar
  }
};
</script>

<template>
  <div class="layout">
    <NavBar />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #D3D3D3;
}

.content {
  display: flex;
  flex: 1;
  overflow: auto;
}
</style>
