import React from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

function BackgroundTiles() {
  return (
    <Source
      id='background'
      type='raster'
      tiles={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
      tileSize={256}
      maxzoom={19}
      attribution="Background tiles: © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
    >
      <Layer id='background-tiles' type='raster' />
    </Source>
  );
}

export default BackgroundTiles;
