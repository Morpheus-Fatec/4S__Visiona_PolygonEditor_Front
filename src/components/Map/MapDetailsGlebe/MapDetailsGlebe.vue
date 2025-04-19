<script setup>
import { ref, defineProps, watchEffect, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import georaster from 'georaster';

const props = defineProps({
  data: Object,
  isClickedClassified: Boolean
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

const polygonsDraw = ref({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiPolygon",
        coordinates: []
      }
    }
  ]
});

const drawnItemsLayer = ref(L.layerGroup());

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

  multiPolygons.forEach(polygonCoords => {
    const glebaPolygon = L.polygon(polygonCoords, {
      weight: 3,
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
  map.setMaxBounds(bounds);

  const overlays = {
    'Gleba Polígono': glebaLayerGroup.value,
    'Classificação Automática': classificationLayerGroup.value
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

let drawControl = null;

watchEffect(() => {
  if (!mapRef.value) return; // Garante que o mapa já está carregado

  if (props.isClickedClassified && !drawControl) {
    // Adiciona o controle de desenho se ainda não foi adicionado
    drawControl = new L.Control.Draw({
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

    mapRef.value.addControl(drawControl); // Adiciona o controle ao mapa
    drawnItemsLayer.value.addTo(mapRef.value);

    mapRef.value.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const coords = geojson.geometry.coordinates;

      if (geojson.geometry.type === "Polygon") {
        polygonsDraw.value.features[0].geometry.coordinates.push(coords);
      }

      drawnItemsLayer.value.addLayer(layer);
    });

    console.log("Controle de desenho adicionado!");
  }

  if (!props.isClickedClassified && drawControl) {
    // Remove o controle de desenho se ele foi adicionado e isClickedClassified for false
    mapRef.value.removeControl(drawControl);
    drawnItemsLayer.value.clearLayers(); // Limpa os polígonos desenhados
    drawControl = null; // Limpa a referência do controle
    console.log("Controle de desenho removido!");
  }
});



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
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: coordinates
        }
      }
    ]
  };
}

function normalizeCoordinates(coordinates) {
  const coords = coordinates && coordinates.target ? coordinates.target : coordinates;
  return coords.map(polygon => polygon.map(ring => ring));
}

watchEffect(() => {
  console.log('isClickedClassified', props.isClickedClassified);
});
</script>

<template>
  <div class="map-container">
    <l-map
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="18"
      @ready="onMapReady"
    >
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
    </l-map>
  </div>
</template>

<style scoped>
.map-container {
  display: flex;
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
