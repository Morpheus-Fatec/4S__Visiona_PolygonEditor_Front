<script setup>
import { ref, watchEffect } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LTileLayer, LControlScale, LGeoJson, LControlLayers } from '@vue-leaflet/vue-leaflet';
import GlebesLayer from './GlebesLayer/GlebesLayer.vue';

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
const center = ref([-23.129096216749616, -45.82651434998431]);
const polygons = ref(loadPolygons());

function onMapReady(map) {
  const drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
      polygon: true,
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
      circleMarker: false,
    },
  });

  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, (e) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    polygons.value.features.push(geojson);
    savePolygonsToLocalStorage();
  });

  map.on(L.Draw.Event.EDITED, (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const geojson = layer.toGeoJSON();
      const index = polygons.value.features.findIndex((f) => f.id === geojson.id);
      if (index !== -1) {
        polygons.value.features[index] = geojson;
      }
    });
    savePolygonsToLocalStorage();
  });
}

function savePolygonsToLocalStorage() {
  try {
    localStorage.setItem('polygons', JSON.stringify(polygons.value));
    console.log('Polígonos salvos no localStorage', JSON.stringify(polygons.value));
  } catch (error) {
    console.error('Erro ao salvar polígonos no localStorage:', error);
  }
}

function loadPolygons() {
  try {
    const storedPolygons = localStorage.getItem('polygons');
    return storedPolygons ? JSON.parse(storedPolygons) : { type: 'FeatureCollection', features: [] };
  } catch (error) {
    console.error('Erro ao carregar polígonos do localStorage:', error);
    return { type: 'FeatureCollection', features: [] };
  }
}
</script>

<template>
  <div class="map-container">
    <l-map 
      :zoom="zoom" 
      :center="center" 
      @ready="onMapReady" 
      :min-zoom="6"
      :max-zoom="16" 
    >
      <l-geo-json :geojson="polygons" ref="geoJsonLayer" />
      <GlebesLayer />
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