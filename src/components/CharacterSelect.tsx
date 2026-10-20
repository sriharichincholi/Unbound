import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { HERO_LIST, HEROES, type HeroId } from '../game/heroes';
import Character, { newMotion } from '../game/Character';
import { useGame } from '../managers/store';
import { CAST } from '../story/cast';

function Preview({ id }: { id: HeroId }) {
  const g = useRef<THREE.Group>(null!), motion = useRef(newMotion()).current;
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.7; });
  return <group ref={g} position-y={-1}><Character id={id} motion={motion} /></group>;
}
export default function CharacterSelect() {
  const screen = useGame((s) => s.screen), hero = useGame((s) => s.hero), set = useGame((s) => s.set);
  if (screen !== 'select') return null;
  const h = HEROES[hero];
  return (
    <div className="ui"><div className="panel" style={{ display: 'grid', gridTemplateColumns: '230px 1fr 1fr', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {HERO_LIST.map((x) => (
          <button key={x.id} className="btn" style={{ color: x.id === hero ? '#ffcf5a' : undefined, display: 'flex', gap: 10, alignItems: 'center', padding: 4 }} onClick={() => set({ hero: x.id })}>
            <img className="avatar" style={{ width: 48, height: 48, borderColor: x.id === hero ? '#ffcf5a' : '#5b4a2a' }} src={CAST[x.name.toUpperCase()].img} alt="" />
            <span style={{ fontSize: 20 }}>{x.name}<br /><small style={{ fontSize: 13, opacity: 0.8 }}>{x.title}</small></span>
          </button>
        ))}
      </div>
      <Canvas camera={{ position: [0, 0.6, 4.6], fov: 40 }} style={{ height: 400, background: 'radial-gradient(#1c2740,#0a0e18)' }}>
        <ambientLight intensity={0.8} /><directionalLight position={[3, 4, 4]} intensity={2.2} /><pointLight position={[-3, 1, 2]} intensity={25} color={h.color} />
        <Preview id={hero} />
      </Canvas>
      <div>
        <h1 style={{ margin: 0, color: h.color }}>{h.name}</h1><h3 style={{ marginTop: 0 }}>{h.title}</h3>
        <p><i>{h.lore}</i></p><p><b>Weapon:</b> {h.weapon}</p>
        <p><b>Abilities:</b> Q {h.abilities[0]} · E {h.abilities[1]} · R {h.abilities[2]}</p>
        {Object.entries(h.stats).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 70 }}>{k}</span>
            <div className="bar" style={{ flex: 1, height: 8 }}><i style={{ background: h.color, transform: `scaleX(${(v as number) / 10})` }} /></div></div>
        ))}
        <br />
        <button className="btn" onClick={() => set({ startAt: 'intro', runId: useGame.getState().runId + 1, screen: 'prologue', scene: 'ship', phase: 'intro', paused: false })}>Begin Journey</button>
        <button className="btn" onClick={() => set({ screen: 'menu' })}>Back</button>
      </div>
    </div></div>
  );
}
