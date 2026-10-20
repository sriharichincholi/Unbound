import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { oceanVert, oceanFrag } from '../shaders/ocean';
import { useGame } from '../managers/store';
import { QUALITY } from './quality';
import { fx } from './fx';
import { thunder } from '../managers/audio';

export const lightning = { flash: 0 };
const NIGHT = { deep: new THREE.Color('#020813'), foam: new THREE.Color('#59101c'), fog: new THREE.Color('#0b1220') };
const DAY = { deep: new THREE.Color('#1d6a80'), foam: new THREE.Color('#bfe6e8'), fog: new THREE.Color('#a9cfe0') };

/** Storm (lightning, big waves) or day (follows fx.dawn) ocean. Wave time is stepped to ~15 FPS for the retro look. */
export default function Ocean({ size = 400, y = 0, day = false, amp = 1, lightningOn = true }: { size?: number; y?: number; day?: boolean; amp?: number; lightningOn?: boolean }) {
  const q = QUALITY[useGame((s) => s.quality)];
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uFlash: { value: 0 }, uAmp: { value: amp }, uFogDensity: { value: day ? 0.006 : 0.012 },
    uFogColor: { value: new THREE.Color(NIGHT.fog) }, uDeep: { value: new THREE.Color(NIGHT.deep) }, uFoam: { value: new THREE.Color(NIGHT.foam) },
  }), [amp, day]);
  const next = useRef(3);
  useFrame(({ clock }, dt) => {
    uniforms.uTime.value = Math.floor(clock.elapsedTime * 15) / 15;
    uniforms.uAmp.value = amp * (1 - 0.85 * fx.calm);
    if (day) {
      uniforms.uDeep.value.copy(NIGHT.deep).lerp(DAY.deep, fx.dawn); uniforms.uFoam.value.copy(NIGHT.foam).lerp(DAY.foam, fx.dawn);
      uniforms.uFogColor.value.copy(NIGHT.fog).lerp(DAY.fog, fx.dawn);
    }
    if (lightningOn && !day && clock.elapsedTime > next.current) {
      lightning.flash = 1; thunder(); next.current = clock.elapsedTime + 4 + Math.random() * 7 + fx.calm * 10;
    }
    lightning.flash = Math.max(0, lightning.flash - dt * 3.5);
    uniforms.uFlash.value = lightning.flash;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y}>
      <planeGeometry args={[size, size, q.oceanRes, q.oceanRes]} />
      <shaderMaterial uniforms={uniforms} vertexShader={oceanVert} fragmentShader={oceanFrag} />
    </mesh>
  );
}
