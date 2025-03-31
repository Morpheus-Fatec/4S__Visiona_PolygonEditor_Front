<script setup>
import { ref, onMounted, watch, watchEffect } from 'vue';
import { LGeoJson } from '@vue-leaflet/vue-leaflet';

import useGeoFilterStore from '../../../../store/GeoFilterStore';
import useSidebarGlebesGlobalStore from '../../../../store/SidebarGlebesGlobalStore';

const sidebarStore = useSidebarGlebesGlobalStore();
const geoFilterStore = useGeoFilterStore();

const props = defineProps({
  data: Object
});

const data = ref([]);
const updateKey = ref(0);

const handleClick = (e) => {
  const clickedFeature = e.propagatedFrom.feature;

  sidebarStore.toggleGlebaClick(clickedFeature.properties.id);

  const same = geoFilterStore.geoFilterData && geoFilterStore.geoFilterData.properties.id === clickedFeature.properties.id;

  if (same) {
    geoFilterStore.clearGeoFilter();
  } else {
    geoFilterStore.setGeoFilter(clickedFeature);
  }

  updateKey.value++;
};

const featureStyle = (feature) => {
  const isSelected = geoFilterStore.geoFilterData && geoFilterStore.geoFilterData.properties.id === feature.properties.id;
  return {
    weight: isSelected ? 5 : 3,
    opacity: isSelected ? 1 : 0.7,
  };
};
</script>

<template>
  <l-geo-json :key="updateKey" :geojson="props?.data" :optionsStyle="featureStyle" @click="handleClick" />
</template>