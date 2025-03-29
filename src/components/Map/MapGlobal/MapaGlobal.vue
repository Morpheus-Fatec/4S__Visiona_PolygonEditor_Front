<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet-draw';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LControlScale, LGeoJson, LControlLayers } from '@vue-leaflet/vue-leaflet';
import GlebesGlobalLayer from './GlebesLayer/GlebesGlobalLayer.vue';
import axios from 'axios';

import useSidebarGlebesGlobalStore from '../../../store/SidebarGlebesGlobalStore';
import useGeoFilterStore from '../../../store/GeoFilterStore';

const sidebarStore = useSidebarGlebesGlobalStore();
const geoFilterStore = useGeoFilterStore();
const geoFilterData = computed(() => geoFilterStore.geoFilterData);
const isOffcanvasOpen = computed(() => sidebarStore.isGlebaClicked);

const data = ref(null);

function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }
}

const processGeoJsonCoordinates = (geoJson) => {
  if (!geoJson || !geoJson.features) {
    return geoJson;
  }

  const processedFeatures = geoJson.features.map(feature => {
    if (feature.geometry && typeof feature.geometry.coordinates === 'string') {
      feature.geometry.coordinates = parseCoordinatesString(feature.geometry.coordinates);
    }
    return feature;
  });

  return {
    ...geoJson,
    features: processedFeatures
  };
};

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/field/featureCollectionSimple", {
      withCredentials: true
    });

    if (response && response.data && Array.isArray(response.data.features)) {
      data.value = processGeoJsonCoordinates(response.data);
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
    }
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);
  }
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

const zoom = ref(13);
const center = ref([ -20.64802334007959, -49.34357424513479]);
const router = useRouter();

const handlePrintId = () => {
  if (!geoFilterData.value || !geoFilterData.value.properties) {
    console.error("O objeto 'geoFilterData' não está carregado corretamente");
    return;
  }

  const id = geoFilterData?.value.properties.id;
  if (id) {
    router.push({
      name: 'operacaoMapDetails',
      params: { id },
      state: { operation: geoFilterData.value }
    });
  } else {
    console.log(`Área com id ${id} não encontrada.`);
  }
};
</script>

<template>
  <div class="map-container">
    <l-map 
      :zoom="zoom" 
      :center="center" 
      @click.prevent.stop
      :min-zoom="2"
      :max-zoom="16" 
    >
      <GlebesGlobalLayer :data="data"/>
      <l-control-scale position="bottomleft" :imperial="true" :metric="true" />
      <l-control-layers position="topright" />
      <l-tile-layer v-for="tileProvider in tileProviders" :key="tileProvider.name" :name="tileProvider.name"
        :visible="tileProvider.visible" :url="tileProvider.url" :attribution="tileProvider.attribution"
        layer-type="base" />
    </l-map>
    <div 
      class="offcanvas offcanvas-end bg-transparent disableOffcanvas"
      :class="{ 'show': isOffcanvasOpen }"
      :aria-hidden="!isOffcanvasOpen"
      id="offcanvasRight" 
      aria-labelledby="offcanvasRightLabel"
    >
      <div class="offcanvas-body d-flex flex-column align-items-center justify-content-center">
        <template v-if="geoFilterData">
          <div class="card shadow-lg border-0 enableOffcanvasBody">
            <div class="card-header bg-primary text-white text-center d-flex justify-content-between align-items-center">
              <h5 class="pt-2 h5">{{ geoFilterData.properties.farm.farmName ? geoFilterData.properties.farm.farmName : 'Nome não disponível' }}</h5>
              </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex align-items-center gap-2  pb-3">
                  <span class="fw-bold">ID da operação:</span> 
                  <span class="badge bg-secondary">{{ geoFilterData.properties.id ? geoFilterData.properties.id : 'ID nao disponivel' }}</span>
                </li>
                <li class="list-group-item d-flex gap-2 pt-3 pb-3 align-items-center">
                  <span class="fw-bold">Cidade:</span> 
                  <span class="badge bg-secondary text-white">
                    {{
                      geoFilterData?.properties?.farm?.farmCity && geoFilterData?.properties?.farm?.farmState
                        ? `${geoFilterData.properties.farm.farmCity} - ${geoFilterData.properties.farm.farmState}`
                        : 'Dados não disponíveis'
                    }}
                  </span>
                 </li>
                <li class="list-group-item d-flex gap-2 pt-3 pb-3 align-items-center">
                  <span class="fw-bold">Tamanho da área</span> 
                  <span class="badge bg-secondary text-white">{{geoFilterData.properties.area}} ha</span>
                </li>
                <li class="list-group-item d-flex gap-2 pt-3 pb-3 align-items-center">
                  <span class="fw-bold">Cultura:</span> 
                  <span class="badge bg-secondary text-white">{{geoFilterData.properties.culture}}</span>
                </li>
                <li class="list-group-item d-flex gap-2 pt-3 pb-3 align-items-center">
                  <span class="fw-bold">Solo:</span> 
                  <span class="badge bg-secondary text-white">{{geoFilterData.properties.soil}}</span>
                </li>
                <li class="list-group-item d-flex gap-2 pt-3 pb-3 align-items-center">
                  <span class="fw-bold">Status</span> 
                  <span class="badge bg-secondary text-white">{{geoFilterData.properties.status}}</span>
                </li>
              </ul>
            </div>
            <div class="text-center pb-3">
              <button type="button" class="btn btn-outline-primary" @click="handlePrintId">Ver mais detalhes</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
}
.disableOffcanvas {
  pointer-events: none;
}

.enableOffcanvasBody {
  pointer-events: auto;
}

</style>