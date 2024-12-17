import { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import Map, {  type MapRef, type MapLayerMouseEvent, Source, Layer } from "react-map-gl/maplibre";
import { StacItem } from "stac-ts";
import getBbox from "@turf/bbox";
import { BackgroundTiles } from "../Map";

type MapViewProps = {
  results?: {
    type: "FeatureCollection";
    features: StacItem[]
  };
  highlightItem?: string;
  setHighlightItem: (id?: string) => void;
  id: string;
  hidden: boolean;
}

const resultsOutline = {
  "line-color": "#C53030",
  "line-width": 1,
};

const resultsFill = {
  "fill-color": "#C53030",
  "fill-opacity": 0.1
};

const resultsHighlight = {
  "fill-color": "#F6E05E",
  "fill-opacity": .7
};

function MapView({ id, hidden, results, highlightItem, setHighlightItem }: MapViewProps) {
  const [ map, setMap ] = useState<MapRef>();
  const setMapRef = (m: MapRef) => setMap(m);
  const highlightFilter = useMemo(() => ["==", ["get", "id"], highlightItem || ""], [highlightItem]);


  // MapLibre doesn't preserve IDs so we're adding the ID
  // to the properties so we can identify the items for user interactions.
  const resultsWithIDs = useMemo(() => {
    if (!results?.features) return null;
    return {
      ...results,
      features: results.features.map(addIdToProperties)
    };
  }, [results]);

  useEffect(() => {
    if (map && !hidden) {
      map.resize();

      const bounds = results?.features.length && getBbox(results);
      if (bounds) {
        const [x1, y1, x2, y2] = bounds;
        map.fitBounds([x1, y1, x2, y2], { padding: 30 });
      }
    }
  }, [hidden, map, results]);


  const handleHover = useCallback((e: MapLayerMouseEvent) => {
    const interactiveItem = e.features && e.features[0];
    if(interactiveItem) {
      setHighlightItem(interactiveItem.properties?.id);
    }
  }, [setHighlightItem]);

  return (
    <Box
      h="calc(100vh - 2.5rem)"
      maxH="650px"
      position="sticky"
      top="4"
      flexBasis="500px"
      id={id}
      hidden={hidden}
    >
      <Map
        ref={setMapRef}
        onMouseMove={handleHover}
        onMouseLeave={() => setHighlightItem()}
        interactiveLayerIds={["results-fill"]}
      >
        <BackgroundTiles />
        { results && (
          <Source
            id="results"
            type="geojson"
            data={resultsWithIDs}
          >
            <Layer id="results-line" type="line" paint={resultsOutline} />
            <Layer id="results-fill" type="fill" paint={resultsFill} />
            <Layer id="results-hover" type="fill" paint={resultsHighlight} filter={highlightFilter as any} />
          </Source>
        )}
      </Map>
    </Box>
  );
}

const addIdToProperties = (feature: StacItem) => {
  if (feature.properties.id) return feature;

  return {
    ...feature,
    properties: {
      ...feature.properties,
      id: feature.id
    }
  };
};

export default MapView;
