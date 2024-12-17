import { useCallback, useEffect, useRef } from "react";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import StaticMode from "@mapbox/mapbox-gl-draw-static-mode";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";
import { GeoJSONFeature, GeoJSONPolygon } from "stac-ts/src/types/geojson";
import { Map } from "maplibre-gl";

const addDrawControl = (map: Map, drawingCompleted: (f: GeoJSONFeature) => void) => {
  const { modes } = MapboxDraw;

  const options = {
    modes: {
      ...modes,
      draw_rectangle: DrawRectangle,
      static: StaticMode
    },
    boxSelect: false,
    displayControlsDefault: false,
  };
  const draw = new MapboxDraw(options) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  map.addControl(draw);
  map.on("draw.create", (e) => {
    const { features } = e;
    const feature = features[0];
    map.getCanvas().style.cursor = "";
    setTimeout(() => draw.changeMode("static"), 0);
    drawingCompleted(feature);
  });
  return draw;
};

type DrawBboxControlProps = {
  handleDrawComplete: (bbox: number[]) => void;
  isEnabled: boolean;
  bbox?: number[]
  map: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

function DrawBboxControl({ map, handleDrawComplete, isEnabled, bbox }: DrawBboxControlProps) {
  const drawControlRef = useRef<MapboxDraw>();

  // Callback when drawing is finished. Receives a feature and returns
  // its bounding box. With this control users can only draw squares
  // so the simple method is sufficient. 
  const handleDraw = useCallback((feature: GeoJSONFeature) => {
    const { coordinates } = feature.geometry as GeoJSONPolygon;
    const bbox = [...coordinates[0][0], ...coordinates[0][2]];
    handleDrawComplete(bbox);
  }, [handleDrawComplete]);

  useEffect(() => {
    if (map && !drawControlRef.current) {
      drawControlRef.current = addDrawControl(map, handleDraw);
    }
  }, [map, handleDraw]);

  useEffect(() => {
    if (isEnabled && drawControlRef.current) {
      drawControlRef.current.deleteAll();
      drawControlRef.current.changeMode("draw_rectangle");
      map.getCanvas().style.cursor = "crosshair";
    }
  }, [isEnabled, map]);

  useEffect(() => {
    if (!bbox && drawControlRef.current) {
      drawControlRef.current.deleteAll();
    }
  }, [bbox]);

  return null;
}

export default DrawBboxControl;
