<script setup>
import { ref, onMounted } from 'vue';
import { LGeoJson } from '@vue-leaflet/vue-leaflet';
import { areasSJC } from '../data/areasSJC';

const data = ref(null);
const geoFilter = ref(null);
const updateKey = ref(0);

onMounted(() => {
  data.value = areasSJC;
});

const handleClick = (e) => {
  const clickedFeature = e.propagatedFrom.feature;
  console.log(clickedFeature);
  const same = geoFilter.value && geoFilter.value.properties.id === clickedFeature.properties.id;

  geoFilter.value = same ? null : clickedFeature;
  updateKey.value++;
};

const featureStyle = (feature) => {
  const isSelected = geoFilter.value && geoFilter.value.properties.id === feature.properties.id;
  return {
    weight: isSelected ? 5 : 3,
    opacity: isSelected ? 1 : 0.7
  };
};
</script>

<template>
  <l-geo-json :key="updateKey" :geojson="data" :optionsStyle="featureStyle" @click="handleClick" />
</template>
