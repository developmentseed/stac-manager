import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Source, MapRef } from "react-map-gl/maplibre";
import { LngLatBounds } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";

import { BackgroundTiles } from "../../components/Map";
import { StacCollection } from "stac-ts";

const extentOutline = {
  "line-color": "#276749",
  "line-width": 2,
  "line-dasharray": [2, 2]
};

const dataOutline = {
  "line-color": "#C53030",
  "line-width": 1,
};

type CollectionMapProps = {
  collection: StacCollection
}

function CollectionMap({ collection }: CollectionMapProps) {
  const [ map, setMap ] = useState<MapRef>();
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
      const [_, ...data] = collection.extent.spatial.bbox;
      return {
        type: "FeatureCollection",
        features: data.map(([x1, y1, x2, y2]) => bboxPolygon([x1, y1, x2, y2]))
      };
    }
  }, [collection]);

  // Fit the map view around the current collection extent
  useEffect(() => {
    if (collection && map) {
      let [x1, y1, x2, y2] = collection.extent.spatial.bbox[0];
      const bounds = new LngLatBounds([x1, y1, x2, y2]);
      for(let i = 1, len = collection.extent.spatial.bbox.length; i < len; i++) {
        [x1, y1, x2, y2] = collection.extent.spatial.bbox[i];
        bounds.extend([x1, y1, x2, y2] );
      }
      [x1, y1, x2, y2] = bounds.toArray().flat();
      map.fitBounds([x1, y1, x2, y2], { padding: 30, duration: 0 });
    }
  }, [collection, map]);

  return (
    <Map ref={setMapRef} dragPan={false} scrollZoom={false} cursor="default">
      <BackgroundTiles />
      { extent && (
        <Source
          id="extent"
          type="geojson"
          data={extent}
        >
          <Layer id="extent-line" type="line" paint={extentOutline} />
        </Source>
      ) }
      { dataExtents && (
        <Source
          id="data-extent"
          type="geojson"
          data={dataExtents}
        >
          <Layer id="data-extent-line" type="line" paint={dataOutline} />
        </Source>
      ) }
    </Map>
  );
}

export default CollectionMap;
