import { StacAsset, StacExtensions, StacLink, StacProvider, StacVersion } from "stac-ts";
import { GeoJSONGeometryCollection,
  GeoJSONLineString,
  GeoJSONMultiLineString,
  GeoJSONMultiPoint,
  GeoJSONMultiPolygon,
  GeoJSONPoint,
  GeoJSONPolygon
} from "stac-ts/src/types/geojson";

export type FormValues = {
  id: string;
  type: "Feature";
  stac_version: StacVersion;
  stac_extensions?: StacExtensions;
  collection?: string;
  links: StacLink[];
  assets: { [k: string]: StacAsset };
  geometry:
  | null
  | GeoJSONPoint
  | GeoJSONLineString
  | GeoJSONPolygon
  | GeoJSONMultiPoint
  | GeoJSONMultiLineString
  | GeoJSONMultiPolygon
  | GeoJSONGeometryCollection;
  bbox?: number[];
  properties: {
    title: string;
    description: string;
    license: string;
    providers: StacProvider[];
    platform: string;
    constellation: string;
    mission: string;
    gsd: number;
    instrument: string[];
    datetime: string | null;
    start_datetime?: string;
    end_datetime?: string;
  }
}
