<script setup>
import { ref, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';

const props = defineProps({
  data: Object
});

const tileProviders = ref([
  {
    name: 'Satellite',
    visible: true,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Map data: &copy; OpenStreetMap',
  },
  {
    name: 'Street', 
    visible: false,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
  }
]);

const zoom = ref(14);
const mapRef = ref(null);
const glebaLayerGroup = ref(null);
const baseLayerRef = ref(null);

const onMapReady = (map) => {
  mapRef.value = map;

  const baseLayers = {};
  tileProviders.value.forEach(provider => {
    const tileLayer = L.tileLayer(provider.url, { attribution: provider.attribution });
    baseLayers[provider.name] = tileLayer;
    if (provider.name === 'Satellite') {
      tileLayer.addTo(map);
      baseLayerRef.value = tileLayer;
    }
  });

  glebaLayerGroup.value = L.layerGroup();
  const coordinates = props.data.geometry.coordinates[0];
  const latlngs = coordinates.map(coord => [coord[1], coord[0]]);
  const glebaPolygon = L.polygon(latlngs, { weigth: 3,});
  glebaLayerGroup.value.addLayer(glebaPolygon);
  glebaLayerGroup.value.addTo(map);

  const overlays = {
    'Gleba Polígono': glebaLayerGroup.value,
  };

  L.control.layers(baseLayers, overlays).addTo(map);

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
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
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
