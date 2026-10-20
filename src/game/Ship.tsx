import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fx } from './fx';

const WOOD = '#5a3d24', DARK = '#2a1b10';
/** Expedition vessel. Deck top is at y=0, bow toward +Z. Rocks in 15 FPS steps; fx.tilt pitches the ship when it breaks. */
export default function Ship({ rock = 1, scale = 1 }: { rock?: number; scale?: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = Math.floor(clock.elapsedTime * 15) / 15, r = rock * (1 - 0.6 * fx.calm);
    g.current.rotation.z = Math.sin(t * 0.9) * 0.03 * r + fx.tilt * 0.5;
    g.current.rotation.x = Math.sin(t * 0.7 + 1) * 0.02 * r - fx.tilt;
    g.current.position.y = Math.sin(t * 1.1) * 0.12 * r;
  });
  return (
    <group ref={g} scale={scale}>
      <mesh position-y={-0.2} receiveShadow castShadow><boxGeometry args={[8, 0.4, 28]} /><meshStandardMaterial color={WOOD} flatShading roughness={0.9} /></mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x) => <mesh key={x} position={[x, 0.005, 0]}><boxGeometry args={[0.06, 0.01, 28]} /><meshStandardMaterial color={DARK} /></mesh>)}
      <mesh position={[0, -1.9, 0]} castShadow><boxGeometry args={[9, 3.2, 30]} /><meshStandardMaterial color="#33220f" flatShading roughness={1} /></mesh>
      <mesh position={[0, -1.2, 19]} rotation-x={Math.PI / 2} scale={[1, 1, 0.55]}><coneGeometry args={[4.5, 9, 4]} /><meshStandardMaterial color="#33220f" flatShading /></mesh>
      <mesh position={[0, 0.0, 15.5]}><boxGeometry args={[6, 0.02, 3.5]} /><meshStandardMaterial color={WOOD} flatShading /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[4.1 * s, 0.55, 0]}><boxGeometry args={[0.14, 0.12, 28]} /><meshStandardMaterial color={DARK} flatShading /></mesh>
          {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[4.1 * s, 0.25, -12 + i * 3]}><boxGeometry args={[0.16, 0.6, 0.16]} /><meshStandardMaterial color={DARK} flatShading /></mesh>)}
        </group>
      ))}
      {[-6, 0].map((z) => (
        <group key={z}>
          <mesh position={[0, 7, z]} castShadow><cylinderGeometry args={[0.22, 0.3, 14, 8]} /><meshStandardMaterial color={DARK} flatShading /></mesh>
          <mesh position={[0, 10, z]}><boxGeometry args={[7.2, 0.18, 0.18]} /><meshStandardMaterial color={DARK} /></mesh>
          <mesh position={[0, 7, z + 0.2]}><boxGeometry args={[6.6, 5.6, 0.06]} /><meshStandardMaterial color="#b9b29c" flatShading side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.9, -12]} rotation-x={Math.PI / 2}><torusGeometry args={[0.7, 0.07, 6, 12]} /><meshStandardMaterial color={DARK} /></mesh>
      {[-5, 4].map((z) => (
        <group key={z} position={[2.8, 1.6, z]}>
          <mesh><sphereGeometry args={[0.16, 8, 6]} /><meshBasicMaterial color="#ffb347" /></mesh>
          <pointLight color="#ffb347" intensity={18} distance={14} />
        </group>
      ))}
    </group>
  );
}
