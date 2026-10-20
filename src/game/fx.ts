import * as THREE from 'three';

/** Mutable per-frame state shared by the scene, director and UI (kept out of React state on purpose). */
export const fx = {
  shake: 0, tilt: 0, calm: 0, dawn: 0,
  wave: false, maxActive: 3, alphaGo: false, alphaDead: false, eruptNow: false, kills: 0,
  formation: 'follow' as 'follow' | 'stand',
  cine: { active: false, pos: new THREE.Vector3(), look: new THREE.Vector3() },
  tw: null as null | { fp: THREE.Vector3; tp: THREE.Vector3; fl: THREE.Vector3; tl: THREE.Vector3; t: number; dur: number; res: () => void },
  proT: 0, proPlay: false,
};
export function resetFx() {
  fx.shake = 0; fx.tilt = 0; fx.calm = 0; fx.dawn = 0; fx.wave = false; fx.maxActive = 3; fx.alphaGo = false; fx.alphaDead = false;
  fx.eruptNow = false; fx.kills = 0; fx.formation = 'follow'; fx.cine.active = false; fx.tw = null; fx.proT = 0; fx.proPlay = false;
}
export function setCine(pos: THREE.Vector3, look: THREE.Vector3) {
  fx.tw?.res(); fx.tw = null; fx.cine.active = true; fx.cine.pos.copy(pos); fx.cine.look.copy(look);
}
export function tweenCine(pos: THREE.Vector3, look: THREE.Vector3, dur: number): Promise<void> {
  return new Promise((res) => {
    fx.tw?.res();
    fx.cine.active = true;
    fx.tw = { fp: fx.cine.pos.clone(), tp: pos.clone(), fl: fx.cine.look.clone(), tl: look.clone(), t: 0, dur, res };
  });
}
export function stepCine(dt: number) {
  const w = fx.tw; if (!w) return;
  w.t += dt; const u = Math.min(1, w.t / w.dur), s = u * u * (3 - 2 * u);
  fx.cine.pos.lerpVectors(w.fp, w.tp, s); fx.cine.look.lerpVectors(w.fl, w.tl, s);
  if (u >= 1) { fx.tw = null; w.res(); }
}
