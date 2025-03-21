import { defineStore } from 'pinia';
import useGeoFilterStore from './GeoFilterStore';

const useSidebarGlebesGlobalStore = defineStore('gleba', {
  state: () => ({
    isGlebaClicked: false,
    selectedFeatureId: null,
  }),

  actions: {
    toggleGlebaClick(featureId) {
      const geoFilterStore = useGeoFilterStore();
      if (this.selectedFeatureId === featureId) {
        this.isGlebaClicked = !this.isGlebaClicked;
      } else {
        this.isGlebaClicked = true;
        this.selectedFeatureId = featureId;
      }
    },
  },
});

export default useSidebarGlebesGlobalStore;