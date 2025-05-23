import { getRevisionCollection, getManualCollection, getFalsePositive, getFalseNegative } from "./LoadClassification.js";


function loadFieldCoordinates(coordinates, layerGroup) {
  const normalizedCoords = normalizeCoordinates(coordinates);

  const multiPolygons = normalizedCoords.map(polygon =>
    polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
  );

  let bounds = L.latLngBounds();

  multiPolygons.forEach(polygonCoords => {
    const polygon = L.polygon(polygonCoords, {
      weight: 3,
      fillOpacity: 0
    });
    layerGroup.value.addLayer(polygon);
    bounds.extend(polygon.getBounds());
  });

  return bounds;
}


async function loadRevisionClassification(fieldId, revisionLayerGroup) {
  try {
    const revisionClassification = await getRevisionCollection(fieldId);

    if (revisionClassification == null || revisionClassification.features.length == 0) {
      return false;
    }
      const revisionMultiPolygons = revisionClassification.features.map(item => {
      const rawCoords = item.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;
      return {
        description: item.properties.description,
        polygons: parsedCoords.map(polygon =>
        polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
        )
      };
    });
    revisionMultiPolygons.forEach(item => {
      item.polygons.forEach(polygonCoords => {
        const revisionPolygon = L.polygon(polygonCoords, {
          weight: 4,
          color: 'yellow',
          fillOpacity: 0
        });

        revisionPolygon.bindTooltip(item.description, {
          permanent: true,
          direction: 'center',
          className: 'polygon-label'
        });
        revisionLayerGroup.value.addLayer(revisionPolygon);
      });
    });
    return true;
  } catch (error) {
    console.error('Erro ao carregar classificação de revisão:', error);
  }
}


async function loadManualClassification(fieldId, manualLayerGroup ) {

  const manualClassification = await getManualCollection(fieldId);

  if (manualClassification == null || manualClassification.features.length == 0) {
    return false;
  }
  const manualMultiPolygons = manualClassification.features.map(item => {
    const rawCoords = item.geometry.coordinates;
    const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

    return parsedCoords.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );
  });

  manualMultiPolygons.forEach(item => {
    item.forEach(polygonCoords => {
      const revisionPolygon = L.polygon(polygonCoords, {
        weight: 4,
        color: 'blue',
        fillOpacity: 0.2
      });
      manualLayerGroup.addLayer(revisionPolygon);
    });
  });
  return true;
}

async function getManualToEdit(fieldId, manualLayerGroup, automatic, polygonsDraw) {
  manualLayerGroup.clearLayers();
  const manualClassification = await getManualCollection(fieldId);

  let featuresClassification;

  if (manualClassification == null || manualClassification.features.length == 0) {
    featuresClassification = automatic;
  }else{
    featuresClassification = manualClassification.features;
  }

  const parsedFeatures = featuresClassification.map(feature => {
    let geometry = feature.geometry;

    // Caso geometry seja string, tenta fazer parse
    if (typeof geometry === 'string') {
      try {
        geometry = JSON.parse(geometry);
      } catch (e) {
        console.error('Erro ao fazer parse da geometria:', e);
        return null;
      }
    }

    // Caso coordinates ainda sejam string (como parece no seu caso), faz o parse
    if (typeof geometry.coordinates === 'string') {
      try {
        geometry.coordinates = JSON.parse(geometry.coordinates);
      } catch (e) {
        console.error('Erro ao fazer parse das coordenadas:', e);
        return null;
      }
    }
    if (geometry.type === 'MultiPolygon') {
      geometry = {
        type: 'Polygon',
        coordinates: geometry.coordinates[0] || [] // Pega o primeiro polígono
      };
    }

    return {
      ...feature,
      geometry
    };
  }).filter(f => f !== null);

  polygonsDraw.value = {
    features: parsedFeatures
  };
  createLayer(manualLayerGroup, parsedFeatures);

  return true;
}

function createLayer(layerGroup, parsedFeatures) {

  parsedFeatures.forEach(feature => {
    const geometry = feature.geometry;

    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates.map(ring =>
        ring.map(coord => [coord[1], coord[0]]) // [lon, lat] → [lat, lon]
      );

      const polygon = L.polygon(coords, {
        weight: 4,
        color: 'blue',
        fillOpacity: 0.2
      });
      polygon.options.customId = feature.properties.id;

      layerGroup.addLayer(polygon);
    }
  });
}

async function getRevisionToEdit(fieldId, revisionLayerGroup, polygonsDrawAnalisct) {
  const revisionClassification = await getRevisionCollection(fieldId);
  console.log('revisionClassification', revisionClassification.features);
  const allParsedFeatures = [];

  if (!revisionClassification || revisionClassification.features.length === 0) {
      polygonsDrawAnalisct.value = {
      features: allParsedFeatures
    };
    return false;
  }

  const revisionMultiPolygons = revisionClassification.features.map(item => {
    const rawCoords = item.geometry.coordinates;
    const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

    const invertedCoords = parsedCoords.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );

    allParsedFeatures.push({
      ...item,
      geometry: {
        ...item.geometry,
        coordinates: parsedCoords
      }
    });

    return {
      id: item.properties.id,
      description: item.properties.description,
      properties: item.properties,
      polygons: invertedCoords
    };
  });

  revisionMultiPolygons.forEach(item => {
    item.polygons.forEach(polygonCoords => {
      const revisionPolygon = L.polygon(polygonCoords, {
        weight: 4,
        color: 'yellow',
        fillOpacity: 0.2
      });

      revisionPolygon.options.customId = item.properties.id;


      revisionPolygon.bindTooltip(item.description, {
        permanent: true,
        direction: 'center',
        className: 'polygon-label'
      });

      revisionLayerGroup.addLayer(revisionPolygon);
    });
  });

  polygonsDrawAnalisct.value = {
    features: allParsedFeatures
  };

  return true;
}



function loadAutomaticClassification(automaticClassification, classificationLayerGroup) {
  const classificationMultiPolygons = automaticClassification.map(item => {
    const rawCoords = item.geometry.coordinates;
    const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

    return parsedCoords.map(polygon =>
      polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );
  });

  classificationMultiPolygons.forEach(item => {
    item.forEach(polygonCoords => {
      const classificationPolygon = L.polygon(polygonCoords, {
        weight: 4,
        color: 'red',
        fillOpacity: 0
      });
      classificationLayerGroup.addLayer(classificationPolygon);
    });
  });
}


async function loadOverlay(
  fieldId,
  glebaLayerGroup,
  automaticClassification,
  classificationLayerGroup,
  manualLayerGroup,
  fieldStatus
) {
  const overlays = {
    'Gleba Polígono': glebaLayerGroup,
    'Classificação Automática': classificationLayerGroup,
  };
  loadAutomaticClassification(automaticClassification, classificationLayerGroup);

  if (!(fieldStatus === 'Pendente')) {
    const existManual = await loadManualClassification(fieldId, manualLayerGroup, automaticClassification);
    console.log('existManual', existManual);
    if (existManual) {
      overlays['Classificação Manual'] = manualLayerGroup;
    }
  }
  return overlays;
}



function loadImages(images, tifLayersLoaded, overlays, tifLayerGroups){
    images.forEach((image) => {
    const layerGroup = L.layerGroup();
    tifLayerGroups.value.push(layerGroup);
    overlays[image.name] = layerGroup;
    tifLayersLoaded.value.push(false);
  });
}

function normalizeCoordinates(coordinates) {
  const coords = coordinates && coordinates.target ? coordinates.target : coordinates;
  return coords.map(polygon =>
    polygon.map(ring => ring)
  );
}

async function loadFalsePositiveClassification(fieldId, falsePositiveLayerGroup, falseNegativoLayerGroup) {
  const falsePositive = await getFalsePositive(fieldId);
  const falseNegative = await getFalseNegative(fieldId);

  let hasFalsePositive = false;
  let hasFalseNegative = false;

  if (falsePositive && falsePositive.features?.length > 0) {
    const multiPolygons = falsePositive.features.map(item => {
      const rawCoords = item.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      return parsedCoords.map(polygon =>
        polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
      );
    });

    multiPolygons.forEach(item => {
      item.forEach(polygonCoords => {
        const polygon = L.polygon(polygonCoords, {
          weight: 2,
          color: 'grey',
          fillOpacity: 0.3
        });
        falsePositiveLayerGroup.addLayer(polygon);
      });
    });

    hasFalsePositive = true;
  }

  if (falseNegative && falseNegative.features?.length > 0) {
    const multiPolygons = falseNegative.features.map(item => {
      const rawCoords = item.geometry.coordinates;
      const parsedCoords = typeof rawCoords === "string" ? JSON.parse(rawCoords) : rawCoords;

      return parsedCoords.map(polygon =>
        polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))
      );
    });

    multiPolygons.forEach(item => {
      item.forEach(polygonCoords => {
        const polygon = L.polygon(polygonCoords, {
          weight: 2,
          color: 'orange',
          fillOpacity: 0.3
        });
        falseNegativoLayerGroup.addLayer(polygon);
      });
    });

    hasFalseNegative = true;
  }

  return [hasFalsePositive, hasFalseNegative];
}



export {
  loadFieldCoordinates,
  loadRevisionClassification,
  loadImages,
  loadOverlay,
  getManualToEdit,
  getRevisionToEdit,
  loadFalsePositiveClassification
};
