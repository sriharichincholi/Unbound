import * as THREE from 'three';
import { useGame } from '../managers/store';
import { bark } from '../managers/Barks';
import { hitSfx } from '../managers/audio';

export interface Enemy {
  id: number; kind: 'shark' | 'alpha'; pos: THREE.Vector3; dir: THREE.Vector3; from: THREE.Vector3; to: THREE.Vector3;
  hp: number; maxHp: number; hitFlash: number; vulnerable: boolean; silent: boolean;
  state: 'circle' | 'warn' | 'leap' | 'landed' | 'retreat' | 'dead';
  t: number; dur: number; stay: number; bite: number; angle: number; scale: number; mat: THREE.MeshStandardMaterial | null;
}
export const enemies: Enemy[] = [];
export const playerState = { pos: new THREE.Vector3(), face: new THREE.Vector3(0, 0, 1), invuln: false };

/** Arc hitbox: hits vulnerable enemies within `range` and within `arcCos` of `facing` (arcCos -1 = full circle). */
export function strike(origin: THREE.Vector3, facing: THREE.Vector3, range: number, arcCos: number, dmg: number): number {
  let hits = 0;
  for (const e of enemies) {
    if (e.hp <= 0 || !e.vulnerable) continue;
    const to = e.pos.clone().sub(origin); to.y = 0;
    const dist = to.length(); if (dist > range + e.scale * 0.6) continue;
    if (arcCos > -1 && dist > 0.001 && to.normalize().dot(facing) < arcCos) continue;
    e.hp = Math.max(0, e.hp - dmg); e.hitFlash = 1; hits++;
  }
  if (hits) hitSfx();
  return hits;
}
export function hurtPlayer(n: number) {
  if (playerState.invuln) return;
  const g = useGame.getState(); if (g.hp <= 0) return;
  const hp = Math.max(0, g.hp - n); g.set({ hp });
  if (n >= 14 && hp > 0) bark('lowHealth'); // heavy damage -> "You're hurt. Fall back!"
  else if (hp < 35 && hp > 0) bark('lowHealth');
}
export function clampToScene(v: THREE.Vector3, scene: 'ship' | 'shore') {
  if (scene === 'ship') { v.x = THREE.MathUtils.clamp(v.x, -3.5, 3.5); v.z = THREE.MathUtils.clamp(v.z, -11, 12); }
  else { v.x = THREE.MathUtils.clamp(v.x, -40, 40); v.z = THREE.MathUtils.clamp(v.z, -45, 19); }
}
