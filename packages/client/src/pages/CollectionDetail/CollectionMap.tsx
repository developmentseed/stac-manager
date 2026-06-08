import React, { useEffect, useMemo, useState } from 'react';
import Map, { Layer, Source, MapRef } from 'react-map-gl/maplibre';
import { LngLatBounds } from 'maplibre-gl';
import bboxPolygon from '@turf/bbox-polygon';

import { BackgroundTiles, sanitizeBbox } from '../../components/Map';
import { StacCollection } from 'stac-ts';

const extentOutline = {
  'line-color': '#276749',
  'line-width': 2,
  'line-dasharray': [2, 2]
};

const dataOutline = {
  'line-color': '#C53030',
  'line-width': 1
};

type CollectionMapProps = {
  collection: StacCollection;
};

function CollectionMap({ collection }: CollectionMapProps) {
  const [map, setMap] = useState<MapRef>();
  const setMapRef = (m: MapRef) => setMap(m);

  // Create GeoJSON polygon from extent
  const extent = useMemo(() => {
    if (!collection) return;
    const [x1, y1, x2, y2] = collection.extent.spatial.bbox[0];
    return bboxPolygon([x1, y1, x2, y2]);
  }, [collection]);

  // Create GeoJSON Feature collection from data extents
  const dataExtents = useMemo(() => {
    if (!collection) return;
    if (collection.extent.spatial.bbox.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...data] = collection.extent.spatial.bbox;
      return {
        type: 'FeatureCollection',
        features: data.map(([x1, y1, x2, y2]) => bboxPolygon([x1, y1, x2, y2]))
      };
    }
  }, [collection]);

  // Fit the map view around the current collection extent
  useEffect(() => {
    if (!collection || !map) return;

    const sanitized = collection.extent.spatial.bbox
      .map(sanitizeBbox)
      .filter((b): b is [number, number, number, number] => b !== null);
    if (sanitized.length === 0) return;

    const bounds = new LngLatBounds(sanitized[0]);
    for (let i = 1; i < sanitized.length; i++) {
      const [x1, y1, x2, y2] = sanitized[i];
      bounds.extend([x1, y1, x2, y2]);
    }

    // maxZoom keeps a zero-area extent (a single point, e.g. a bbox like
    // [-90, 90, -90, 90]) from fitting to an absurd zoom level. Guard the
    // call so a still-degenerate extent can't take the whole app down.
    try {
      map.fitBounds(bounds, { padding: 30, duration: 0, maxZoom: 12 });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to fit map to collection extent', error);
    }
  }, [collection, map]);

  return (
    <Map ref={setMapRef}>
      <BackgroundTiles />
      {extent && (
        <Source id='extent' type='geojson' data={extent}>
          <Layer id='extent-line' type='line' paint={extentOutline} />
        </Source>
      )}
      {dataExtents && (
        <Source id='data-extent' type='geojson' data={dataExtents}>
          <Layer id='data-extent-line' type='line' paint={dataOutline} />
        </Source>
      )}
    </Map>
  );
}

export default CollectionMap;
