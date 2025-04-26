import { defineStore } from 'pinia';

export const usePolygonStore = defineStore('polygon', {
  state: () => ({
    polygonsDraw: null,
  }),
  actions: {
    setPolygonsDraw(data) {
      this.polygonsDraw = data;
    },
    getPolygonsDraw() {
      return this.polygonsDraw;
    }
  }
});
