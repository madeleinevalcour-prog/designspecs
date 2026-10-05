// Spot geometry for the Sophia FAB — ported from the prototype's sophia-fab.ts.
// Pure functions: everything is in container (stage) px, measured by the component.

export type SophiaFabPlacement = 'A' | 'B' | 'C';
export type SophiaFabSpot =
  | 'left-top' | 'left-bottom'
  | 'edge-top' | 'edge-bottom'
  | 'bottom-center' | 'right-middle' | 'right-bottom';

/** An occupied vertical range inside the bowling alley (container px), e.g. the nav, open tabs, bowling alley foot. */
export interface SophiaFabZone { top: number; bottom: number; }
/** Where the FAB settled: its spot plus its center point in container px. */
export interface SophiaFabPosition { spot: SophiaFabSpot; x: number; y: number; }

export interface SophiaFabPt { x: number; y: number; }

export const SOPHIA_FAB_GUTTER = 16;   // option A: clearance from bowling alley zones (spacing scale)
export const SOPHIA_FAB_EDGE = 24;     // screen-edge offset
export const SOPHIA_FAB_PARK_GAP = 8;  // option C: gap between the bowling alley edge and the FAB
export const SOPHIA_FAB_DRAG_THRESHOLD = 4; // px of movement before a press becomes a drag

/** Spots per placement option, and the spot each falls back to. */
export const SOPHIA_FAB_OPTIONS: Record<SophiaFabPlacement, { spots: SophiaFabSpot[]; fallback: SophiaFabSpot; size: number }> = {
  A: { spots: ['left-top', 'left-bottom', 'bottom-center', 'right-middle', 'right-bottom'], fallback: 'left-bottom', size: 32 },
  B: { spots: ['bottom-center', 'right-middle', 'right-bottom'], fallback: 'right-bottom', size: 56 },
  C: { spots: ['edge-top', 'edge-bottom', 'bottom-center', 'right-middle', 'right-bottom'], fallback: 'edge-bottom', size: 56 },
};

export interface SophiaFabBowlingAlley {
  /** Bowling alley’s left offset in the container. */
  left: number;
  /** Rendered bowling alley width (option A follows it, including a hover-peek). */
  width: number;
  /** Committed bowling alley width (option C follows it; ignores hover-peek). */
  committedWidth: number;
  /** Occupied zones in the bowling alley (option A docks in the gaps between them). */
  zones: SophiaFabZone[];
}

/** Free vertical ranges for the FAB center along the bowling alley (container height = bowling alley height). */
function freeRanges(size: number, height: number, zones: SophiaFabZone[]): [number, number][] {
  const lo = SOPHIA_FAB_GUTTER, hi = height - SOPHIA_FAB_GUTTER;
  const ranges: [number, number][] = [];
  let cursor = lo;
  for (const z of [...zones].sort((a, b) => a.top - b.top)) {
    const gapEnd = z.top - SOPHIA_FAB_GUTTER;
    if (gapEnd - cursor >= size) ranges.push([cursor + size / 2, gapEnd - size / 2]);
    cursor = Math.max(cursor, z.bottom + SOPHIA_FAB_GUTTER);
  }
  if (hi - cursor >= size) ranges.push([cursor + size / 2, hi - size / 2]);
  return ranges;
}

function nearestFree(target: number, ranges: [number, number][]): number {
  let best = target, bestD = Infinity;
  for (const [a, b] of ranges) {
    const y = Math.min(Math.max(target, a), b);
    const d = Math.abs(y - target);
    if (d < bestD) { bestD = d; best = y; }
  }
  return best;
}

/** Center point of every spot of a placement option, for a container of `w` × `h`. */
export function sophiaFabSpotCenters(
  placement: SophiaFabPlacement, w: number, h: number, bowlingAlley: SophiaFabBowlingAlley,
): Partial<Record<SophiaFabSpot, SophiaFabPt>> {
  const size = SOPHIA_FAB_OPTIONS[placement].size;
  const half = size / 2;
  const right = w - SOPHIA_FAB_EDGE - half, bottom = h - SOPHIA_FAB_EDGE - half;
  const screen = {
    'bottom-center': { x: w / 2, y: bottom },
    'right-middle': { x: right, y: h / 2 },
    'right-bottom': { x: right, y: bottom },
  };
  if (placement === 'B') return screen;
  if (placement === 'C') {
    const edgeX = bowlingAlley.left + bowlingAlley.committedWidth + SOPHIA_FAB_PARK_GAP + half;
    return { 'edge-top': { x: edgeX, y: h / 2 }, 'edge-bottom': { x: edgeX, y: bottom }, ...screen };
  }
  const ranges = freeRanges(size, h, bowlingAlley.zones);
  const bowlingAlleyX = bowlingAlley.left + bowlingAlley.width / 2;
  return {
    'left-top': { x: bowlingAlleyX, y: nearestFree(0, ranges) },
    'left-bottom': { x: bowlingAlleyX, y: nearestFree(h, ranges) },
    ...screen,
  };
}

export function sophiaFabNearestSpot(p: SophiaFabPt, centers: Partial<Record<SophiaFabSpot, SophiaFabPt>>): SophiaFabSpot {
  const keys = Object.keys(centers) as SophiaFabSpot[];
  return keys.reduce((best, sp) =>
    Math.hypot(centers[sp]!.x - p.x, centers[sp]!.y - p.y) < Math.hypot(centers[best]!.x - p.x, centers[best]!.y - p.y) ? sp : best);
}
