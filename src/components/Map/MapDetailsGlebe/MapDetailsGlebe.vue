<script setup>
import { ref, watchEffect, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LTileLayer, LControlScale, LGeoJson, LControlLayers } from '@vue-leaflet/vue-leaflet';
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
      'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
  {
    name: 'Street', 
    visible: false,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }
]);

const zoom = ref(14);
const centerGlebe = props.data.geometry.coordinates[0][0];
const center = ref([centerGlebe[1], centerGlebe[0]]);

</script>

<template>
  <div class="map-container">
    <l-map 
      :zoom="zoom" 
      :center="center" 
      @ready="onMapReady" 
      :min-zoom="12"
      :max-zoom="16" 
    >
      <GlebesLayer :data="props.data"/>
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
      <l-control-layers position="topright" />
      <l-tile-layer v-for="tileProvider in tileProviders" :key="tileProvider.name" :name="tileProvider.name"
        :visible="tileProvider.visible" :url="tileProvider.url" :attribution="tileProvider.attribution"
        layer-type="base" />
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