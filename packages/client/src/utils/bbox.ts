// Shared validation for STAC spatial-extent bboxes, used both when creating a
// collection (to block submit) and when viewing one (to warn). A STAC 2D bbox
// is [minLon, minLat, maxLon, maxLat]; the 3D form inserts elevation as
// [minLon, minLat, minElev, maxLon, maxLat, maxElev], so we read the
// horizontal corners out of either shape before checking them.

export const COORD_REQUIRED_MSG = 'Must be a valid number';
export const LON_RANGE_MSG = 'Longitude must be between -180 and 180';
export const LAT_RANGE_MSG = 'Latitude must be between -90 and 90';
export const LAT_ORDER_MSG = 'Max latitude must be greater than min latitude';
export const LAT_ZERO_MSG =
  'Min and max latitude are equal — the extent has zero height';
export const LON_ZERO_MSG =
  'Min and max longitude are equal — the extent has zero width';

// Index of a coordinate within the 4-value horizontal bbox.
export const MIN_LON = 0;
export const MIN_LAT = 1;
export const MAX_LON = 2;
export const MAX_LAT = 3;

export interface BboxIssue {
  // Position in the horizontal [minLon, minLat, maxLon, maxLat] tuple the issue
  // attaches to — used to key inline form errors.
  index: number;
  message: string;
}

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
};

const isFiniteNum = (n: number): boolean => Number.isFinite(n);

// Pull the four horizontal corners out of a 2D ([4]) or 3D ([6]) bbox. Returns
// null when the array isn't one of those shapes.
function horizontalCorners(
  bbox: unknown
): [unknown, unknown, unknown, unknown] | null {
  if (!Array.isArray(bbox)) return null;
  if (bbox.length === 4) return [bbox[0], bbox[1], bbox[2], bbox[3]];
  if (bbox.length === 6) return [bbox[0], bbox[1], bbox[3], bbox[4]];
  return null;
}

/**
 * Inspects a single bbox and returns the problems found, each tagged with the
 * coordinate index it relates to. Rules:
 *  - every horizontal corner must be a finite number;
 *  - longitudes in [-180, 180], latitudes in [-90, 90];
 *  - min latitude must be below max latitude (south < north);
 *  - the extent must have area — identical min/max on either axis is rejected
 *    (this catches degenerate boxes like [-90, 90, -90, 90]).
 * West < East is intentionally NOT required: a bbox may cross the antimeridian
 * with minLon > maxLon. Only an exact min === max longitude is degenerate.
 */
export function inspectBbox(bbox: unknown): BboxIssue[] {
  const corners = horizontalCorners(bbox);
  if (!corners) return [];

  const [minLon, minLat, maxLon, maxLat] = corners.map(toNumber);
  const issues: BboxIssue[] = [];

  const checkFinite = (value: number, index: number) => {
    if (!isFiniteNum(value)) {
      issues.push({ index, message: COORD_REQUIRED_MSG });
      return false;
    }
    return true;
  };

  const minLonOk = checkFinite(minLon, MIN_LON);
  const minLatOk = checkFinite(minLat, MIN_LAT);
  const maxLonOk = checkFinite(maxLon, MAX_LON);
  const maxLatOk = checkFinite(maxLat, MAX_LAT);

  let lonRangeOk = minLonOk && maxLonOk;
  let latRangeOk = minLatOk && maxLatOk;

  if (minLonOk && (minLon < -180 || minLon > 180)) {
    issues.push({ index: MIN_LON, message: LON_RANGE_MSG });
    lonRangeOk = false;
  }
  if (maxLonOk && (maxLon < -180 || maxLon > 180)) {
    issues.push({ index: MAX_LON, message: LON_RANGE_MSG });
    lonRangeOk = false;
  }
  if (minLatOk && (minLat < -90 || minLat > 90)) {
    issues.push({ index: MIN_LAT, message: LAT_RANGE_MSG });
    latRangeOk = false;
  }
  if (maxLatOk && (maxLat < -90 || maxLat > 90)) {
    issues.push({ index: MAX_LAT, message: LAT_RANGE_MSG });
    latRangeOk = false;
  }

  // Ordering / zero-area only make sense once the corners are valid numbers in
  // range; otherwise the range errors above already point at the real problem.
  if (latRangeOk) {
    if (minLat > maxLat)
      issues.push({ index: MAX_LAT, message: LAT_ORDER_MSG });
    else if (minLat === maxLat)
      issues.push({ index: MAX_LAT, message: LAT_ZERO_MSG });
  }
  if (lonRangeOk && minLon === maxLon) {
    issues.push({ index: MAX_LON, message: LON_ZERO_MSG });
  }

  return issues;
}

/**
 * Collects the distinct human-readable problems across every bbox in a spatial
 * extent. Handy for a single summary warning when viewing a collection.
 */
export function summarizeBboxIssues(bboxes: unknown): string[] {
  if (!Array.isArray(bboxes)) return [];
  const messages = new Set<string>();
  bboxes.forEach((bbox) =>
    inspectBbox(bbox).forEach((issue) => messages.add(issue.message))
  );
  return Array.from(messages);
}
