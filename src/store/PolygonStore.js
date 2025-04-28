import { defineStore } from 'pinia';

export const usePolygonStore = defineStore('polygon', {
  state: () => ({
    polygonsDraw: null,
    polygonsDrawAnalisct: null
  }),
  actions: {
    setPolygonsDraw(data) {
      this.polygonsDraw = data;
    },
    getPolygonsDraw() {
      return this.polygonsDraw;
    },
    setPolygonsDrawAnalisct(data) {
      this.polygonsDrawAnalisct = data;
    },
    getPolygonsDrawAnalisct() {
      return this.polygonsDrawAnalisct;
    }
  }
});
