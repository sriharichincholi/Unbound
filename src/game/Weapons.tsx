import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { HeroId } from './heroes';

/** Weapons are authored in "hand space": origin at the grip, extending along -Y (the arm's direction). */
const ARC = Math.PI * 1.15;

function Flame({ size = 1 }: { size?: number }) {
  const a = useRef<THREE.Mesh>(null!), b = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => { // retro-stepped flicker at ~12 FPS
    const t = Math.floor(clock.elapsedTime * 12);
    const f = 0.85 + ((t * 7919) % 13) / 40;
    a.current.scale.set(1, f, 1); b.current.scale.set(1, f * 0.9, 1);
  });
  return (
    <group position-y={-0.34 * size} rotation-x={Math.PI} scale={size}>
      <mesh ref={a}><coneGeometry args={[0.13, 0.42, 6]} /><meshBasicMaterial color="#ff6a1a" transparent opacity={0.9} /></mesh>
      <mesh ref={b} position-y={-0.03}><coneGeometry args={[0.07, 0.28, 6]} /><meshBasicMaterial color="#ffd36a" /></mesh>
    </group>
  );
}

export function Weapon({ id, side }: { id: HeroId; side: 'R' | 'L' }) {
  if (id === 'takeshi' && side === 'R') return ( // VOIDCALLER - black crescent blade with a violet void edge
    <group>
      <mesh position-y={-0.12}><cylinderGeometry args={[0.03, 0.035, 0.34, 8]} /><meshStandardMaterial color="#15121f" roughness={0.5} /></mesh>
      <mesh position-y={-0.3}><boxGeometry args={[0.24, 0.045, 0.07]} /><meshStandardMaterial color="#6a4cc8" metalness={0.8} roughness={0.3} emissive="#3a1f8a" emissiveIntensity={0.6} /></mesh>
      <group position-y={-0.9} rotation-y={-Math.PI / 2}>
        <group rotation-z={-ARC / 2}>
          <mesh><torusGeometry args={[0.62, 0.045, 6, 20, ARC]} /><meshStandardMaterial color="#0b0912" metalness={0.95} roughness={0.2} /></mesh>
          <mesh position-x={0.025}><torusGeometry args={[0.66, 0.012, 4, 20, ARC]} /><meshBasicMaterial color="#9a7cff" /></mesh>
        </group>
      </group>
      <mesh position={[0, -0.9, 0.15]} rotation-x={Math.PI / 2}><torusGeometry args={[0.2, 0.012, 4, 14]} /><meshBasicMaterial color="#7b5cff" transparent opacity={0.55} /></mesh>
    </group>
  );
  if (id === 'maeve' && side === 'R') return ( // SPECTRAL FANG - phasing curved dagger (ghost copy offset = partially out of phase)
    <group>
      <mesh position-y={-0.1}><cylinderGeometry args={[0.025, 0.03, 0.22, 8]} /><meshStandardMaterial color="#1b1320" /></mesh>
      <mesh position-y={-0.22}><boxGeometry args={[0.16, 0.035, 0.05]} /><meshStandardMaterial color="#6fe0c0" emissive="#2a9a80" emissiveIntensity={0.7} /></mesh>
      <group position-y={-0.55} rotation-y={-Math.PI / 2}><group rotation-z={-1.4 / 2}>
        <mesh><torusGeometry args={[0.32, 0.03, 5, 14, 1.4]} /><meshStandardMaterial color="#c8fff0" emissive="#6fe0c0" emissiveIntensity={0.9} transparent opacity={0.9} /></mesh>
      </group></group>
      <group position={[0.07, -0.55, 0]} rotation-y={-Math.PI / 2}><group rotation-z={-1.4 / 2}>
        <mesh><torusGeometry args={[0.34, 0.05, 5, 14, 1.4]} /><meshBasicMaterial color="#6fe0c0" transparent opacity={0.28} /></mesh>
      </group></group>
    </group>
  );
  if (id === 'agniv') return ( // PHOENIX GAUNTLETS - both hands, ember plating and living flame
    <group>
      <mesh position-y={-0.1}><boxGeometry args={[0.24, 0.26, 0.26]} /><meshStandardMaterial color="#7a3a12" metalness={0.7} roughness={0.35} /></mesh>
      <mesh position-y={-0.06}><boxGeometry args={[0.27, 0.07, 0.29]} /><meshStandardMaterial color="#e08a2a" metalness={0.8} roughness={0.3} emissive="#ff6a1a" emissiveIntensity={0.7} /></mesh>
      <mesh position={[0, 0.02, 0.1]} rotation-x={-0.5}><coneGeometry args={[0.06, 0.3, 4]} /><meshStandardMaterial color="#ffb347" emissive="#ff6a1a" emissiveIntensity={0.9} /></mesh>
      <Flame />
    </group>
  );
  if (id === 'kofi' && side === 'R') return ( // TERRA HAMMER - stone head, glowing amber runes
    <group>
      <mesh position-y={-0.7}><cylinderGeometry args={[0.045, 0.05, 1.5, 8]} /><meshStandardMaterial color="#4a3622" roughness={0.9} /></mesh>
      {[-0.4, -0.9].map((y) => <mesh key={y} position-y={y}><cylinderGeometry args={[0.062, 0.062, 0.06, 8]} /><meshStandardMaterial color="#8a6a2a" metalness={0.6} /></mesh>)}
      <group position-y={-1.5}>
        <mesh><boxGeometry args={[0.78, 0.46, 0.46]} /><meshStandardMaterial color="#8a8478" flatShading roughness={1} /></mesh>
        <mesh position-x={0.4}><dodecahedronGeometry args={[0.24, 0]} /><meshStandardMaterial color="#6f695e" flatShading roughness={1} /></mesh>
        <mesh position-x={-0.4}><dodecahedronGeometry args={[0.24, 0]} /><meshStandardMaterial color="#6f695e" flatShading roughness={1} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[0, 0, 0.235 * s]}><planeGeometry args={[0.34, 0.14]} /><meshBasicMaterial color="#ffb23a" side={THREE.DoubleSide} /></mesh>)}
      </group>
    </group>
  );
  return null; // Elara's Celestial Orbis floats beside her (see Orb)
}

/** CELESTIAL ORBIS - luminous orb hovering by Elara's shoulder, linked to her by an ethereal thread. */
export function Orb() {
  const orb = useRef<THREE.Group>(null!), thread = useRef<THREE.Mesh>(null!), ring = useRef<THREE.Mesh>(null!);
  const A = useRef(new THREE.Vector3(-0.3, 1.42, 0.08)), B = useRef(new THREE.Vector3()), up = useRef(new THREE.Vector3(0, 1, 0));
  useFrame(({ clock }) => {
    const t = Math.floor(clock.elapsedTime * 15) / 15;
    B.current.set(0.78 + Math.sin(t * 1.3) * 0.06, 1.95 + Math.sin(t * 2) * 0.1, 0.25);
    orb.current.position.copy(B.current); ring.current.rotation.z = t * 1.6; ring.current.rotation.x = 1.1;
    const d = B.current.clone().sub(A.current), len = d.length();
    thread.current.position.copy(A.current).addScaledVector(d, 0.5); thread.current.scale.set(1, len, 1);
    thread.current.quaternion.setFromUnitVectors(up.current, d.normalize());
  });
  return (
    <>
      <mesh ref={thread}><cylinderGeometry args={[0.008, 0.008, 1, 4]} /><meshBasicMaterial color="#9fe6ff" transparent opacity={0.6} /></mesh>
      <group ref={orb}>
        <mesh><icosahedronGeometry args={[0.2, 1]} /><meshStandardMaterial color="#e8fbff" emissive="#7fd8ff" emissiveIntensity={1.6} flatShading /></mesh>
        <mesh ref={ring}><torusGeometry args={[0.3, 0.012, 4, 20]} /><meshBasicMaterial color="#bfeeff" /></mesh>
        <pointLight color="#7fd8ff" intensity={6} distance={6} />
      </group>
    </>
  );
}
