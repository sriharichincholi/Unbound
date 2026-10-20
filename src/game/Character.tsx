import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { HeroId } from './heroes';
import { LOOKS, type Look } from './looks';
import { Weapon, Orb } from './Weapons';

/** Shared mutable animation inputs, written by Player/Companion each frame, read by the rig at 15 FPS. */
export interface Motion { speed: number; swing: number; roll: number; dead?: boolean }
export const newMotion = (): Motion => ({ speed: 0, swing: 0, roll: 0 });

const M = ({ c, e, ei = 0, m = 0, r = 0.8 }: { c: string; e?: string; ei?: number; m?: number; r?: number }) =>
  <meshStandardMaterial color={c} emissive={e ?? '#000'} emissiveIntensity={ei} metalness={m} roughness={r} flatShading />;

function Hair({ L }: { L: Look }) {
  const c = L.hair;
  const cap = (<mesh position={[0, 0.03, -0.02]} rotation-x={-0.25}><sphereGeometry args={[0.235, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} /><M c={c} /></mesh>);
  if (L.style === 'spiky') return <group>{cap}{[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[Math.cos(i * 1.05) * 0.14, 0.24, Math.sin(i * 1.05) * 0.14]} rotation={[Math.sin(i * 1.05) * 0.5, 0, -Math.cos(i * 1.05) * 0.5]}><coneGeometry args={[0.06, 0.22, 5]} /><M c={c} /></mesh>)}</group>;
  if (L.style === 'long') return <group>{cap}<mesh position={[0, -0.32, -0.15]}><boxGeometry args={[0.42, 0.85, 0.12]} /><M c={c} /></mesh><mesh position={[0, 0.1, 0.16]} rotation-x={0.5}><boxGeometry args={[0.36, 0.07, 0.1]} /><M c={c} /></mesh></group>;
  if (L.style === 'bob') return <group>{cap}{[-1, 1].map((s) => <mesh key={s} position={[0.2 * s, -0.08, 0.0]}><boxGeometry args={[0.09, 0.3, 0.3]} /><M c={c} /></mesh>)}<mesh position={[0, -0.05, -0.2]}><boxGeometry args={[0.4, 0.3, 0.1]} /><M c={c} /></mesh></group>;
  if (L.style === 'curly') return <group>{cap}{[0, 1, 2, 3, 4, 5, 6].map((i) => <mesh key={i} position={[Math.cos(i * 0.9) * 0.17, 0.17 + (i % 2) * 0.05, Math.sin(i * 0.9) * 0.15 - 0.02]}><sphereGeometry args={[0.08, 6, 5]} /><M c={c} /></mesh>)}</group>;
  return <group>{cap}<mesh position={[0, 0.12, 0.17]} rotation-x={0.4}><boxGeometry args={[0.34, 0.07, 0.09]} /><M c={c} /></mesh></group>;
}

export default function Character({ id, motion }: { id: HeroId; motion: Motion }) {
  const L = LOOKS[id];
  const root = useRef<THREE.Group>(null!), spin = useRef<THREE.Group>(null!), lArm = useRef<THREE.Group>(null!), rArm = useRef<THREE.Group>(null!);
  const lLeg = useRef<THREE.Group>(null!), rLeg = useRef<THREE.Group>(null!), cape = useRef<THREE.Mesh>(null!);
  const st = useRef({ acc: 0, phase: 0 });
  const b = L.bulk;

  useFrame(({ clock }, dt) => {
    const s = st.current; s.acc += dt; if (s.acc < 1 / 15) return; // retro-stepped 15 FPS keyframes
    const step = s.acc; s.acc = 0;
    const w = Math.min(1, motion.speed / 4);
    s.phase += step * (3 + motion.speed * 1.6);
    const sw = Math.sin(s.phase) * 0.85 * w;
    lLeg.current.rotation.x = sw; rLeg.current.rotation.x = -sw;
    lArm.current.rotation.x = -sw * 0.8 + (id === 'agniv' ? -0.5 : 0);
    rArm.current.rotation.x = motion.swing > 0.02 ? -1.3 + motion.swing * 3.7 : -0.5 + sw * 0.5 * (id === 'kofi' ? 0.4 : 1);
    root.current.position.y = Math.sin(clock.elapsedTime * 2.2) * 0.012 + Math.abs(Math.sin(s.phase)) * 0.05 * w;
    spin.current.rotation.x = motion.roll > 0 ? Math.PI * 2 * (1 - motion.roll / 0.45) : 0;
    if (cape.current) cape.current.rotation.x = 0.12 + w * 0.35 + Math.sin(clock.elapsedTime * 3) * 0.04;
    spin.current.scale.y = motion.dead ? 0.2 : 1;
  });

  return (
    <group scale={L.height}>
      <group ref={spin} position-y={0.9}>
        <group ref={root} position-y={-0.9}>
          {/* legs */}
          {([[-0.13, lLeg], [0.13, rLeg]] as const).map(([x, ref]) => (
            <group key={x} ref={ref} position={[x * b, 0.92, 0]}>
              <mesh position-y={-0.36}><capsuleGeometry args={[0.085 * b, 0.55, 3, 8]} /><M c={L.pants} /></mesh>
              <mesh position={[0, -0.8, 0.04]}><boxGeometry args={[0.17 * b, 0.2, 0.26]} /><M c={L.boots} m={0.3} /></mesh>
            </group>
          ))}
          {/* coat skirt + torso + belt */}
          <mesh position-y={0.92}><cylinderGeometry args={[0.22 * b, 0.3 * b, 0.34, 8]} /><M c={L.coat} /></mesh>
          <mesh position-y={1.3}><cylinderGeometry args={[0.27 * b, 0.21 * b, 0.62, 8]} /><M c={L.top} /></mesh>
          <mesh position-y={1.1}><cylinderGeometry args={[0.215 * b, 0.215 * b, 0.07, 8]} /><M c={L.accent} e={L.accent} ei={0.25} m={0.6} r={0.4} /></mesh>
          <mesh position={[0, 1.34, 0.2 * b]}><boxGeometry args={[0.14, 0.34, 0.05]} /><M c={L.accent} e={L.accent} ei={0.35} m={0.6} r={0.4} /></mesh>
          {id === 'kofi' && [-1, 1].map((s) => <mesh key={s} position={[0.3 * s * b, 1.55, 0]}><dodecahedronGeometry args={[0.14, 0]} /><M c="#8a8478" r={1} /></mesh>)}
          {L.cape && <mesh ref={cape} position={[0, 1.38, -0.24 * b]}><boxGeometry args={[0.46 * b, 0.95, 0.04]} /><M c={L.cape} /></mesh>}
          {/* arms */}
          {([[0.37, lArm, 'L'], [-0.37, rArm, 'R']] as const).map(([x, ref, side]) => (
            <group key={side} ref={ref} position={[x * b, 1.52, 0]}>
              <mesh position-y={-0.05}><sphereGeometry args={[0.12 * b, 8, 6]} /><M c={L.coat} /></mesh>
              <mesh position-y={-0.3}><capsuleGeometry args={[0.065 * b, 0.4, 3, 8]} /><M c={L.top} /></mesh>
              <mesh position-y={-0.6}><sphereGeometry args={[0.075 * b, 8, 6]} /><M c={L.skin} /></mesh>
              <group position-y={-0.6}><Weapon id={id} side={side} /></group>
            </group>
          ))}
          {/* head */}
          <group position-y={1.82}>
            <mesh position-y={-0.08}><cylinderGeometry args={[0.06, 0.07, 0.12, 6]} /><M c={L.skin} /></mesh>
            <mesh scale={[1, 1.05, 0.95]}><sphereGeometry args={[0.215, 14, 10]} /><M c={L.skin} r={0.6} /></mesh>
            {[-1, 1].map((s) => (
              <group key={s} position={[0.075 * s, -0.005, 0.19]}>
                <mesh><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#fff" /></mesh>
                <mesh position-z={0.025}><sphereGeometry args={[0.025, 8, 6]} /><meshBasicMaterial color={L.eye} /></mesh>
                <mesh position={[0, 0.06, 0.01]} rotation-z={0.15 * s}><boxGeometry args={[0.07, 0.014, 0.02]} /><M c={L.hair} /></mesh>
              </group>
            ))}
            <mesh position={[0, -0.09, 0.2]}><boxGeometry args={[0.06, 0.012, 0.02]} /><meshBasicMaterial color="#7a3a3a" /></mesh>
            <Hair L={L} />
          </group>
          {id === 'elara' && <Orb />}
        </group>
      </group>
    </group>
  );
}
