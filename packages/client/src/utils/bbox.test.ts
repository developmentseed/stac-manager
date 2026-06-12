/**
 * @jest-environment node
 */
import {
  inspectBbox,
  summarizeBboxIssues,
  COORD_REQUIRED_MSG,
  LON_RANGE_MSG,
  LAT_RANGE_MSG,
  LAT_ORDER_MSG,
  LAT_ZERO_MSG,
  LON_ZERO_MSG,
  MIN_LON,
  MIN_LAT,
  MAX_LON,
  MAX_LAT
} from './bbox';

const messages = (bbox: unknown) => inspectBbox(bbox).map((i) => i.message);

describe('inspectBbox', () => {
  it('accepts a normal bbox', () => {
    expect(inspectBbox([-10, -5, 20, 15])).toEqual([]);
  });

  it('accepts a global bbox touching the poles', () => {
    expect(inspectBbox([-180, -90, 180, 90])).toEqual([]);
  });

  it('accepts an antimeridian-crossing bbox (minLon > maxLon)', () => {
    expect(inspectBbox([170, -10, -170, 10])).toEqual([]);
  });

  it('flags the degenerate pole point [-90, 90, -90, 90]', () => {
    // Zero width (lon min === max) and zero height (lat min === max).
    expect(messages([-90, 90, -90, 90])).toEqual(
      expect.arrayContaining([LON_ZERO_MSG, LAT_ZERO_MSG])
    );
  });

  it('flags out-of-range longitude and latitude on the right corner', () => {
    expect(inspectBbox([-200, -5, 20, 95])).toEqual(
      expect.arrayContaining([
        { index: MIN_LON, message: LON_RANGE_MSG },
        { index: MAX_LAT, message: LAT_RANGE_MSG }
      ])
    );
  });

  it('flags reversed latitude (south > north)', () => {
    expect(inspectBbox([-10, 20, 10, -20])).toEqual([
      { index: MAX_LAT, message: LAT_ORDER_MSG }
    ]);
  });

  it('flags non-numeric / missing corners', () => {
    expect(inspectBbox([-10, null, 'x', 15])).toEqual(
      expect.arrayContaining([
        { index: MIN_LAT, message: COORD_REQUIRED_MSG },
        { index: MAX_LON, message: COORD_REQUIRED_MSG }
      ])
    );
  });

  it('does not add ordering/zero errors when a corner is out of range', () => {
    // maxLat out of range — we should not also claim zero-height/ordering.
    const msgs = messages([0, 0, 10, 200]);
    expect(msgs).toContain(LAT_RANGE_MSG);
    expect(msgs).not.toContain(LAT_ZERO_MSG);
    expect(msgs).not.toContain(LAT_ORDER_MSG);
  });

  it('reads horizontal corners out of a 3D (6-value) bbox', () => {
    // [minLon, minLat, minElev, maxLon, maxLat, maxElev]
    expect(inspectBbox([-10, -5, 0, 20, 15, 100])).toEqual([]);
    expect(messages([-10, 20, 0, 10, -20, 100])).toEqual([LAT_ORDER_MSG]);
  });

  it('ignores arrays that are not a 2D or 3D bbox', () => {
    expect(inspectBbox([1, 2, 3])).toEqual([]);
    expect(inspectBbox('nope')).toEqual([]);
  });

  it('coerces numeric strings (form inputs arrive as strings)', () => {
    expect(inspectBbox(['-10', '-5', '20', '15'])).toEqual([]);
    expect(messages(['-10', '5', '20', '5'])).toEqual([LAT_ZERO_MSG]);
  });
});

describe('summarizeBboxIssues', () => {
  it('returns distinct messages across all bboxes', () => {
    const issues = summarizeBboxIssues([
      [-10, -5, 20, 15], // fine
      [-90, 90, -90, 90], // zero width + zero height
      [0, 0, 10, 200] // lat range
    ]);
    expect(issues.sort()).toEqual(
      [LON_ZERO_MSG, LAT_ZERO_MSG, LAT_RANGE_MSG].sort()
    );
  });

  it('returns [] for a missing/!array extent', () => {
    expect(summarizeBboxIssues(undefined)).toEqual([]);
  });
});
