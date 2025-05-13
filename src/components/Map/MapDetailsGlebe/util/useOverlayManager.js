import { getRevisionCollection, getManualCollection } from "./LoadClassification.js";

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

async function getManualToEdit(manualLayerGroup, automatic, polygonsDraw) {

  const manualClassification = await getManualCollection(fieldId);

  if (manualClassification == null || manualClassification.features.length == 0) {

    const automaticClassification = automatic;
    return false;
  }

  console.log("Polígonos feature req:", manualClassificationReq.features);

  const parsedFeatures = manualClassificationReq.features.map(feature => {
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

    // Se for MultiPolygon, converte para Polygon pegando o primeiro anel
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

  console.log("Polígonos feature edit:", polygonsDraw.value.features);
  return true;
}



function createNewManualClassification(automaticClassification, manualLayerGroup) {
  if (automaticClassification == null || automaticClassification.size== 0) {
    return;
  }
  const manualMultiPolygons = automaticClassification.map(item => {
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
    // if (!existManual) {
    //   createNewManualClassification(automaticClassification, manualLayerGroup);
    //   overlays['Classificação Manual'] = manualLayerGroup;
    // }
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


export {
  loadFieldCoordinates,
  loadRevisionClassification,
  loadManualClassification,
  loadAutomaticClassification,
  loadImages,
  loadOverlay,
  createNewManualClassification,
  getManualToEdit,
};
