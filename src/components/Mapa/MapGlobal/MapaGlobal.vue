<script setup>
import { ref } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LTileLayer, LControlScale, LGeoJson, LControlLayers, LMarker } from '@vue-leaflet/vue-leaflet';
import GlebesLayer from './GlebesLayer/GlebesLayer.vue';
import { LMarkerClusterGroup } from 'vue-leaflet-markercluster'

import areasSJC from '../data/areasSJC';

const markerCoords = ref(
  areasSJC.features.map((feature) => {
    const firstCoord = feature.geometry.coordinates[0][0];
    return [firstCoord[1], firstCoord[0]];
  })
);

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

const zoom = ref(2);
const center = ref([-23.129096216749616, -45.82651434998431]);

</script>

<template>
  <div class="map-container">
    <l-map 
      :zoom="zoom" 
      :center="center" 
      @ready="onMapReady"
      @click.prevent.stop
      :min-zoom="2"
      :max-zoom="16" 
    >
      <l-geo-json :geojson="polygons" ref="geoJsonLayer" />
      <GlebesLayer />
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
      <l-control-layers position="topright" />
      <l-tile-layer v-for="tileProvider in tileProviders" :key="tileProvider.name" :name="tileProvider.name"
        :visible="tileProvider.visible" :url="tileProvider.url" :attribution="tileProvider.attribution"
        layer-type="base" />
        <l-marker-cluster-group
          :options="{
            // spiderfyOnMaxZoom: false,
            // showCoverageOnHover: false,
            // zoomToBoundsOnClick: false,
          }"
        >
          <l-marker
            v-for="(coord, index) in markerCoords"
            :key="index"
            :lat-lng="coord"
            icon="null"
          />
        </l-marker-cluster-group>
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