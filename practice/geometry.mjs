/** Single source of truth for simulation and SVG. Units are world units. */
const cornerOpening = 42;
const sideOpening = 34;
const jawRadius = 6;
const rails = [
  ['top-left', 42, 0, 466, 0], ['top-right', 534, 0, 958, 0],
  ['bottom-left', 42, 500, 466, 500], ['bottom-right', 534, 500, 958, 500],
  ['left', 0, 42, 0, 458], ['right', 1000, 42, 1000, 458],
].map(([id, x1, y1, x2, y2]) => Object.freeze({ id, x1, y1, x2, y2 }));
const jaws = rails.flatMap(rail => [
  { id: `${rail.id}-a`, x: rail.x1, y: rail.y1, r: jawRadius },
  { id: `${rail.id}-b`, x: rail.x2, y: rail.y2, r: jawRadius },
]).map(Object.freeze);
const diagonal = Math.SQRT1_2;
function pocket(id, x, y, mx, my, nx, ny, halfWidth, captureDepth) {
  return Object.freeze({ id, x, y, r: 30,
    mouth: Object.freeze({ x: mx, y: my, nx, ny, tx: -ny, ty: nx, halfWidth }),
    captureDepth,
  });
}
const pockets = [
  pocket('top-left', 0, 0, 21, 21, -diagonal, -diagonal, 30, 20),
  pocket('top-middle', 500, -12, 500, 0, 0, -1, 34, 14),
  pocket('top-right', 1000, 0, 979, 21, diagonal, -diagonal, 30, 20),
  pocket('bottom-left', 0, 500, 21, 479, -diagonal, diagonal, 30, 20),
  pocket('bottom-middle', 500, 512, 500, 500, 0, 1, 34, 14),
  pocket('bottom-right', 1000, 500, 979, 479, diagonal, diagonal, 30, 20),
];
export const TABLE = Object.freeze({ width: 1000, height: 500, ballRadius: 12,
  cornerOpening, sideOpening, jawRadius,
  rails: Object.freeze(rails), jaws: Object.freeze(jaws), pockets: Object.freeze(pockets),
});

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
