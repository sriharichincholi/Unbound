import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HERO_LIST, type HeroId } from './heroes';
import Character, { newMotion } from './Character';
import { enemies, playerState, clampToScene } from './combat';
import { fx } from './fx';
import { useGame } from '../managers/store';

const STAND_X = [-2.6, -1.3, 1.3, 2.6];
const OFFS: [number, number][] = [[-2, -2], [2, -2], [-3.2, -3.8], [3.2, -3.8]];
const lerpAngle = (a: number, b: number, t: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;

/** The four permanent companions: stand together on deck for cutscenes, otherwise follow and fight beside the player. */
export default function Companions() {
  const hero = useGame((s) => s.hero), scene = useGame((s) => s.scene);
  return <>{HERO_LIST.map((h) => h.id).filter((i) => i !== hero).map((id, idx) => <Companion key={id} id={id} idx={idx} scene={scene} />)}</>;
}

function Companion({ id, idx, scene }: { id: HeroId; idx: number; scene: 'ship' | 'shore' }) {
  const g = useRef<THREE.Group>(null!);
  const motion = useRef(newMotion()).current;
  const pos = useRef(new THREE.Vector3());
  const init = useRef(false), atk = useRef(1 + idx * 0.35), yaw = useRef(0);

  useFrame((_, dt0) => {
    if (useGame.getState().paused) return;
    const dt = Math.min(dt0, 0.05);
    if (!init.current) {
      init.current = true;
      if (scene === 'ship') pos.current.set(STAND_X[idx], 0, 6.5); else pos.current.set(playerState.pos.x + OFFS[idx][0], 0, playerState.pos.z + 2 + idx);
      yaw.current = scene === 'ship' ? 0 : Math.PI;
    }
    const p = pos.current, target = new THREE.Vector3();
    let foe = null as (typeof enemies)[number] | null, faceTo: THREE.Vector3 | null = null;
    if (fx.formation === 'stand' && scene === 'ship') { target.set(STAND_X[idx], 0, 6.5); faceTo = new THREE.Vector3(p.x, 0, p.z + 5); }
    else {
      let best = 9;
      for (const e of enemies) { if (!e.vulnerable || e.hp <= 0) continue; const d = Math.hypot(e.pos.x - p.x, e.pos.z - p.z); if (d < best) { best = d; foe = e; } }
      if (foe) {
        const away = new THREE.Vector3(p.x - foe.pos.x, 0, p.z - foe.pos.z); if (away.lengthSq() < 1e-6) away.set(1, 0, 0);
        away.normalize().multiplyScalar(1.5 + foe.scale * 0.8); target.set(foe.pos.x + away.x, 0, foe.pos.z + away.z); faceTo = foe.pos;
      } else {
        const psi = Math.atan2(playerState.face.x, playerState.face.z), [ox, oz] = OFFS[idx];
        target.set(playerState.pos.x + ox * Math.cos(psi) + oz * Math.sin(psi), 0, playerState.pos.z - ox * Math.sin(psi) + oz * Math.cos(psi));
      }
    }
    clampToScene(target, scene);
    const dx = target.x - p.x, dz = target.z - p.z, dist = Math.hypot(dx, dz);
    const sp = dist > 0.15 ? Math.min(dist * 3, 6.5) : 0;
    if (sp > 0) { p.x += (dx / dist) * sp * dt; p.z += (dz / dist) * sp * dt; }
    clampToScene(p, scene);
    motion.speed = sp;
    let want = yaw.current;
    if (sp > 1) want = Math.atan2(dx, dz); else if (faceTo) want = Math.atan2(faceTo.x - p.x, faceTo.z - p.z); else want = Math.atan2(playerState.face.x, playerState.face.z);
    yaw.current = lerpAngle(yaw.current, want, Math.min(1, dt * 8));
    motion.swing = Math.max(0, motion.swing - dt * 5);
    atk.current -= dt;
    if (foe && atk.current <= 0 && Math.hypot(foe.pos.x - p.x, foe.pos.z - p.z) < 3.6 + foe.scale) {
      atk.current = 1.3 + Math.random() * 0.4; motion.swing = 1;
      foe.hp = Math.max(0, foe.hp - (foe.kind === 'alpha' ? 3.5 : 4)); foe.hitFlash = 1;
    }
    g.current.position.copy(p); g.current.rotation.y = yaw.current;
  });
  return <group ref={g}><Character id={id} motion={motion} /></group>;
}
