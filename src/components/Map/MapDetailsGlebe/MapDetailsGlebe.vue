<script setup>
import { ref, defineProps, watchEffect, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import { useGeoTiffLoader } from './util/useGeotiffLoader.js';
import { usePolygonStore } from '../../../store/PolygonStore';
import * as turf from '@turf/turf';

const polygonStore = usePolygonStore();

const props = defineProps({
  data: Object,
  isClickedToManual: Boolean,
  isClickedToRevision: Boolean,
  glebeAvailable: Object,
  revisionAvailable: Object,
});

console.log('props', props);
console.log('revisionAvailable', props.revisionAvailable);

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
const glebeAvailableLayerGroup = ref(L.layerGroup());
const manualLayerGroup = ref(L.layerGroup());
const revisionLayerGroup = ref(L.layerGroup());
const baseLayerRef = ref(null);
const tifLayersLoaded = ref([]);
const drawnItemsLayer = ref(new L.FeatureGroup());
const drawnItemsLayerAvailable = ref(new L.FeatureGroup());
const editingLayer = ref(null);

const getEmptyPolygonsDraw = () => ({
  features: []
});

const polygonsDraw = ref(getEmptyPolygonsDraw());
const polygonsDrawAnalisct = ref(getEmptyPolygonsDraw());

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
  const revisionClassification = props.revisionAvailable?.features || [];
  const manualClassification = props.manualAvailable?.features || [];

  const multiPolygons = props.data.geometry.coordinates.map(polygon =>
    polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
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

  loadRevisionClassification(revisionClassification);
  loadManualClassification(manualClassification);
  loadAutomaticClassification(automaticClassification);

  function loadRevisionClassification(revisionClassification){
    console.log('revisaooo', revisionClassification);
    if(revisionClassification == null || revisionClassification.size == 0){
      return;
    }
    const revisionMultiPolygons = revisionClassification.map(item => {
      const rawCoords = item.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      return {
        description: item.properties.description,
        polygons: parsedCoords.map(polygon =>
          polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
        )
      };
    });

    revisionMultiPolygons.forEach(item => {
      item.polygons.forEach(polygonCoords => {
        const revisionPolygon = L.polygon(polygonCoords, {
          weight: 4,
          color: 'yellow',
          fillOpacity: 0
        });

        revisionPolygon.bindTooltip(item.description, {
          permanent: true,
          direction: 'center',
          className: 'polygon-label'
        });

        revisionLayerGroup.value.addLayer(revisionPolygon);
      });
    });
  }


  function loadManualClassification(manualClassification){
    if(manualClassification == null || manualClassification.size == 0){
      console.log('caiu');
      return;
    }
    const manualMultiPolygons = manualClassification.map(item => {

    const rawCoords = item.geometry.coordinates;
    const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

    return parsedCoords.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );
    });

    manualMultiPolygons.forEach(item => {
    item.forEach(polygonCoords => {
      const revisionPolygon = L.polygon(polygonCoords, {
        weight: 4,
        color: 'blue',
        fillOpacity: 0
      });
      manualLayerGroup.value.addLayer(revisionPolygon);
    });
    });
  }

  function loadAutomaticClassification(automaticClassification){
    const classificationMultiPolygons = automaticClassification.map(item => {

    const rawCoords = item.geometry.coordinates;
    const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      return parsedCoords.map(polygon =>
        polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
      );
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
  }

  glebaLayerGroup.value.addTo(map);
  map.setMaxBounds(bounds);

  const overlays = {
  'Gleba Polígono': glebaLayerGroup.value,
  'Classificação Automática': classificationLayerGroup.value,
  };

  if (manualLayerGroup.value.getLayers().length > 0) {
  overlays['Classificação Manual'] = manualLayerGroup.value;
  }
  console.log('revisionLayerGroup', revisionLayerGroup.value);
  if (revisionLayerGroup.value.getLayers().length > 0) {
    overlays['Revisão Manual'] = revisionLayerGroup.value;
  }

  mapRef.value.createPane('manualClassificationPane');
  mapRef.value.getPane('manualClassificationPane').style.zIndex = 650;

  mapRef.value.createPane('revisionClassificationPane');
  mapRef.value.getPane('revisionClassificationPane').style.zIndex = 600;

  props.data.images.forEach((image, index) => {
    const layerGroup = L.layerGroup();
    tifLayerGroups.value.push(layerGroup);
    overlays[image.name] = layerGroup;
    tifLayersLoaded.value.push(false);
  });

  const layerControl = L.control.layers(baseLayers, overlays).addTo(map);
  map.fitBounds(bounds);

  watch(
    () => props.revisionAvailable,
    (newVal, oldVal) => {
      if (newVal && newVal.features) {
        loadRevisionClassification(newVal.features);
      }
    },
    { immediate: true }
  );

  watch(
    () => props.glebeAvailable,
    (newGlebeAvailable) => {
      if (!mapRef.value) return;
      glebeAvailableLayerGroup.value.clearLayers();


      if (newGlebeAvailable && newGlebeAvailable.features && newGlebeAvailable.features.length > 0) {
        loadGlebeAvailableLayer(newGlebeAvailable.features);

        if (!layerControl._layers || !Object.values(layerControl._layers).some(l => l.name === 'Classificação Manual')) {
          layerControl.addOverlay(glebeAvailableLayerGroup.value, 'Classificação Manual');

        }
      } else {
        if (layerControl._layers) {
          const layerInfo = Object.entries(layerControl._layers).find(([key, l]) => l.name === 'Classificação Manual');
          if (layerInfo) {
            layerControl.removeLayer(glebeAvailableLayerGroup.value);
          }
        }
      }
    },
    { immediate: true }
  );

  function loadGlebeAvailableLayer(features) {
    features.forEach(feature => {
      const rawCoords = feature.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      parsedCoords.forEach(polygonCoords => {
        const latlngs = polygonCoords.map(ring => ring.map(coord => [coord[1], coord[0]]));
        const polygon = L.polygon(latlngs, {
          weight: 2,
          color: 'green',
          fillOpacity: 0.3,
          pane: 'manualClassificationPane'
        });
        glebeAvailableLayerGroup.value.addLayer(polygon);
      });
    });
  }

  function loadRevisionLayer(features) {
    console.log('revision: ', features);
    features.forEach(feature => {
      const rawCoords = feature.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      parsedCoords.forEach(polygonCoords => {
        const latlngs = polygonCoords.map(ring => ring.map(coord => [coord[1], coord[0]]));
        const polygon = L.polygon(latlngs, {
          weight: 2,
          color: 'blue', // Você pode mudar a cor se quiser
          fillOpacity: 0.3,
          pane: 'revisionClassificationPane'
        });
        revisionLayerGroup.value.addLayer(polygon);
      });
    });
  }

  map.on('click', (event) => {
    if (editingLayer.value && !editingLayer.value.getBounds().contains(event.latlng)) {
      editingLayer.value.editing.disable();
      editingLayer.value = null;
      console.log("Edição finalizada ao clicar fora do polígono.");
    }
  });

  useGeoTiffLoader(map, tifLayerGroups, props.data, coordinates, tifLayersLoaded);
};


function normalizeCoordinates(coordinates) {
  const coords = coordinates && coordinates.target ? coordinates.target : coordinates;
  return coords.map(polygon =>
    polygon.map(ring => ring)
  );
}

let drawControl = null;

watchEffect(() => {
  if (!mapRef.value) return;

  if (props.isClickedToManual && !drawControl) {
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

  if (!props.isClickedToManual && drawControl) {
    mapRef.value.removeControl(drawControl);
    drawnItemsLayer.value.clearLayers();
    drawControl = null;
    polygonsDraw.value = getEmptyPolygonsDraw();
    editingLayer.value = null;
  }
});

let manualDrawControl = null;

watchEffect(() => {
  if (!mapRef.value) return;

  if (props.isClickedToRevision && !manualDrawControl) {
    manualDrawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsLayerAvailable.value,
        edit: false,
        remove: false,
      },
    });

    mapRef.value.addControl(manualDrawControl);
    drawnItemsLayerAvailable.value.addTo(mapRef.value);

    mapRef.value.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const newId = Date.now();

      geojson.properties = {
        id: newId,
      };
      layer.feature = geojson;

      layer.setStyle({
        color: 'blue',
        fillColor: 'blue',
        weight: 2
      });

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

      const exists = polygonsDrawAnalisct.value.features.find(f => f.properties.id === newId);
      if (!exists) {
        const description = prompt("Polígono adicionado com sucesso! Digite uma descrição:");
        layer.feature.properties = {
          ...layer.feature.properties,
          description: description || ''
        };
        polygonsDrawAnalisct.value.features.push(layer.toGeoJSON());
      }

      drawnItemsLayerAvailable.value.addLayer(layer);
    });
  }

  if (!props.isClickedToRevision && manualDrawControl) {
    mapRef.value.off(L.Draw.Event.CREATED);
    mapRef.value.removeControl(manualDrawControl);
    drawnItemsLayerAvailable.value.clearLayers();
    manualDrawControl = null;
    polygonsDrawAnalisct.value = getEmptyPolygonsDraw();
    editingLayer.value = null;
  }
});

function startEditPolygon(layer) {
  drawnItemsLayerAvailable.value.eachLayer(l => {
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

      const index = polygonsDrawAnalisct.value.features.findIndex(f => f.properties.id === id);
      if (index !== -1) {
        polygonsDrawAnalisct.value.features[index].geometry = {
          type: "MultiPolygon",
          coordinates: [[[geojson.geometry.coordinates[0]]]]
        };
        console.log("Polígono editado individualmente:", polygonsDrawAnalisct.value.features[index]);
      }
    });
  }
}

function deletePolygon(layer) {
  const id = layer.feature?.properties?.id;
  if (id != null) {
    const index = polygonsDrawAnalisct.value.features.findIndex(f => f.properties.id === id);
    if (index !== -1) {
      polygonsDrawAnalisct.value.features.splice(index, 1);
      drawnItemsLayerAvailable.value.removeLayer(layer);
      console.log("Polígono deletado:", id);
    }
  }
}

watch(
  () => polygonsDrawAnalisct.value,
  (newVal) => {
    console.log("Dados dos polígonos da avaliação:", JSON.stringify(newVal, null, 2));
  },
  { deep: true }
);

watch(
  polygonsDraw,
  (newVal) => {
    console.log("polygonsDraw atualizado:", JSON.stringify(newVal, null, 2));
  },
  { deep: true }
);



//Store
watch(
  polygonsDraw,
  (newVal) => {
    polygonStore.setPolygonsDraw(newVal);
  },
  { deep: true }
);

watch(
  polygonsDrawAnalisct,
  (newVal) => {
    polygonStore.setPolygonsDrawAnalisct(newVal);
  },
  { deep: true }
);


</script>

<template>
  <div class="map-container">
    <l-map
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="isClickedToManual === true ? 24 : 18"
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
