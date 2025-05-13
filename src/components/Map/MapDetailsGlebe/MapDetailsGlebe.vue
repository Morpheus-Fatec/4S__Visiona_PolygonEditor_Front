<script setup>
import { ref, defineProps, watchEffect, watch, computed } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import { useGeoTiffLoader } from './util/useGeotiffLoader.js';
import {
  loadFieldCoordinates,
  loadRevisionClassification,
  loadManualClassification,
  loadImages,
  loadOverlay,
  createNewManualClassification,
  getManualToEdit
} from './util/useOverlayManager.js';
import { usePolygonStore } from '../../../store/PolygonStore';
import * as turf from '@turf/turf';

const polygonStore = usePolygonStore();

const props = defineProps({
  data: Object,
  isClickedToManual: Boolean,
  isClickedToRevision: Boolean,
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
const isClickedToManualRef = computed(() => props.isClickedToManual);
const isClickedToRevisionRef = computed(() => props.isClickedToRevision);
const glebaLayerGroup = ref(null);
const tifLayerGroups = ref([]);
const classificationLayerGroup = ref(L.layerGroup());
const manualLayerGroup = ref(new L.FeatureGroup());
const layerControlRef = ref(null);
const revisionLayerGroup = ref(L.layerGroup());
const baseLayerRef = ref(null);
const tifLayersLoaded = ref([]);
const drawnItemsLayer = ref(new L.FeatureGroup());
const drawnItemsLayerAvailable = ref(new L.FeatureGroup());
const editingLayer = ref(null);
const fieldId = props.data.properties.id;
const fieldCoordinates = props.data.geometry.coordinates;
const fieldStatus = props.data.properties.status;

const getEmptyPolygonsDraw = () => ({
  features: []
});

const polygonsDraw = ref();
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

  const bounds = loadFieldCoordinates(
    fieldCoordinates,
    glebaLayerGroup
  );

  glebaLayerGroup.value.addTo(map);
  map.setMaxBounds(bounds);

  const overlays = await loadOverlay(
    fieldId,
    glebaLayerGroup.value,
    props.data.automatic.features,
    classificationLayerGroup.value,
    manualLayerGroup.value,
    fieldStatus
  );

  loadImages(props.data.images, tifLayersLoaded, overlays, tifLayerGroups)

  mapRef.value.createPane('manualClassificationPane');
  mapRef.value.getPane('manualClassificationPane').style.zIndex = 650;

  mapRef.value.createPane('revisionClassificationPane');
  mapRef.value.getPane('revisionClassificationPane').style.zIndex = 600;


  layerControlRef.value = L.control.layers(baseLayers, overlays).addTo(map);
  map.fitBounds(bounds);

  watch(
  [() => isClickedToManualRef.value, () => isClickedToRevisionRef.value],
  ([newManual, newRevision]) => {
    console.log("isClickedToManual:", newManual);
    console.log("isClickedToRevision:", newRevision);
    updateOverlays(newManual, newRevision, overlays);
  },
  { immediate: false }
);


async function updateOverlays(isClickedToManual, isClickedToRevision, currentOverlays) {

  // Retira camada de revisao
  if(!(isClickedToRevision || isClickedToManual)){
    console.log("Removendo camada de revisão");
    mapRef.value.removeLayer(revisionLayerGroup.value);
    layerControlRef.value.removeLayer(revisionLayerGroup.value);
    delete currentOverlays['Revisão Manual'];
    return;
  }

  // Atualiza a camada de revisão
  if (isClickedToRevision || isClickedToManual) {
    if (!currentOverlays['Revisão Manual']) {
      const existRevision = await loadRevisionClassification(fieldId, revisionLayerGroup);
      console.log("existRevision", existRevision);
      if (existRevision) {
        revisionLayerGroup.value.addTo(mapRef.value);
        currentOverlays['Revisão Manual'] = revisionLayerGroup.value;
        mapRef.value.removeLayer(revisionLayerGroup.value);
        layerControlRef.value.addOverlay(revisionLayerGroup.value, 'Revisão Manual');
      }
    }
  }

  if (isClickedToManual) {
    if (!currentOverlays['Classificação Manual']) {
      const existManual = await loadManualClassification(fieldId, manualLayerGroup.value);
      if (existManual) {
        manualLayerGroup.value.addTo(mapRef.value);
        currentOverlays['Classificação Manual'] = manualLayerGroup.value;
        mapRef.value.removeLayer(manualLayerGroup.value);
        layerControlRef.value.addOverlay(manualLayerGroup.value, 'Classificação Manual');
      } else {
        createNewManualClassification(props.data.automatic.features, manualLayerGroup.value)
        manualLayerGroup.value.addTo(mapRef.value);
        currentOverlays['Classificação Manual'] = manualLayerGroup.value;
        mapRef.value.removeLayer(manualLayerGroup.value);
        layerControlRef.value.addOverlay(manualLayerGroup.value, 'Classificação Manual');
      }
    }
    await getManualToEdit(manualLayerGroup.value, props.data.automatic.features, polygonsDraw);
  }
}


  // watch(
  //   () => props.glebeAvailable,
  //   (newGlebeAvailable) => {
  //     if (!mapRef.value) return;
  //     glebeAvailableLayerGroup.value.clearLayers();


  //     if (newGlebeAvailable && newGlebeAvailable.features && newGlebeAvailable.features.length > 0) {
  //       loadGlebeAvailableLayer(newGlebeAvailable.features);

  //       if (!layerControl._layers || !Object.values(layerControl._layers).some(l => l.name === 'Classificação Manual')) {
  //         layerControl.addOverlay(glebeAvailableLayerGroup.value, 'Classificação Manual');

  //       }
  //     } else {
  //       if (layerControl._layers) {
  //         const layerInfo = Object.entries(layerControl._layers).find(([key, l]) => l.name === 'Classificação Manual');
  //         if (layerInfo) {
  //           layerControl.removeLayer(glebeAvailableLayerGroup.value);
  //         }
  //       }
  //     }
  //   },
  //   { immediate: true }
  // );

  map.on('click', (event) => {
    if (editingLayer.value && !editingLayer.value.getBounds().contains(event.latlng)) {
      editingLayer.value.editing.disable();
      editingLayer.value = null;
      console.log("Edição finalizada ao clicar fora do polígono.");
    }
  });

  useGeoTiffLoader(map, tifLayerGroups, props.data, fieldCoordinates, tifLayersLoaded);
};


let drawControl = null;

watchEffect(() => {
  if (!mapRef.value) return;

  // Ativar modo de edição manual
  if (isClickedToManualRef.value && !drawControl) {
    // Inicializa controle de desenho
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
        featureGroup: manualLayerGroup.value
      },
    });

    mapRef.value.addControl(drawControl);
    manualLayerGroup.value.addTo(mapRef.value);

    // Evento de criação de novo polígono
    mapRef.value.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const newId = Date.now();
      const areaInSquareMeters = turf.area(geojson);
      const area = (areaInSquareMeters / 10000).toFixed(4);

      geojson.properties = {
        id: newId,
        area: area,
        classEntity: "DANINHAS"
      };
      layer.feature = geojson;

      setupLayerEvents(layer, 'orange'); // cor diferente para novos

      const exists = polygonsDraw.value.features.find(f => f.properties.id === newId);
      if (!exists) {
        polygonsDraw.value.features.push(layer.toGeoJSON());
      }

      manualLayerGroup.value.addLayer(layer);
    });

    // Carrega polígonos existentes do banco
    polygonsDraw.value.features.forEach((feature) => {
      const geoLayer = L.geoJSON(feature, {
        onEachFeature: (featureData, layerInstance) => {
          layerInstance.feature = featureData;
          setupLayerEvents(layerInstance, 'blue'); // cor dos existentes
          manualLayerGroup.value.addLayer(layerInstance);
        }
      });
    });
  }

  // Desativar modo manual
  if (!isClickedToManualRef.value && drawControl) {
    mapRef.value.removeControl(drawControl);
    manualLayerGroup.value.clearLayers();
    drawControl = null;
    polygonsDraw.value = getEmptyPolygonsDraw();
    editingLayer.value = null;
  }

  // === Funções auxiliares ===

  function setupLayerEvents(layer, color) {
    // Estilo de destaque
    layer.setStyle({
      color: color,
      fillColor: color,
      weight: 2
    });

    // Habilita edição ao clicar
    layer.on('click', (event) => {
      event.originalEvent.stopPropagation();
      startEditPolygon(layer);
    });

    // Pressionar para deletar
    let pressTimer = null;
    layer.on('mousedown', (event) => {
      event.originalEvent.stopPropagation();
      pressTimer = setTimeout(() => {
        deletePolygon(layer);
      }, 400);
    });
    layer.on('mouseup', () => clearTimeout(pressTimer));
    layer.on('mouseout', () => clearTimeout(pressTimer));
  }

  function startEditPolygon(layer) {
    manualLayerGroup.value.eachLayer(l => {
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
        manualLayerGroup.value.removeLayer(layer);
        console.log("Polígono deletado:", id);
      }
    }
  }
});

let manualDrawControl = null;

watchEffect(() => {
  if (!mapRef.value) return;

  if (isClickedToRevisionRef.value && !manualDrawControl) {
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

  if (!isClickedToRevisionRef.value && manualDrawControl) {
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
