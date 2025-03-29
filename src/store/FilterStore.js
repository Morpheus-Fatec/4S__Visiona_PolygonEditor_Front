import { defineStore } from 'pinia';

export const useFilterStore = defineStore('filtered', {
    state: () => ({
        filteredData: [], 
    }),
    actions: {
        applyFilter() {
            return this.filteredData;
        }
    }
});
