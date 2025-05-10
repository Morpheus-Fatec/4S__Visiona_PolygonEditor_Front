import { getRevisionCollection } from "./LoadClassification.js";

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

    if (revisionClassification == null || revisionClassification.size == 0) {
      return;
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
  } catch (error) {
    console.error('Erro ao carregar classificação de revisão:', error);
  }
}


function loadManualClassification(manualClassification, manualLayerGroup) {
  if (manualClassification == null || manualClassification.size == 0) {
    return;
  }
  const manualMultiPolygons = manualClassification.map(item => {
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
      manualLayerGroup.value.addLayer(revisionPolygon);
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
      classificationLayerGroup.value.addLayer(classificationPolygon);
    });
  });
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
};
