import * as THREE from 'three';
import { useMemo } from 'react';

const STONE = '#8b8678', MOSS = '#5d6e4a';
/** Chapter I shore: abandoned structures, wreckage, glowing markings, forest edge and the distant Eclipse Fangs. Ruins centre is (0,0,-14). */
export default function Shore() {
  const trees = useMemo(() => Array.from({ length: 40 }, (_, i) => ({ x: -60 + i * 3 + Math.sin(i * 12.9) * 2, z: -48 - Math.abs(Math.sin(i * 7.3)) * 8, h: 8 + Math.abs(Math.sin(i * 3.1)) * 8 })), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, -22]} receiveShadow><planeGeometry args={[140, 76]} /><meshStandardMaterial color="#cdb98c" flatShading roughness={1} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, 17.5]}><planeGeometry args={[140, 5]} /><meshStandardMaterial color="#9a8762" flatShading roughness={1} /></mesh>
      {/* abandoned structures */}
      {[-6, -2.5, 2.5, 6].map((x, i) => <mesh key={x} position={[x, 2.2 - (i % 2) * 0.8, -14]} castShadow><cylinderGeometry args={[0.6, 0.7, 4.4 - (i % 2) * 1.6, 7]} /><meshStandardMaterial color={STONE} flatShading roughness={1} /></mesh>)}
      <mesh position={[-4.25, 4.5, -14]} rotation-z={0.04}><boxGeometry args={[4.3, 0.7, 1.2]} /><meshStandardMaterial color={STONE} flatShading /></mesh>
      <mesh position={[0, 0.5, -18]}><boxGeometry args={[14, 1, 1]} /><meshStandardMaterial color={MOSS} flatShading roughness={1} /></mesh>
      <mesh position={[-9, 0.6, -10]} rotation-y={0.4}><boxGeometry args={[4, 1.2, 1]} /><meshStandardMaterial color={STONE} flatShading /></mesh>
      {/* strange markings: glowing ground glyph + standing stones */}
      <group position={[0, 0.03, -9]}>
        <mesh rotation-x={-Math.PI / 2}><ringGeometry args={[2.6, 3, 40]} /><meshBasicMaterial color="#58e0ff" transparent opacity={0.55} /></mesh>
        <mesh rotation-x={-Math.PI / 2}><ringGeometry args={[1.2, 1.35, 40]} /><meshBasicMaterial color="#58e0ff" transparent opacity={0.4} /></mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 3]}><planeGeometry args={[6, 0.07]} /><meshBasicMaterial color="#58e0ff" transparent opacity={0.45} /></mesh>)}
      </group>
      {[-12, 12].map((x) => (
        <group key={x} position={[x, 0, -6]}>
          <mesh position-y={1.8} castShadow><boxGeometry args={[1.2, 3.6, 0.8]} /><meshStandardMaterial color="#6a6a70" flatShading roughness={1} /></mesh>
          <mesh position={[0, 2, 0.42]}><planeGeometry args={[0.6, 1.2]} /><meshBasicMaterial color="#58e0ff" /></mesh>
        </group>
      ))}
      {/* wreckage + crates from earlier expeditions */}
      <mesh position={[11, 0.5, 11]} rotation={[0.2, 0.7, 0.35]}><boxGeometry args={[7, 1.4, 2.4]} /><meshStandardMaterial color="#3d2a18" flatShading /></mesh>
      <mesh position={[-10, 0.4, 12]} rotation={[0, -0.5, 0.2]}><boxGeometry args={[5, 0.9, 2]} /><meshStandardMaterial color="#4a3320" flatShading /></mesh>
      {[[-4, 8], [-3, 9.4], [4.5, 6]].map(([x, z], i) => <mesh key={i} position={[x, 0.4, z]} rotation-y={i}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#6b4a2a" flatShading /></mesh>)}
      {[[5, 7], [6.2, 8]].map(([x, z], i) => <mesh key={i} position={[x, 0.45, z]}><cylinderGeometry args={[0.35, 0.35, 0.9, 8]} /><meshStandardMaterial color="#5a3d24" flatShading /></mesh>)}
      {/* forest edge + the Eclipse Fangs on the horizon */}
      {trees.map((t, i) => <mesh key={i} position={[t.x, t.h / 2, t.z]} castShadow><coneGeometry args={[2.4, t.h, 6]} /><meshStandardMaterial color="#2f5b36" flatShading roughness={1} /></mesh>)}
      <mesh position={[-48, 55, -150]}><coneGeometry args={[40, 110, 6]} /><meshStandardMaterial color="#59647a" flatShading roughness={1} /></mesh>
      <mesh position={[58, 62, -160]}><coneGeometry args={[44, 124, 6]} /><meshStandardMaterial color="#4f5a70" flatShading roughness={1} /></mesh>
    </group>
  );
}
