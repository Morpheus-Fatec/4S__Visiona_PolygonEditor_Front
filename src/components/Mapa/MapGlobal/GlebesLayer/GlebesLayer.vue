<script setup>
import { ref, onMounted } from 'vue';
import { LGeoJson } from '@vue-leaflet/vue-leaflet';
import areasSJC from '../../data/areasSJC';
import useGlebaStore from '../../../../store/GlebaStore';
import useGeoFilterStore from '../../../../store/GeoFilterStore';

const store = useGlebaStore();
const geoFilterStore = useGeoFilterStore();

const data = ref(null);
const updateKey = ref(0);

onMounted(() => {
  data.value = areasSJC;
});

const handleClick = (e) => {
  const clickedFeature = e.propagatedFrom.feature;
  store.toggleGlebaClick(clickedFeature.properties.id);

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
  <l-geo-json :key="updateKey" :geojson="data" :optionsStyle="featureStyle" @click="handleClick" />
</template>