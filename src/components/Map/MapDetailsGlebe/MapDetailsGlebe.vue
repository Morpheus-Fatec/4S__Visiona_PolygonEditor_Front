<script setup>
import { ref, defineProps, watchEffect, watch, computed } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { LMap, LControlScale } from '@vue-leaflet/vue-leaflet';
import { useGeoTiffLoader } from './util/useGeotiffLoader.js';
import {
  loadFieldCoordinates,
  loadRevisionClassification,
  loadImages,
  loadOverlay,
  getManualToEdit,
  getRevisionToEdit,
  loadFalsePositiveClassification,
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
const revisionLayerGroup = ref(new L.FeatureGroup());
const falsePositiveLayerGroup = ref(L.layerGroup());
const falseNegativeLayerGroup = ref(L.layerGroup());
const layerControlRef = ref(null);
const baseLayerRef = ref(null);
const tifLayersLoaded = ref([]);
const editingLayer = ref(null);
const fieldId = props.data.properties.id;
const fieldCoordinates = props.data.geometry.coordinates;
const fieldStatus = computed(() => props.data.properties.status);


const polygonsDraw = ref();
const polygonsDrawAnalisct = ref();

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
    fieldStatus.value,
  );

  loadImages(props.data.images, tifLayersLoaded, overlays, tifLayerGroups)

  mapRef.value.createPane('manualClassificationPane');
  mapRef.value.getPane('manualClassificationPane').style.zIndex = 650;

  mapRef.value.createPane('revisionClassificationPane');
  mapRef.value.getPane('revisionClassificationPane').style.zIndex = 600;


  layerControlRef.value = L.control.layers(baseLayers, overlays).addTo(map);
  map.fitBounds(bounds);

  updateOverlays(
    isClickedToManualRef.value,
    isClickedToRevisionRef.value,
    overlays
  );

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

  if (fieldStatus.value === "Aprovado") {
    const [hasFalsePositive, hasFalseNegative] = await loadFalsePositiveClassification(
      fieldId,
      falsePositiveLayerGroup.value,
      falseNegativeLayerGroup.value
    );

    if (hasFalsePositive) {
      falsePositiveLayerGroup.value.addTo(mapRef.value);
      currentOverlays['Falsos Positivos'] = falsePositiveLayerGroup.value;
      layerControlRef.value.addOverlay(falsePositiveLayerGroup.value, 'Falsos Positivos(Retirado manualmente)');
       mapRef.value.removeLayer(falsePositiveLayerGroup.value);
    }

    if (hasFalseNegative) {
      falseNegativeLayerGroup.value.addTo(mapRef.value);
      currentOverlays['Falsos Negativos'] = falseNegativeLayerGroup.value;
      layerControlRef.value.addOverlay(falseNegativeLayerGroup.value, 'Falsos Negativos(Não detectado pela IA)');
      mapRef.value.removeLayer(falseNegativeLayerGroup.value);
    }

    mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.removeLayer(manualLayerGroup.value);
    delete currentOverlays['Classificação Manual'];
    layerControlRef.value.addOverlay(manualLayerGroup.value, 'Classificação Manual');
    currentOverlays['Classificação Manual'] = manualLayerGroup.value;
  }

  // Retira camada de revisao
  if(!(isClickedToRevision || isClickedToManual) && fieldStatus.value !== "Aprovado"){
    console.log("Removendo camada de revisão");
    mapRef.value.removeLayer(revisionLayerGroup.value);
    layerControlRef.value.removeLayer(revisionLayerGroup.value);
    delete currentOverlays['Revisão Manual'];
    mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.removeLayer(manualLayerGroup.value);
    delete currentOverlays['Classificação Manual'];
    return;
  }

  if (isClickedToManual) {
    mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.removeLayer(manualLayerGroup.value);
    delete currentOverlays['Classificação Manual'];
    manualLayerGroup.value.addTo(mapRef.value);
    currentOverlays['Classificação Manual'] = manualLayerGroup.value;
    mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.addOverlay(manualLayerGroup.value, 'Classificação Manual');
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

  if (isClickedToRevision) {
    console.log("Adicionando camada de revisão");
    mapRef.value.removeLayer(revisionLayerGroup.value);
    layerControlRef.value.removeLayer(revisionLayerGroup.value);
    delete currentOverlays['Revisão Manual'];
    revisionLayerGroup.value.addTo(mapRef.value);
    currentOverlays['Revisão Manual'] = revisionLayerGroup.value;
    mapRef.value.removeLayer(revisionLayerGroup.value);
    layerControlRef.value.addOverlay(revisionLayerGroup.value, 'Revisão Manual');

     mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.removeLayer(manualLayerGroup.value);
    delete currentOverlays['Classificação Manual'];
    manualLayerGroup.value.addTo(mapRef.value);
    currentOverlays['Classificação Manual'] = manualLayerGroup.value;
    mapRef.value.removeLayer(manualLayerGroup.value);
    layerControlRef.value.addOverlay(manualLayerGroup.value, 'Classificação Manual');
  }

}

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

watchEffect(async () => {
  if (!mapRef.value) return;

  // Ativar modo de edição manual
  if (isClickedToManualRef.value && !drawControl) {
    drawControl = new L.Control.Draw({
      position: 'topright',
      edit: false,
      draw: {
        polygon: true,
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
      }
    });

    mapRef.value.addControl(drawControl);

    try{
      await getManualToEdit(fieldId, manualLayerGroup.value, props.data.automatic.features, polygonsDraw);
    }
    catch (error) {
      console.error("Erro ao adicionar controle de desenho:", error);
    }

    for (const layer of manualLayerGroup.value.getLayers()) {
      const geojson = layer.toGeoJSON();
      layer.feature = geojson;
      layer.setStyle({
        weight: 4,
        color: 'purple',
        weight: 2,
        opacity: 1,
        fillColor: '#orange',
        fillOpacity: 0.4
      });

      attachManualLayerEvents(layer);
    }

    // Evento de criação de novo polígono
    mapRef.value.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
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
      layer.options.customId = newId;

      layer.setStyle({
        color: 'orange',
        weight: 2,
        opacity: 1,
        fillColor: '#orange',
        fillOpacity: 0.4
      });

      manualLayerGroup.value.addLayer(layer);
      attachManualLayerEvents(layer);
      polygonsDraw.value.features.push(layer.toGeoJSON());

      const layerGeometry = JSON.stringify(layer.toGeoJSON().geometry);

      const exists = polygonsDraw.value.features.some(feature =>
        JSON.stringify(feature.geometry) === layerGeometry
      );

      if (exists) {
        console.log("✅ Layer já está em polygonsDraw");
      } else {
        console.log("🆕 Layer ainda não está em polygonsDraw");
      }
    });
  }

  // Remover controle de desenho quando o modo manual for desativado
  if (!isClickedToManualRef.value && drawControl) {
    mapRef.value.removeControl(drawControl);
    drawControl = null;
    polygonsDraw.value = getEmptyPolygonsDraw();
    editingLayer.value = null;
  }

  // Função para editar o polígono ao clicar
function startEditPolygonManual(layer) {
  console.log("polygonsDraw antes:", polygonsDraw.value.features);
  manualLayerGroup.value.eachLayer(l => {
    if (l.editing && l.editing.enabled() && l !== layer) {
      l.editing.disable();
      console.log("Desabilitando edição de outro polígono.");
    }
  });

  // Habilita edição no polígono clicado
  if (layer.editing) {
    layer.editing.enable();
    editingLayer.value = layer;
    // Atualiza GeoJSON no array de polígonos quando a edição ocorrer
    layer.on('edit', () => {
      const geojson = layer.toGeoJSON();
      const id = layer.options?.customId;
      console.log("id", id);
      const index = polygonsDraw.value.features.findIndex(f => f.properties.id === id);
      if (index !== -1) {
        polygonsDraw.value.features[index].geometry = {
          type: "MultiPolygon",
          coordinates: [geojson.geometry.coordinates]
        };
        console.log("Polígono editado manualmente:", polygonsDraw.value.features[index]);
      }
    });
  }
}


  function deletePolygonManual(layer) {
      if (manualLayerGroup.value.hasLayer(layer)) {
        manualLayerGroup.value.removeLayer(layer);
        console.log("Polígono deletado.");
      }
      const deletedId = layer.options.customId ??
        layer.feature?.properties?.id ??
        null;
      if (deletedId) {
        polygonsDraw.value.features = polygonsDraw.value.features.filter(
          f => f.properties.id !== deletedId
        );
      }
  }


  // Função reutilizável para associar eventos aos polígonos manuais
  function attachManualLayerEvents(layer) {
    layer.on('click', (event) => {
      event.originalEvent.stopPropagation();
      startEditPolygonManual(layer);
    });

    let pressTimer = null;

    layer.on('mouseup', () => {
      clearTimeout(pressTimer);
    });

    layer.on('mouseout', () => {
      clearTimeout(pressTimer);
    });

    layer.on('mousedown', (event) => {
      event.originalEvent.stopPropagation();
      pressTimer = setTimeout(() => {
        deletePolygonManual(layer);
      }, 400);
    });
  }
});





let manualDrawControl = null;

watchEffect( async () => {
  if (!mapRef.value) return;

  if (isClickedToRevisionRef.value && !manualDrawControl) {
    manualDrawControl = new L.Control.Draw({
      position: 'topright',
      edit: false, // mesma ordem da primeira
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      }
    });

    mapRef.value.addControl(manualDrawControl);

    try {
      await getRevisionToEdit(fieldId, revisionLayerGroup.value, polygonsDrawAnalisct);
    } catch (error) {
      console.error("Erro ao adicionar controle de desenho:", error);
    }

    console.log("polygonsDrawAnalisct.value.features", polygonsDrawAnalisct.value.features);

    for (const layer of revisionLayerGroup.value.getLayers()) {
      const geojson = layer.toGeoJSON();
      layer.feature = geojson;
      layer.setStyle({
        weight: 4,
        color: 'yellow',
        fillOpacity: 0.2
      });

      attachLayerEvents(layer);
    }

    // Evento de criação de novo polígono
    mapRef.value.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const newId = Date.now();

      const exists = polygonsDrawAnalisct.value.features.find(f => f.properties.id === newId);
      if (!exists) {
        const description = prompt("Polígono adicionado com sucesso! Digite uma descrição:");

        geojson.properties = {
          id: newId,
          description: description || ''
        };

        layer.feature = geojson;
        layer.options.customId = newId;
        layer.setStyle({
          weight: 4,
          color: 'yellow',
          fillOpacity: 0.2
        });

        layer.bindTooltip(description || '', {
          permanent: true,
          direction: 'center',
          className: 'polygon-label'
        });

        polygonsDrawAnalisct.value.features.push(layer.toGeoJSON());
        attachLayerEvents(layer);
        revisionLayerGroup.value.addLayer(layer);
      }
    });
  }

  if (!isClickedToRevisionRef.value && manualDrawControl) {
    mapRef.value.off(L.Draw.Event.CREATED);
    mapRef.value.removeControl(manualDrawControl);
    manualDrawControl = null;
    editingLayer.value = null;
  }

    // Função reutilizável para associar eventos aos polígonos manuais
  function attachLayerEvents(layer) {
    layer.on('click', (event) => {
      event.originalEvent.stopPropagation();
      startEditPolygon(layer);
    });

    let pressTimer = null;

    layer.on('mouseup', () => {
      clearTimeout(pressTimer);
    });

    layer.on('mouseout', () => {
      clearTimeout(pressTimer);
    });

    layer.on('mousedown', (event) => {
      event.originalEvent.stopPropagation();
      pressTimer = setTimeout(() => {
        deleteRevisionPolygon(layer);
      }, 400);
    });
  }

  function startEditPolygon(layer) {
  console.log("layer:", layer);
  revisionLayerGroup.value.eachLayer(l => {
    if (l.editing && l.editing.enabled() && l !== layer) {
      l.editing.disable();
    }
  });

  if (layer.editing) {
    layer.editing.enable();
    editingLayer.value = layer;

    layer.on('edit', () => {
      const geojson = layer.toGeoJSON();
      const id = layer.options?.customId;
      console.log("id", id);
      const index = polygonsDrawAnalisct.value.features.findIndex(f => f.properties.id === id);
      if (index !== -1) {
        polygonsDrawAnalisct.value.features[index].geometry = {
          type: "MultiPolygon",
          coordinates: [geojson.geometry.coordinates]
        };
        console.log("Polígono editado individualmente:", polygonsDrawAnalisct.value.features[index]);
      }
    });
  }
}

  function deleteRevisionPolygon(layer) {
  console.log("Deletando polígono:", layer);
   if (revisionLayerGroup.value.hasLayer(layer)) {
      revisionLayerGroup.value.removeLayer(layer);
    }
    console.log(" polygonsDrawAnalisct.value.features:",  polygonsDrawAnalisct.value.features);
    const deletedId =
      layer.options.customId ??
      layer.feature?.properties?.id ??
      false;
      console.log(deletedId)
    if (deletedId) {
      polygonsDrawAnalisct.value.features = polygonsDrawAnalisct.value.features.filter(
        f => f.properties.id !== deletedId
      );
    }
  }
});

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



watch(polygonsDrawAnalisct, (newVal) => {
  console.log('🔍 polygonsDrawAnalisct mudou:', polygonsDrawAnalisct.value);
  console.log(newVal);
}, { deep: true });

</script>

<template>
  <div class="map-container">
    <l-map
      :zoom="zoom"
      :min-zoom="12"
      :max-zoom="isClickedToManual || isClickedToRevision ? 24 : 18"
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
