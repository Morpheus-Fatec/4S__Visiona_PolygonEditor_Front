<script setup>
import { ref, defineProps } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import georaster from 'georaster';

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
const tifLayerGroup1 = ref(L.layerGroup());
const tifLayerGroup2 = ref(L.layerGroup());
const baseLayerRef = ref(null);
let tifLayer1Loaded = false;
let tifLayer2Loaded = false;

const onMapReady = async (map) => {
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

  const coordinates = normalizeCoordinates(props.data.geometry.coordinates);
  const multiPolygons = props.data.geometry.coordinates.map(polygon =>
    polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
  );

  let bounds = L.latLngBounds(); 
  multiPolygons.forEach(polygonCoords => {
    const glebaPolygon = L.polygon(polygonCoords, {
      weight: 3,
      color: 'blue',
      fillOpacity: 0
    });
    glebaLayerGroup.value.addLayer(glebaPolygon);
    bounds = bounds.extend(glebaPolygon.getBounds());
  });
  glebaLayerGroup.value.addTo(map);

  map.setMaxBounds(bounds);

  const overlays = {
    'Gleba Polígono': glebaLayerGroup.value,
    'GeoTIFF Layer 1': tifLayerGroup1.value,
    'GeoTIFF Layer 2': tifLayerGroup2.value
  };
  
  const layerControl = L.control.layers(baseLayers, overlays).addTo(map);
  
  map.fitBounds(bounds);
  
  map.on('overlayadd', async (event) => {
    if (event.name === 'GeoTIFF Layer 1' && !tifLayer1Loaded) {
      await loadTifs(coordinates, 1);
      tifLayer1Loaded = true;
    } else if (event.name === 'GeoTIFF Layer 2' && !tifLayer2Loaded) {
      await loadTifs(coordinates, 2);
      tifLayer2Loaded = true;
    }
  });
};

async function loadTifs(coordinates, layerNumber) {
  const urls = [
    "https://demeterteste.s3.us-east-2.amazonaws.com/testeA/demeterteste/1_jeanpaulsartreprofileImage",
    "https://demeterteste.s3.us-east-2.amazonaws.com/testeA/demeterteste/0_jeanpaulsartreprofileImage"
  ];

  try {
    const clipArea = createClipAreaFromCoordinates(coordinates);

    const layerPromises = [urls[layerNumber - 1]].map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao carregar GeoTIFF: " + url);

      const arrayBuffer = await response.arrayBuffer();
      const raster = await georaster(arrayBuffer);

      const layer = new GeoRasterLayer({
        georaster: raster,
        opacity: 1,
        resolution: 512,
        mask: clipArea,
        mask_strategy: "outside"
      });

      if (layerNumber === 1) {
        tifLayerGroup1.value.addLayer(layer);
      } else {
        tifLayerGroup2.value.addLayer(layer);
      }
    });

    await Promise.all(layerPromises);

    console.log("GeoTIFF " + layerNumber + " foi carregado e adicionado.");
  } catch (error) {
    console.error("Erro ao carregar o GeoTIFF:", error);
  }
}

function createClipAreaFromCoordinates(coordinates) {
  return {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": coordinates
        }
      }
    ]
  };
}

function normalizeCoordinates(coordinates) {
  const coords = coordinates && coordinates.target ? coordinates.target : coordinates;
  return coords.map(polygon =>
    polygon.map(ring => ring)
  );
}
</script>

<template>
  <div class="map-container">
    <l-map
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="19"
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
