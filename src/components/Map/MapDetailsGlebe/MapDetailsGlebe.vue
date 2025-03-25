<script setup>
import { ref, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LTileLayer, LControlScale, LControlLayers } from '@vue-leaflet/vue-leaflet';
import GlebesLayer from '../MapDetailsGlebe/GlebeOperationLayer/GlebesOperation.vue';

const props = defineProps({
  data: {}
});

const tileProviders = ref([
  {
    name: 'Satellite',
    visible: true,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  {
    name: 'Street', 
    visible: false,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a>',
  }
]);

const zoom = ref(14);
const mapRef = ref(null);

const onMapReady = (map) => {
  mapRef.value = map;
  const coordinates = props.data.geometry.coordinates[0];
  const latlngs = coordinates.map(coord => [coord[1], coord[0]]);
  const bounds = L.latLngBounds(latlngs);
  map.fitBounds(bounds);
};
</script>

<template>
  <div class="map-container">
    <l-map 
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="17"
      @ready="onMapReady"
    >
      <GlebesLayer :data="props.data"/>
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
      <l-control-layers position="topright" />
      <l-tile-layer 
        v-for="tileProvider in tileProviders" 
        :key="tileProvider.name" 
        :name="tileProvider.name"
        :visible="tileProvider.visible" 
        :url="tileProvider.url" 
        :attribution="tileProvider.attribution"
        layer-type="base" 
      />
    </l-map>
  </div>
</template>

<style scoped>
.map-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
}
</style>
