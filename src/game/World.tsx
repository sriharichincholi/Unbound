import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Ocean, { lightning } from './Ocean';
import Ship from './Ship';
import Sharks from './Sharks';
import Shore from './Shore';
import Rain from './Rain';
import Player from './Player';
import Companions from './Companions';
import { fx } from './fx';
import { useGame } from '../managers/store';
import { QUALITY } from './quality';

export function Post() {
  const q = QUALITY[useGame((s) => s.quality)];
  return <EffectComposer multisampling={0}><Bloom intensity={q.bloom ? 0.6 : 0} luminanceThreshold={0.7} /><Vignette darkness={q.vignette ? 0.6 : 0} offset={0.3} /></EffectComposer>;
}
/** Twin silhouettes on the horizon - the Eclipse Fangs ("markers"). */
export function Peaks({ z = 215 }: { z?: number }) {
  return (
    <>
      <mesh position={[-30, 42, z]}><coneGeometry args={[38, 90, 6]} /><meshBasicMaterial color="#04060b" fog={false} /></mesh>
      <mesh position={[36, 50, z + 10]}><coneGeometry args={[42, 106, 6]} /><meshBasicMaterial color="#04060b" fog={false} /></mesh>
    </>
  );
}

function ShipScene() {
  const q = QUALITY[useGame((s) => s.quality)];
  const moon = useRef<THREE.DirectionalLight>(null!);
  useFrame(() => { moon.current.intensity = 0.9 + lightning.flash * 3; });
  return (
    <>
      <color attach="background" args={['#0d1626']} /><fogExp2 attach="fog" args={['#0d1626', 0.022]} />
      <hemisphereLight args={['#5a6f9a', '#1a1018', 1.0]} />
      <directionalLight ref={moon} position={[8, 20, 10]} color="#aab8e0" castShadow shadow-mapSize={[q.shadow, q.shadow]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <Ship /><Ocean size={500} y={-1.7} /><Peaks /><Rain /><Sharks /><Companions /><Player /><Post />
    </>
  );
}

function ShoreScene() {
  const q = QUALITY[useGame((s) => s.quality)];
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null!), hemi = useRef<THREE.HemisphereLight>(null!);
  const N = useRef(new THREE.Color('#1a2236')), D = useRef(new THREE.Color('#a9cfe0'));
  useFrame(() => {
    const d = fx.dawn;
    if (scene.background instanceof THREE.Color) scene.background.copy(N.current).lerp(D.current, d);
    if (scene.fog instanceof THREE.FogExp2 && scene.background instanceof THREE.Color) scene.fog.color.copy(scene.background);
    sun.current.intensity = 0.15 + 2.6 * d; hemi.current.intensity = 0.3 + 0.9 * d;
  });
  return (
    <>
      <color attach="background" args={['#1a2236']} /><fogExp2 attach="fog" args={['#1a2236', 0.006]} />
      <hemisphereLight ref={hemi} args={['#cfe6ff', '#6a5a40', 0.3]} />
      <directionalLight ref={sun} position={[-25, 30, -10]} color="#ffe3b0" castShadow shadow-mapSize={[q.shadow, q.shadow]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} />
      <Shore /><Ocean size={600} y={-0.5} day amp={0.35} lightningOn={false} /><Companions /><Player /><Post />
    </>
  );
}
export default function World() {
  const scene = useGame((s) => s.scene);
  return scene === 'ship' ? <ShipScene /> : <ShoreScene />;
}
