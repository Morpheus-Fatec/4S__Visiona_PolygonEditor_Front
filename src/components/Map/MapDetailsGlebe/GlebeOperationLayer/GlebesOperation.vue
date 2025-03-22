<script setup>
import { ref, defineProps } from 'vue';
import { LGeoJson } from '@vue-leaflet/vue-leaflet';

const props = defineProps({
  data: Object
});

const updateKey = ref(0);

</script>

<template>
  <l-geo-json :key="updateKey" :geojson="props.data" />
</template>