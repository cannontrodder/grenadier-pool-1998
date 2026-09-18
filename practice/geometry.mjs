/** Single source of truth for simulation and SVG. Units are world units. */
export const POCKET_SCALE = Object.freeze({ min: 0.9, max: 1.3, default: 1 });

/** Widen real apertures and move their jaws together; never attract a nearby ball. */
export function createTable(pocketScale = POCKET_SCALE.default) {
  const scale = Number.isFinite(pocketScale)
    ? Math.max(POCKET_SCALE.min, Math.min(POCKET_SCALE.max, pocketScale)) : POCKET_SCALE.default;
  const cornerOpening = 42 * scale;
  const sideOpening = 34 * scale;
  const jawRadius = 6;
  const c = cornerOpening, s = sideOpening;
  const rails = [
    ['top-left', c, 0, 500 - s, 0], ['top-right', 500 + s, 0, 1000 - c, 0],
    ['bottom-left', c, 500, 500 - s, 500], ['bottom-right', 500 + s, 500, 1000 - c, 500],
    ['left', 0, c, 0, 500 - c], ['right', 1000, c, 1000, 500 - c],
  ].map(([id, x1, y1, x2, y2]) => Object.freeze({ id, x1, y1, x2, y2 }));
  const jaws = rails.flatMap(rail => [
    { id: `${rail.id}-a`, x: rail.x1, y: rail.y1, r: jawRadius },
    { id: `${rail.id}-b`, x: rail.x2, y: rail.y2, r: jawRadius },
  ]).map(Object.freeze);
  const diagonal = Math.SQRT1_2;
  function pocket(id, x, y, mx, my, nx, ny, halfWidth, captureDepth) {
    return Object.freeze({ id, x, y, r: 30 * scale,
      mouth: Object.freeze({ x: mx, y: my, nx, ny, tx: -ny, ty: nx, halfWidth }),
      captureDepth,
    });
  }
  const m = c / 2;
  const pockets = [
    pocket('top-left', 0, 0, m, m, -diagonal, -diagonal, 30 * scale, 20 * scale),
    pocket('top-middle', 500, -12, 500, 0, 0, -1, s, 14),
    pocket('top-right', 1000, 0, 1000 - m, m, diagonal, -diagonal, 30 * scale, 20 * scale),
    pocket('bottom-left', 0, 500, m, 500 - m, -diagonal, diagonal, 30 * scale, 20 * scale),
    pocket('bottom-middle', 500, 512, 500, 500, 0, 1, s, 14),
    pocket('bottom-right', 1000, 500, 1000 - m, 500 - m, diagonal, diagonal, 30 * scale, 20 * scale),
  ];
  return Object.freeze({ width: 1000, height: 500, ballRadius: 12, pocketScale: scale,
    cornerOpening, sideOpening, jawRadius,
    rails: Object.freeze(rails), jaws: Object.freeze(jaws), pockets: Object.freeze(pockets),
  });
}

export const TABLE = createTable();

export function nearestOnRail(x, y, rail) {
  const dx = rail.x2 - rail.x1, dy = rail.y2 - rail.y1;
  const t = Math.max(0, Math.min(1, ((x - rail.x1) * dx + (y - rail.y1) * dy) / (dx * dx + dy * dy)));
  return { x: rail.x1 + t * dx, y: rail.y1 + t * dy };
}

export function pocketCoordinates(x, y, pocket) {
  const dx = x - pocket.mouth.x, dy = y - pocket.mouth.y;
  return { depth: dx * pocket.mouth.nx + dy * pocket.mouth.ny,
    lateral: dx * pocket.mouth.tx + dy * pocket.mouth.ty };
}
