// Web Mercator can't represent the poles — latitude projects to infinity at
// ±90°, which yields NaN map coordinates and out-of-range tile requests (e.g.
// .../22/1048576/0.png) that crash the map. Clamp to the standard Mercator
// limit and keep lon/lat finite and in range before handing corners to maplibre.
export const MERCATOR_MAX_LAT = 85.0511287798066;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Returns a [west, south, east, north] tuple safe for LngLatBounds/fitBounds,
 * or null when the corners aren't a usable set of finite numbers. Longitudes
 * are clamped to ±180 and latitudes to the Web Mercator limit so a degenerate
 * or pole-adjacent extent can't produce an invalid map view.
 */
export function sanitizeBbox(
  bbox: number[]
): [number, number, number, number] | null {
  const [x1, y1, x2, y2] = bbox;
  if (![x1, y1, x2, y2].every((n) => Number.isFinite(n))) return null;
  return [
    clamp(x1, -180, 180),
    clamp(y1, -MERCATOR_MAX_LAT, MERCATOR_MAX_LAT),
    clamp(x2, -180, 180),
    clamp(y2, -MERCATOR_MAX_LAT, MERCATOR_MAX_LAT)
  ];
}
