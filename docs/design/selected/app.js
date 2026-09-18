const scenes = {
  g01: ['G01', 'Ready state. The table owns the viewport; score and turn captions sit on the rails, away from the shot line.'],
  s01: ['S01', 'Expanded cue-contact selector. Spin is set before aiming, away from the shot drag, then collapses to a small locked status cue.'],
  g02: ['G02', 'Candidate aim state. One finger stays down behind the cue ball; chrome fades and the abort route remains readable.'],
  g03: ['G03', 'Candidate armed state. Drag distance is illustrated as power, but remains a touch-study hypothesis.'],
  g04: ['G04', 'Committed state. Input is locked while balls move and a compact broadcast caption reports the result.'],
  o02: ['O02', 'Persona broadcast card using the supplied group photo and left-to-right names without invented traits.'],
  e01: ['E01', 'Resume the one saved live match. It may last a long time, but no concurrent match inbox is shown.'],
  g05: ['G05', 'Optional between-shot pub cutaway. This original SVG follows the supplied spatial description but is not a measured or faithful Grenadier model.'],
  z01: ['Z01', 'Postgame knockabout variant. The result stays final; either player may choose any remaining struck ball, while Re-rack starts fresh.']
};

const sizes = {
  portrait: ['portrait', 390, 844],
  landscape: ['landscape', 844, 390],
  compact: ['compact', 320, 568]
};

const body = document.body;
const device = document.querySelector('#device');
const code = document.querySelector('#scene-code');
const description = document.querySelector('#scene-description');

function setScene(scene) {
  if (!scenes[scene]) return;
  body.dataset.scene = scene;
  code.textContent = scenes[scene][0];
  description.textContent = scenes[scene][1];
  document.querySelectorAll('[data-scene-button]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.sceneButton === scene);
    button.setAttribute('aria-pressed', button.dataset.sceneButton === scene);
  });
}

function setSize(size) {
  if (!sizes[size]) return;
  device.className = `device ${sizes[size][0]}`;
  device.style.setProperty('--device-width', `${sizes[size][1]}px`);
  device.style.setProperty('--device-height', `${sizes[size][2]}px`);
  document.querySelectorAll('[data-size]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.size === size);
    button.setAttribute('aria-pressed', button.dataset.size === size);
  });
}

document.querySelectorAll('[data-scene-button]').forEach(button => button.addEventListener('click', () => setScene(button.dataset.sceneButton)));
document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => setSize(button.dataset.size)));

const params = new URLSearchParams(location.search);
setScene(params.get('scene') || 'g01');
setSize(params.get('size') || 'portrait');
if (params.get('present') === '1') body.classList.add('presentation');

window.addEventListener('pointercancel', () => {
  if (body.dataset.scene === 'g02' || body.dataset.scene === 'g03') setScene('g01');
});
