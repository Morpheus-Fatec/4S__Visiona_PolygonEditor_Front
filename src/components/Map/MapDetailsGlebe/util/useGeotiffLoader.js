// src/composables/useGeoTiffLoader.js
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import georaster from 'georaster';

/**
 * Inicializa carregamento de GeoTIFF no evento overlayadd do Leaflet
 * @param {Object} map - Instância do Leaflet map
 * @param {Object} tifLayerGroups - ref com LayerGroups
 * @param {Object} data - Contém array de imagens com `name` e `link`
 * @param {Object} coordinates - Coordenadas do tipo MultiPolygontifLayerGroup
 * @param {Ref} tifLayersLoaded - ref boolean[] indicando camadas já carregadas
 */
export function useGeoTiffLoader(map, tifLayerGroups, data, coordinates, tifLayersLoaded) {
  map.on('overlayadd', async (event) => {
    const layerIndex = data.images.findIndex(img => img.name === event.name);
    if (layerIndex !== -1 && !tifLayersLoaded.value[layerIndex]) {
      await loadTif(data.images[layerIndex].link, layerIndex, coordinates, tifLayerGroups);
      tifLayersLoaded.value[layerIndex] = true;
    }
  });
}

async function loadTif(url, layerIndex, coordinates, tifLayerGroups) {
  console.log('Carregando GeoTIFF:', url);
  try {
    const clipArea = createClipAreaFromCoordinates(coordinates);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao carregar GeoTIFF: " + url);

    const arrayBuffer = await response.arrayBuffer();
    const raster = await georaster(arrayBuffer);

    const layer = new GeoRasterLayer({
      georaster: raster,
      opacity: 1,
      resolution: 512,
      mask: clipArea,
      mask_strategy: "outside"
    });

    tifLayerGroups.value[layerIndex].addLayer(layer);
  } catch (error) {
    console.error("Erro ao carregar o GeoTIFF:", error);
  }
}

function createClipAreaFromCoordinates(coordinates) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: coordinates
        }
      }
    ]
  };
}
