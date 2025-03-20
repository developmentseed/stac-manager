import React, { useEffect, useMemo, useState } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/maplibre';
import { StacAsset } from 'stac-ts';
import getBbox from '@turf/bbox';

import { BackgroundTiles } from '$components/Map';

const resultsOutline = {
  'line-color': '#C53030',
  'line-width': 2
};

const resultsFill = {
  'fill-color': '#C53030',
  'fill-opacity': 0.1
};

const cogMediaTypes = [
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff'
];

export function ItemMap(
  props: { item: any } & React.ComponentProps<typeof Map>
) {
  const { item, ...rest } = props;

  const [map, setMap] = useState<MapRef>();
  const setMapRef = (m: MapRef) => setMap(m);

  // Fit the map view around the current results bbox
  useEffect(() => {
    const bounds = item && getBbox(item);

    if (map && bounds) {
      const [x1, y1, x2, y2] = bounds;
      map.fitBounds([x1, y1, x2, y2], { padding: 30, duration: 0 });
    }
  }, [item, map]);

  const previewAsset = useMemo(() => {
    if (!item) return;

    return Object.values(item.assets).reduce((preview, asset) => {
      const { type, href, roles } = asset as StacAsset;
      if (cogMediaTypes.includes(type || '')) {
        if (!preview) {
          return href;
        } else {
          if (roles && roles.includes('visual')) {
            return href;
          }
        }
      }
      return preview;
    }, undefined);
  }, [item]);

  return (
    <Map ref={setMapRef} {...rest}>
      <BackgroundTiles />
      {previewAsset && (
        <Source
          id='preview'
          type='raster'
          tiles={[
            `http://tiles.rdnt.io/tiles/{z}/{x}/{y}@2x?url=${previewAsset}`
          ]}
          tileSize={256}
          attribution="Background tiles: © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
        >
          <Layer id='preview-tiles' type='raster' />
        </Source>
      )}
      <Source id='results' type='geojson' data={item}>
        <Layer id='results-line' type='line' paint={resultsOutline} />
        {!previewAsset && (
          <Layer id='results-fill' type='fill' paint={resultsFill} />
        )}
      </Source>
    </Map>
  );
}
