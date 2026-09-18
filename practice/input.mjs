// Gesture distances are CSS pixels; world scaling never changes pull travel.
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function pullAt(radius, startRadius) {
  const pull = clamp((radius - startRadius - 12) / 115, 0, 1);
  return { pull, power: pull * pull, armed: pull >= 0.06 - 1e-12 };
}

export function createGesture() {
  let active = null;
  return {
    begin(pointerId, startRadius, epoch, { lockAim = false, lockDistance = 60, angle = 0 } = {}) {
      if (active) return false;
      active = { pointerId, startRadius, epoch, active: true, angle, lockAim, lockDistance: Number.isFinite(lockDistance) ? clamp(lockDistance, 20, 100) : 60, lockPointerId: null, nearLocked: false, locked: false, ...pullAt(startRadius, startRadius) };
      return true;
    },
    move(pointerId, radius, angle) {
      if (active?.pointerId !== pointerId) return false;
      active.nearLocked = active.lockAim && radius <= active.lockDistance;
      active.locked = active.nearLocked || active.lockPointerId !== null;
      if (!active.locked) active.angle = angle;
      Object.assign(active, pullAt(radius, active.startRadius));
      return true;
    },
    hold(pointerId) {
      if (!active || pointerId === active.pointerId || active.lockPointerId !== null) return false;
      active.lockPointerId = pointerId; active.locked = true;
      return true;
    },
    unhold(pointerId) {
      if (!active || active.lockPointerId !== pointerId) return false;
      active.lockPointerId = null; active.locked = active.nearLocked;
      return true;
    },
    release(pointerId, epoch) {
      if (active?.pointerId !== pointerId) return null;
      const shot = active.armed && active.epoch === epoch ? { angle: active.angle, power: active.power, epoch } : null;
      active = null;
      return shot;
    },
    cancel() { active = null; },
    snapshot() { return active ? Object.freeze({ ...active }) : null; },
  };
}
