<template>
  <div id="map" style="height: 100vh;"></div>
</template>

<script>
import L from "leaflet"; // Importando o Leaflet

export default {
  name: "LeafletMap",
  mounted() {
    const map = L.map("map").setView([-23.223701, -45.9009074], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    })
    .addTo(map);

    // Verificar se o mapa foi corretamente inicializado
    map.on('load', () => {
      console.log('Mapa carregado com sucesso');
    });

    map.on('error', (error) => {
      console.error('Erro ao carregar o mapa:', error);
    });
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%; 
}
</style>
