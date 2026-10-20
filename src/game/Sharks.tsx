import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { enemies, playerState, hurtPlayer, type Enemy } from './combat';
import { fx } from './fx';
import { useGame } from '../managers/store';
import { bark } from '../managers/Barks';
import { sayLines, Prio } from '../managers/DialogueManager';
import { S1_2_JUMP } from '../story/script';
import { splash, thump } from '../managers/audio';

const RX = 8.5, RZ = 25, WATER_Y = -1.35;
let nid = 100;
const kills: number[] = [];

function make(kind: 'shark' | 'alpha'): Enemy {
  const a = Math.random() * Math.PI * 2, big = kind === 'alpha';
  return {
    id: nid++, kind, pos: new THREE.Vector3(Math.cos(a) * RX, WATER_Y, Math.sin(a) * RZ), dir: new THREE.Vector3(0, 0, 1),
    from: new THREE.Vector3(), to: new THREE.Vector3(), hp: big ? 240 : 40, maxHp: big ? 240 : 40, hitFlash: 0, vulnerable: false, silent: false,
    state: 'circle', t: big ? 1.5 : 1.5 + Math.random() * 3, dur: 1.3, stay: big ? 4.2 : 3.6, bite: 0, angle: a, scale: big ? 2.4 : 1, mat: null,
  };
}
function startLeap(e: Enemy, target: THREE.Vector3, dur: number) {
  e.from.copy(e.pos); e.to.copy(target); e.to.y = 0.45 * e.scale; e.state = 'leap'; e.t = 0; e.dur = dur; splash();
  e.dir.copy(e.to).sub(e.from).setY(0).normalize();
}
function landing(): THREE.Vector3 {
  const p = playerState.pos, near = Math.random() < 0.6;
  const v = near ? new THREE.Vector3(p.x + (Math.random() - 0.5) * 3, 0, p.z + (Math.random() - 0.5) * 3) : new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 16);
  v.x = THREE.MathUtils.clamp(v.x, -3, 3); v.z = THREE.MathUtils.clamp(v.z, -9, 9); return v;
}
export function clearSharks() { for (const e of enemies) if (e.state !== 'dead') { e.hp = 0; e.silent = true; } }

function SharkView({ e, reg }: { e: Enemy; reg: (id: number, g: THREE.Group | null) => void }) {
  const alpha = e.kind === 'alpha';
  const body = alpha ? '#2e3a46' : '#5b6b7a';
  return (
    <group ref={(g) => reg(e.id, g)}>
      <mesh castShadow scale={[0.55, 0.5, 1.6]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial ref={(m) => { e.mat = m; }} color={body} flatShading roughness={0.8} /></mesh>
      <mesh position={[0, -0.18, 0.1]} scale={[0.5, 0.3, 1.5]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#d8dde0" flatShading /></mesh>
      <mesh position={[0, 0.62, -0.1]} rotation-x={-0.35}><coneGeometry args={[0.24, 0.8, 4]} /><meshStandardMaterial color={body} flatShading /></mesh>
      <mesh position={[0, 0.05, -1.95]} rotation-x={-Math.PI / 2}><coneGeometry args={[0.38, 1.0, 4]} /><meshStandardMaterial color={body} flatShading /></mesh>
      <mesh position={[0, 0.35, -2.25]} rotation-x={-1.2}><coneGeometry args={[0.18, 0.7, 4]} /><meshStandardMaterial color={body} flatShading /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[0.3 * s, 0.14, 1.15]}><sphereGeometry args={[0.07, 6, 5]} /><meshBasicMaterial color={alpha ? '#ff2a2a' : '#0a0a0a'} /></mesh>)}
      {[-1, 1].map((s) => <mesh key={`f${s}`} position={[0.5 * s, -0.15, 0.4]} rotation={[0, 0, 0.9 * s]}><coneGeometry args={[0.14, 0.7, 4]} /><meshStandardMaterial color={body} flatShading /></mesh>)}
      {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[(i - 2.5) * 0.09, -0.12, 1.5]} rotation-x={Math.PI}><coneGeometry args={[0.03, 0.11, 4]} /><meshBasicMaterial color="#fff" /></mesh>)}
      {alpha && <mesh position={[0.3, 0.3, 0.3]} rotation-z={0.7}><boxGeometry args={[0.05, 0.6, 0.05]} /><meshBasicMaterial color="#7a1a1a" /></mesh>}
    </group>
  );
}

export default function Sharks() {
  const [, setVer] = useState(0);
  const groups = useRef(new Map<number, THREE.Group>());
  const tele = useRef<THREE.Mesh>(null!);
  const spawnT = useRef(0);
  const reg = (id: number, g: THREE.Group | null) => { if (g) groups.current.set(id, g); else groups.current.delete(id); };

  useFrame((_, dt0) => {
    if (useGame.getState().paused) return;
    const dt = Math.min(dt0, 0.05); let changed = false, warnAlpha: Enemy | null = null;
    if (fx.wave) {
      spawnT.current -= dt;
      const active = enemies.filter((e) => e.kind === 'shark' && e.state !== 'dead').length;
      if (active < fx.maxActive && spawnT.current <= 0) { enemies.push(make('shark')); spawnT.current = 2.2; changed = true; }
    }
    if (fx.alphaGo) { fx.alphaGo = false; enemies.push(make('alpha')); changed = true; }
    if (fx.eruptNow) { fx.eruptNow = false; const s = make('shark'); s.pos.set(-7, WATER_Y, 1); startLeap(s, new THREE.Vector3(0.5, 0, 2.5), 1.6); enemies.push(s); changed = true; }

    for (const e of enemies) {
      const busy = enemies.filter((o) => o !== e && (o.state === 'leap' || o.state === 'landed' || o.state === 'warn')).length;
      if (e.hp <= 0 && e.state !== 'dead') {
        e.state = 'dead'; e.t = 0; e.vulnerable = false;
        if (!e.silent) {
          if (e.kind === 'alpha') fx.alphaDead = true;
          else { fx.kills++; const now = performance.now(); kills.push(now); while (kills.length && now - kills[0] > 9000) kills.shift(); if (kills.length >= 2) { kills.length = 0; bark('multiKill', true); } }
        }
      }
      e.hitFlash = Math.max(0, e.hitFlash - dt * 4); e.bite -= dt;
      const big = e.kind === 'alpha', d = Math.hypot(playerState.pos.x - e.pos.x, playerState.pos.z - e.pos.z);
      if (e.state === 'circle') {
        e.angle += (big ? 0.3 : 0.34) * dt; const px = e.pos.x, pz = e.pos.z;
        e.pos.set(Math.cos(e.angle) * RX, WATER_Y + Math.sin(e.angle * 3) * 0.05, Math.sin(e.angle) * RZ);
        e.dir.set(e.pos.x - px, 0, e.pos.z - pz); if (e.dir.lengthSq() > 1e-8) e.dir.normalize();
        e.t -= dt;
        if (e.t <= 0 && (fx.wave || big)) {
          if (busy >= 2) e.t = 1.2;
          else if (big) { e.state = 'warn'; e.t = 1.3; e.to.copy(landing()); }
          else { startLeap(e, landing(), 1.3); if (Math.random() < 0.35) { bark('combat'); if (Math.random() < 0.3) void sayLines(S1_2_JUMP, Prio.StoryBanter); } }
        }
      } else if (e.state === 'warn') {
        e.t -= dt; warnAlpha = e; e.pos.y = WATER_Y + Math.sin(performance.now() / 120) * 0.1;
        if (e.t <= 0) { startLeap(e, e.to, 1.6); fx.shake = Math.max(fx.shake, 0.4); }
      } else if (e.state === 'leap') {
        e.t += dt; const u = Math.min(1, e.t / e.dur);
        e.pos.lerpVectors(e.from, e.to, u); e.pos.y += Math.sin(u * Math.PI) * (big ? 7 : 4.5);
        if (u >= 1) {
          e.state = 'landed'; e.t = 0; e.vulnerable = true; e.bite = 0.6; fx.shake = Math.max(fx.shake, big ? 0.9 : 0.5); thump();
          if (d < (big ? 3.8 : 2.4)) hurtPlayer(big ? 24 : 14);
        }
      } else if (e.state === 'landed') {
        e.t += dt;
        if (d < (big ? 3.2 : 2.2) && e.bite <= 0) { hurtPlayer(big ? 16 : 8); e.bite = 1.2; }
        if (e.t >= e.stay) {
          e.vulnerable = false; e.state = 'retreat'; e.t = 0; e.dur = 0.9; e.from.copy(e.pos);
          e.to.set((e.pos.x >= 0 ? 1 : -1) * 7, WATER_Y, e.pos.z); e.dir.copy(e.to).sub(e.from).setY(0).normalize(); splash();
        }
      } else if (e.state === 'retreat') {
        e.t += dt; const u = Math.min(1, e.t / e.dur);
        e.pos.lerpVectors(e.from, e.to, u); e.pos.y += Math.sin(u * Math.PI) * 2.5;
        if (u >= 1) { e.state = 'circle'; e.angle = Math.atan2(e.pos.z / RZ, e.pos.x / RX); e.t = (big ? 3.5 : 2.5) + Math.random() * 2; }
      } else { e.t += dt; e.vulnerable = false; }
      // visuals
      const g = groups.current.get(e.id);
      if (g) {
        const shrink = e.state === 'dead' ? Math.max(0, 1 - e.t / 1.2) : 1;
        g.position.copy(e.pos); g.rotation.y = Math.atan2(e.dir.x, e.dir.z);
        g.rotation.z = e.state === 'landed' ? Math.sin(e.t * 14) * 0.18 : e.state === 'dead' ? Math.sin(e.t * 20) * 0.3 : 0;
        g.rotation.x = e.state === 'leap' ? -0.5 + (e.t / e.dur) : 0;
        g.scale.setScalar(e.scale * shrink);
      }
      if (e.mat) { e.mat.emissive.setRGB(e.hitFlash, e.hitFlash * 0.15, 0); e.mat.emissiveIntensity = 1; }
    }
    // boss HP bar
    const boss = enemies.find((e) => e.kind === 'alpha');
    const st = useGame.getState();
    if (boss && boss.state !== 'dead') { if (!st.boss || st.boss.hp !== boss.hp) st.set({ boss: { name: 'THE ALPHA SHARK', hp: boss.hp, max: boss.maxHp } }); }
    for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].state === 'dead' && enemies[i].t > 1.3) { enemies.splice(i, 1); changed = true; }
    if (tele.current) {
      tele.current.visible = !!warnAlpha;
      if (warnAlpha) { tele.current.position.set(warnAlpha.to.x, 0.06, warnAlpha.to.z); const s = 1 + Math.sin(performance.now() / 90) * 0.06; tele.current.scale.set(s, s, 1); }
    }
    if (changed) setVer((v) => v + 1);
  });

  return (
    <>
      {enemies.map((e) => <SharkView key={e.id} e={e} reg={reg} />)}
      <mesh ref={tele} rotation-x={-Math.PI / 2} visible={false}><ringGeometry args={[3.2, 3.9, 24]} /><meshBasicMaterial color="#ff3b3b" transparent opacity={0.7} side={THREE.DoubleSide} /></mesh>
    </>
  );
}
