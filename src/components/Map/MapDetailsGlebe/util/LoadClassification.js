import api from "@/components/util/API.js";


export async function getFeatureCollection(fieldId) {
  try {
    const response = await api.get(`/field/featureCollection/${fieldId}`, {
      withCredentials: true
    });

    if (response && response.data && response.data.features) {
      const result = processGeoJsonCoordinates(response.data.features);
      return result;
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
      return null;
    }
  } catch (error) {
    console.error("Erro ao carregar featureCollection:", error);
    return null;
  }
}

export async function getFalsePositive(fieldId) {
  try {
    const response = await api.get(`/classification/falsePositive/${fieldId}`, {
      withCredentials: true
    });

    if (response && response.data && response.data.features) {
      const result = response.data;
      return result;
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
      return null;
    }
  } catch (error) {
    console.error("Erro ao carregar featureCollection:", error);
    return null;
  }
}

export async function getFalseNegative(fieldId) {
  try {
    const response = await api.get(`/classification/falseNegative/${fieldId}`, {
      withCredentials: true
    });

    if (response && response.data && response.data.features) {
      const result = response.data;
      return result;
    } else {
      console.error("Resposta da API inválida ou sem a propriedade 'features'");
      return null;
    }
  } catch (error) {
    console.error("Erro ao carregar featureCollection:", error);
    return null;
  }
}

export async function getManualCollection(fieldId) {
  try {
    const response = await api.get(`/field/manualCollection/${fieldId}`, {
      withCredentials: true,
    });
    const result = response.data;

    return result;
  } catch (error) {
    console.error("Erro ao carregar manualCollection:", error);
    return null;
  }
}

export async function getRevisionCollection(fieldId) {
  try {
    const response = await api.get(`/field/revisionCollection/${fieldId}`, {
      withCredentials: true
    });

    const result = response.data;
    return result;
  } catch (error) {
    console.error("Erro ao carregar revisionCollection:", error);
    return null;
  }
}

const processGeoJsonCoordinates = (geoJson) => {

  if (!geoJson || typeof geoJson !== "object") {
    console.error("GeoJSON inválido:", geoJson);
    return geoJson;
  }

  if (geoJson.geometry && typeof geoJson.geometry.coordinates === 'string') {
    geoJson.geometry.coordinates = parseCoordinatesString(geoJson.geometry.coordinates);
  }

  if (geoJson.classification && Array.isArray(geoJson.classification.features)) {
    geoJson.classification.features = geoJson.classification.features.map(classificationItem => {
      if (typeof classificationItem.geometry.coordinates === 'string') {
        classificationItem.geometry.coordinates = parseCoordinatesString(classificationItem.geometry.coordinates);
      }
      return classificationItem;
    });
  }
  return geoJson;
};

function parseCoordinatesString(coordinatesString) {
  try {
    return JSON.parse(coordinatesString);
  } catch (error) {
    console.error("Erro ao analisar a string de coordenadas:", error);
    return null;
  }

}
