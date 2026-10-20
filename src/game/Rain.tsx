import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from '../managers/store';
import { QUALITY } from './quality';
import { fx } from './fx';

/** Rain streak points that fall around the camera. Thins out when the sea goes silent. */
export default function Rain() {
  const n = QUALITY[useGame((s) => s.quality)].particles * 6;
  const pts = useRef<THREE.Points>(null!);
  const pos = useMemo(() => { const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 40; a[i * 3 + 1] = Math.random() * 20; a[i * 3 + 2] = (Math.random() - 0.5) * 40; } return a; }, [n]);
  useFrame(({ camera }, dt) => {
    const p = pts.current; if (!p) return;
    const a = p.geometry.attributes.position as THREE.BufferAttribute, arr = a.array as Float32Array;
    const speed = 22 * (1 - 0.8 * fx.calm);
    for (let i = 0; i < n; i++) { arr[i * 3 + 1] -= speed * dt; arr[i * 3] -= 4 * dt; if (arr[i * 3 + 1] < -2) arr[i * 3 + 1] = 18 + Math.random() * 2; }
    a.needsUpdate = true; p.position.set(camera.position.x, 0, camera.position.z);
  });
  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" array={pos} count={n} itemSize={3} /></bufferGeometry>
      <pointsMaterial color="#9fb4c8" size={0.09} transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
