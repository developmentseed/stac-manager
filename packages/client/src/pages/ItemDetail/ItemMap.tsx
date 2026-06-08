import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Map, { Source, Layer, MapRef, ErrorEvent } from 'react-map-gl/maplibre';
import { StacItem } from 'stac-ts';
import getBbox from '@turf/bbox';

import { BackgroundTiles, sanitizeBbox } from '$components/Map';

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
  props: { item: StacItem } & React.ComponentProps<typeof Map>
) {
  const { item, ...rest } = props;

  const [map, setMap] = useState<MapRef>();
  const setMapRef = (m: MapRef) => setMap(m);

  // Fit the map view around the current results bbox
  useEffect(() => {
    if (!map || !item) return;

    const bounds = sanitizeBbox(getBbox(item as GeoJSON.Feature));
    if (!bounds) return;

    // maxZoom keeps a zero-area geometry (a single point) from fitting to an
    // absurd zoom; the guard stops a still-degenerate extent from crashing.
    try {
      map.fitBounds(bounds, { padding: 30, duration: 0, maxZoom: 12 });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to fit map to item extent', error);
    }
  }, [item, map]);

  const previewAsset = useMemo(() => {
    if (!item) return undefined;
    const cogs = Object.values(item.assets).filter((a) =>
      cogMediaTypes.includes(a.type || '')
    );
    return (cogs.find((a) => a.roles?.includes('visual')) ?? cogs[0])?.href;
  }, [item]);

  // STAC bbox can be 4 (2D) or 6 (3D: minx,miny,minz,maxx,maxy,maxz) values;
  // maplibre's Source.bounds wants the 2D corners only. Constraining tile
  // requests to the item extent stops rdnt.io from being asked for tiles
  // outside the COG, which return 204 and surface as a maplibre decode error.
  const previewBounds = useMemo<
    [number, number, number, number] | undefined
  >(() => {
    const bbox = item?.bbox;
    if (!bbox) return undefined;
    if (bbox.length === 4) return [bbox[0], bbox[1], bbox[2], bbox[3]];
    if (bbox.length === 6) return [bbox[0], bbox[1], bbox[3], bbox[4]];
    return undefined;
  }, [item]);

  // rdnt.io returns 204 for COG tiles outside the imagery extent (even within
  // the declared bbox, since COGs can be irregularly shaped). maplibre then
  // logs a generic "could not be decoded" console.error per empty tile, which
  // Parcel's dev overlay surfaces as a runtime error. Swallow those — they're
  // benign for sparse-coverage previews — while letting real map errors
  // through.
  const handleMapError = useCallback((e: ErrorEvent) => {
    if (e.error?.message?.includes('could not be decoded')) return;
    // eslint-disable-next-line no-console
    console.error(e.error);
  }, []);

  return (
    <Map ref={setMapRef} {...rest} onError={handleMapError}>
      <BackgroundTiles />
      {previewAsset && (
        <Source
          id='preview'
          type='raster'
          tiles={[
            `https://tiles.rdnt.io/tiles/{z}/{x}/{y}@2x?url=${previewAsset}`
          ]}
          tileSize={256}
          bounds={previewBounds}
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
