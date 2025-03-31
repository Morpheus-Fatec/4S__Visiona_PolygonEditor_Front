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
]);

const zoom = ref(14);
const mapRef = ref(null);
const glebaLayerGroup = ref(null);
const tifLayerGroups = ref([]);
const classificationLayerGroup = ref(L.layerGroup());
const baseLayerRef = ref(null);
const tifLayersLoaded = ref([]);

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
  const classification = props.data.classification.features;

  const multiPolygons = props.data.geometry.coordinates.map(polygon =>
    polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
  );

  const classificationMultiPolygons = classification.map(item =>
    item.geometry.coordinates.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    )
  );

  let bounds = L.latLngBounds();

  console.log('imagens:', props.data.images);

  multiPolygons.forEach(polygonCoords => {
    const glebaPolygon = L.polygon(polygonCoords, {
      weight: 3,
      color: 'blue',
      fillOpacity: 0
    });
    glebaLayerGroup.value.addLayer(glebaPolygon);
    bounds = bounds.extend(glebaPolygon.getBounds());
  });

  classificationMultiPolygons.forEach(item => {
    item.forEach(polygonCoords => {
      const classificationPolygon = L.polygon(polygonCoords, {
        weight: 4,
        color: 'red',
        fillOpacity: 0
      });
      classificationLayerGroup.value.addLayer(classificationPolygon);
    });
  });

  glebaLayerGroup.value.addTo(map);
  classificationLayerGroup.value.addTo(map);
  map.setMaxBounds(bounds);

  const overlays = {
    'Gleba Polígono': glebaLayerGroup.value,
    'Classification Layer': classificationLayerGroup.value
  };

  props.data.images.forEach((image, index) => {
    const layerGroup = L.layerGroup();
    tifLayerGroups.value.push(layerGroup);
    overlays[image.name] = layerGroup;
    tifLayersLoaded.value.push(false);
  });

  const layerControl = L.control.layers(baseLayers, overlays).addTo(map);
  map.fitBounds(bounds);

  map.on('overlayadd', async (event) => {
    const layerIndex = props.data.images.findIndex(img => img.name === event.name);
    if (layerIndex !== -1 && !tifLayersLoaded.value[layerIndex]) {
      await loadTif(props.data.images[layerIndex].link, layerIndex, coordinates);
      tifLayersLoaded.value[layerIndex] = true;
    }
  });
};

async function loadTif(url, layerIndex, coordinates) {
  console.log('Carregando GeoTIFF:', url);
  try {
    const clipArea = createClipAreaFromCoordinates(coordinates);

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

    tifLayerGroups.value[layerIndex].addLayer(layer);
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
