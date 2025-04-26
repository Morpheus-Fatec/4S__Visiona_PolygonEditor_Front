<script setup>
import { ref, defineProps, watchEffect, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import georaster from 'georaster';
import { usePolygonStore } from '../../../store/PolygonStore';
import * as turf from '@turf/turf';

const polygonStore = usePolygonStore();

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
const drawnItemsLayer = ref(new L.FeatureGroup());
const editingLayer = ref(null);

const getEmptyPolygonsDraw = () => ({
  features: []
});

const polygonsDraw = ref(getEmptyPolygonsDraw());

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
  const automaticClassification = props.data.automatic.features;

  const multiPolygons = props.data.geometry.coordinates.map(polygon =>
    polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
  );

  const classificationMultiPolygons = automaticClassification.map(item => {
  console.log(item.geometry);
 
   const rawCoords = item.geometry.coordinates;
   const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;
 
    return parsedCoords.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );
  });

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


  map.on('click', (event) => {
    if (editingLayer.value && !editingLayer.value.getBounds().contains(event.latlng)) {
      editingLayer.value.editing.disable();
      editingLayer.value = null;
      console.log("Edição finalizada ao clicar fora do polígono.");
    }
  });

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
  return coords.map(polygon =>
    polygon.map(ring => ring)
  );
}

let drawControl = null;

watchEffect(() => {
  if (!mapRef.value) return;

  if (props.isClickedClassified && !drawControl) {
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
      edit: {
        edit: false,
        remove: false,
        featureGroup: drawnItemsLayer.value
      },
    });

    mapRef.value.addControl(drawControl);
    drawnItemsLayer.value.addTo(mapRef.value);

    mapRef.value.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const coords = geojson.geometry.coordinates;

      const newId = Date.now();

      const areaInSquareMeters = turf.area(geojson);
      const area = (areaInSquareMeters / 10000).toFixed(4); 

      geojson.properties = { 
        id: newId,
        area: area,
        classEntity: "DANINHAS"
      };
      layer.feature = geojson;

      layer.on('click', (event) => {
        event.originalEvent.stopPropagation();
        startEditPolygon(layer);
      });

      let pressTimer = null;

      layer.on('mousedown', (event) => {
        event.originalEvent.stopPropagation();
        pressTimer = setTimeout(() => {
          deletePolygon(layer);
        }, 400);
      });

      layer.on('mouseup', () => {
        clearTimeout(pressTimer);
      });

      layer.on('mouseout', () => {
        clearTimeout(pressTimer);
      });

      layer.setStyle({
        color: 'orange',
        fillColor: 'orange',
        weight: 2
      });

      const exists = polygonsDraw.value.features.find(f => f.properties.id === newId);
      if (!exists) {
        // const description = prompt("Polígono adicionado com sucesso! Digite uma descrição:");
        // layer.feature.properties = {
        //   ...layer.feature.properties,
        //   description: description || ''
        // };
        polygonsDraw.value.features.push(layer.toGeoJSON());
      }

      drawnItemsLayer.value.addLayer(layer);
    });

    function startEditPolygon(layer) {
      drawnItemsLayer.value.eachLayer(l => {
        if (l.editing && l.editing.enabled() && l !== layer) {
          l.editing.disable();
        }
      });

      if (layer.editing) {
        layer.editing.enable();
        editingLayer.value = layer;

        layer.on('edit', () => {
          const geojson = layer.toGeoJSON();
          const id = layer.feature?.properties?.id;

          const index = polygonsDraw.value.features.findIndex(f => f.properties.id === id);
          if (index !== -1) {
            polygonsDraw.value.features[index].geometry = {
              type: "MultiPolygon",
              coordinates: [[[geojson.geometry.coordinates[0]]]]
            };
            console.log("Polígono editado individualmente:", polygonsDraw.value.features[index]);
          }
        });
      }
    }

    function deletePolygon(layer) {
      const id = layer.feature?.properties?.id;
      if (id != null) {
        const index = polygonsDraw.value.features.findIndex(f => f.properties.id === id);
        if (index !== -1) {
          polygonsDraw.value.features.splice(index, 1);
          drawnItemsLayer.value.removeLayer(layer);
          console.log("Polígono deletado:", id);
        }
      }
    }
  }

  if (!props.isClickedClassified && drawControl) {
    mapRef.value.removeControl(drawControl);
    drawnItemsLayer.value.clearLayers();
    drawControl = null;
    polygonsDraw.value = getEmptyPolygonsDraw();
    editingLayer.value = null;
  }
});

watch(
  polygonsDraw,
  (newVal) => {
    console.log("polygonsDraw atualizado:", JSON.stringify(newVal, null, 2));
  },
  { deep: true }
);

watch(
  polygonsDraw,
  (newVal) => {
    polygonStore.setPolygonsDraw(newVal);
  },
  { deep: true }
);


</script>

<template>
  <div class="map-container">
    <l-map
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="isClickedClassified === true ? 24 : 18"
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
