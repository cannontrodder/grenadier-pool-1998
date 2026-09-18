import { DEFAULT_SCENARIO } from './model.mjs';

// Versioned arrangements: changes to coordinates require a new fixture version.
const layout = (id, name, coordinates) => Object.freeze({ id, name, version: 1,
  balls: Object.freeze(coordinates.map(([x, y], index) => Object.freeze({
    id: index === 0 ? 'cue' : `object-${index}`, role: index === 0 ? 'cue' : 'object', x, y,
  }))),
});
export const PRACTICE_LAYOUTS = Object.freeze([
  Object.freeze({ ...DEFAULT_SCENARIO, name: 'Straight pots' }),
  layout('cut-pots', 'Cut pots', [[500, 320], [550, 180], [120, 76.8], [880, 417.14]]),
  layout('cushion-practice', 'Cushion practice', [[680, 308], [650, 160], [120, 76.8], [880, 417.14]]),
]);
