/** Session-only controls. Distances for input are CSS pixels, independent of zoom. */
export const TUNING = Object.freeze({
  strength: Object.freeze({ min: 0.5, max: 3, step: 0.1, default: 1.8 }),
  guideLength: Object.freeze({ min: 10, max: 100, step: 5, default: 60 }),
  lockDistance: Object.freeze({ min: 20, max: 100, step: 1, default: 60 }),
  pocketSize: Object.freeze({ min: 90, max: 130, step: 5, default: 110 }),
});
export const DEFAULT_TUNING = Object.freeze({
  ...Object.fromEntries(Object.entries(TUNING).map(([key, spec]) => [key, spec.default])),
  lockAim: false, contactMarker: true,
});
export function boundedSetting(key, value) {
  const spec = TUNING[key];
  return Number.isFinite(value) ? Math.max(spec.min, Math.min(spec.max, value)) : spec.default;
}
