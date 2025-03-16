import { defineStore } from 'pinia';

const useGeoFilterStore = defineStore('geoFilter', {
  state: () => ({
    geoFilterData: null,
  }),

  actions: {
    setGeoFilter(feature) {
      this.geoFilterData = feature;
    },
    clearGeoFilter() {
      this.geoFilterData = null;
    },
  },
});

export default useGeoFilterStore;