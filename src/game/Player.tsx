import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HEROES } from './heroes';
import Character, { newMotion } from './Character';
import { useGame } from '../managers/store';
import { strike, playerState, clampToScene } from './combat';
import { fx, stepCine } from './fx';

export default function Player() {
  const heroId = useGame((s) => s.hero), scene = useGame((s) => s.scene);
  const hero = HEROES[heroId];
  const { gl, camera } = useThree();
  const body = useRef<THREE.Group>(null!), slash = useRef<THREE.Mesh>(null!);
  const motion = useRef(newMotion()).current;
  const keys = useRef(new Set<string>());
  const s = useRef({ yaw: Math.PI, pitch: 0.32, roll: 0, rollDir: new THREE.Vector3(), combo: 0, lastAtk: -9, slashT: 0, cd: [0, 0, 0] as number[], hud: 0, wasLocked: false });

  // spawn: ship deck faces the bow (+Z), shore faces inland (-Z)
  useEffect(() => {
    const st = s.current;
    if (scene === 'ship') { playerState.pos.set(0, 0, 6.5); playerState.face.set(0, 0, 1); st.yaw = Math.PI; }
    else { playerState.pos.set(0, 0, 15); playerState.face.set(0, 0, -1); st.yaw = 0; }
  }, [scene]);

  const canAct = () => { const g = useGame.getState(); return !g.locked && !g.paused && g.hp > 0; };
  const spend = (n: number) => { const g = useGame.getState(); if (g.stamina < n) return false; g.set({ stamina: g.stamina - n }); return true; };
  const attack = (heavy: boolean) => {
    const st = s.current, now = performance.now() / 1000;
    if (!canAct() || st.roll > 0 || !spend(heavy ? 22 : 8)) return;
    st.combo = now - st.lastAtk < 0.7 ? (st.combo + 1) % 3 : 0; st.lastAtk = now;
    strike(playerState.pos, playerState.face, heavy ? 3.4 : 2.8, heavy ? -1 : 0.2, (heavy ? 22 : 8 + st.combo * 3) * (1 + hero.stats.power / 20));
    st.slashT = 0.15; motion.swing = 1; slash.current.rotation.z = (st.combo - 1) * 0.6 + (heavy ? 1.2 : 0);
  };
  const ability = (i: number) => {
    const st = s.current, g = useGame.getState();
    if (!canAct() || st.cd[i] > 0 || g.energy < hero.abilityCost[i]) return;
    g.set({ energy: g.energy - hero.abilityCost[i] }); st.cd[i] = hero.abilityCd[i]; motion.swing = 1;
    if (i === 0) { playerState.pos.addScaledVector(playerState.face, 4); clampToScene(playerState.pos, scene); }
    if (heroId === 'elara' && i === 1) useGame.getState().set({ hp: Math.min(100, g.hp + 30) });
    else strike(playerState.pos, playerState.face, hero.abilityRadius[i] + 1, -1, 18 + i * 22);
    st.slashT = 0.3;
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const k = e.code; if (keys.current.has(k)) return; keys.current.add(k);
      const g = useGame.getState();
      if (k === 'KeyP' && !g.locked && g.hp > 0) { if (!g.paused) document.exitPointerLock?.(); g.set({ paused: !g.paused, pauseSettings: false }); return; }
      if (!canAct()) return;
      const st = s.current;
      if (k === 'Space' && st.roll <= 0 && spend(20)) { st.roll = 0.45; st.rollDir.copy(playerState.face); }
      if (k === 'KeyQ') ability(0); if (k === 'KeyE') ability(1); if (k === 'KeyR') ability(2);
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.code);
    const mm = (e: MouseEvent) => { if (document.pointerLockElement !== gl.domElement || fx.cine.active) return; s.current.yaw -= e.movementX * 0.003; s.current.pitch = THREE.MathUtils.clamp(s.current.pitch + e.movementY * 0.003, 0.05, 1.1); };
    const md = (e: MouseEvent) => { if (!canAct()) return; if (document.pointerLockElement !== gl.domElement) { gl.domElement.requestPointerLock?.(); return; } attack(e.button === 2); };
    const plc = () => {
      const locked = document.pointerLockElement === gl.domElement;
      if (locked) { s.current.wasLocked = true; return; }
      if (!s.current.wasLocked) return;
      s.current.wasLocked = false; const g = useGame.getState();
      if (g.screen === 'game' && !g.locked && g.hp > 0 && !g.chapterCard) g.set({ paused: true, pauseSettings: false }); // Esc releases the mouse -> pause menu
    };
    const ctx = (e: Event) => e.preventDefault();
    addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('mousemove', mm);
    document.addEventListener('pointerlockchange', plc); gl.domElement.addEventListener('mousedown', md); gl.domElement.addEventListener('contextmenu', ctx);
    return () => {
      removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('mousemove', mm);
      document.removeEventListener('pointerlockchange', plc); gl.domElement.removeEventListener('mousedown', md); gl.domElement.removeEventListener('contextmenu', ctx);
    };
  }, [gl, heroId, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt0) => {
    const g = useGame.getState(); if (g.paused) return;
    const dt = Math.min(dt0, 0.05), st = s.current, k = keys.current, ok = !g.locked && g.hp > 0;
    const fwd = new THREE.Vector3(-Math.sin(st.yaw), 0, -Math.cos(st.yaw)), right = new THREE.Vector3(Math.cos(st.yaw), 0, -Math.sin(st.yaw));
    const dir = new THREE.Vector3();
    if (ok) { if (k.has('KeyW')) dir.add(fwd); if (k.has('KeyS')) dir.sub(fwd); if (k.has('KeyD')) dir.add(right); if (k.has('KeyA')) dir.sub(right); }
    const moving = dir.lengthSq() > 0; if (moving) { dir.normalize(); playerState.face.lerp(dir, 0.25).normalize(); }
    const sprint = moving && k.has('ShiftLeft') && g.stamina > 1 && st.roll <= 0;
    const speed = (sprint ? 7 : 4.5) * (0.8 + hero.stats.speed / 25);
    let spent = false, actual = 0;
    if (st.roll > 0) { st.roll -= dt; playerState.pos.addScaledVector(st.rollDir, 9 * dt); spent = true; actual = 9; }
    else if (moving) { playerState.pos.addScaledVector(dir, speed * dt); actual = speed; }
    clampToScene(playerState.pos, scene);
    playerState.invuln = st.roll > 0.1 && st.roll < 0.4; // i-frames mid-roll
    if (sprint) { spent = true; g.set({ stamina: Math.max(0, g.stamina - 15 * dt) }); }
    else if (!spent && g.stamina < 100) g.set({ stamina: Math.min(100, g.stamina + 18 * dt) });
    st.cd = st.cd.map((c) => Math.max(0, c - dt));
    if (g.energy < 100) g.set({ energy: Math.min(100, g.energy + 4 * dt) });
    motion.speed = actual; motion.roll = Math.max(0, st.roll); motion.swing = Math.max(0, motion.swing - dt * 5); motion.dead = g.hp <= 0;
    st.slashT = Math.max(0, st.slashT - dt); slash.current.visible = st.slashT > 0;
    (slash.current.material as THREE.MeshBasicMaterial).opacity = st.slashT * 5;
    body.current.position.copy(playerState.pos); body.current.rotation.y = Math.atan2(playerState.face.x, playerState.face.z);
    slash.current.position.copy(playerState.pos).addScaledVector(playerState.face, 1.2).setY(1.2); slash.current.rotation.y = body.current.rotation.y + Math.PI;
    // camera: scripted (cinematic) or third-person follow
    stepCine(dt);
    if (fx.cine.active) { camera.position.copy(fx.cine.pos); camera.lookAt(fx.cine.look); }
    else {
      const cp = Math.cos(st.pitch);
      camera.position.set(playerState.pos.x + Math.sin(st.yaw) * 6 * cp, Math.max(1.2, 1.5 + Math.sin(st.pitch) * 6), playerState.pos.z + Math.cos(st.yaw) * 6 * cp);
      camera.lookAt(playerState.pos.x, 1.4, playerState.pos.z);
    }
    if (fx.shake > 0.01) { camera.position.add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(fx.shake * 0.35)); fx.shake *= Math.exp(-3 * dt); }
    st.hud += dt; if (st.hud > 0.1) { st.hud = 0; useGame.setState({ cd: st.cd.map((c, i) => c / hero.abilityCd[i]) as [number, number, number] }); }
  });

  return (
    <>
      <group ref={body}><Character id={heroId} motion={motion} /></group>
      <mesh ref={slash} visible={false}><ringGeometry args={[0.8, 1.6, 12, 1, 0, Math.PI]} /><meshBasicMaterial color={hero.color} transparent side={THREE.DoubleSide} /></mesh>
    </>
  );
}
