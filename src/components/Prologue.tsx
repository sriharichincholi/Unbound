import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Ocean, { lightning } from '../game/Ocean';
import Ship from '../game/Ship';
import Rain from '../game/Rain';
import { Peaks, Post } from '../game/World';
import { fx, resetFx } from '../game/fx';
import { useGame } from '../managers/store';
import { sayLines, sleep, clearDialogue, Prio } from '../managers/DialogueManager';
import { PROLOGUE_VO } from '../story/script';
import { startWaves, stopWaves, thunder } from '../managers/audio';
import { QUALITY } from '../game/quality';

type K = { t: number; p: [number, number, number]; l: [number, number, number] };
const KEYS: K[] = [
  { t: 0, p: [-12, 2.2, -14], l: [0, 3, 2] },
  { t: 4.5, p: [-9, 3, -6], l: [0, 3, 4] },
  { t: 9.5, p: [-3, 5.5, -14], l: [0, 20, 210] }, // pan from the struggling ship to the island and its two peaks
];
const P = new THREE.Vector3(), Lk = new THREE.Vector3();
function pathAt(t: number) {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1], u = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1), s = u * u * (3 - 2 * u);
  P.set(...a.p).lerp(new THREE.Vector3(...b.p), s); Lk.set(...a.l).lerp(new THREE.Vector3(...b.l), s);
}
function Rig() {
  useFrame(({ camera }, dt) => {
    if (fx.proPlay) fx.proT += dt;
    pathAt(fx.proT); camera.position.copy(P); camera.lookAt(Lk);
    camera.position.x += Math.sin(performance.now() / 700) * 0.12; // handheld sway
  });
  return null;
}
function Scene() {
  const q = QUALITY[useGame((s) => s.quality)];
  const moon = useRef<THREE.DirectionalLight>(null!);
  useFrame(() => { moon.current.intensity = 0.9 + lightning.flash * 3; });
  return (
    <>
      <color attach="background" args={['#0d1626']} /><fogExp2 attach="fog" args={['#0d1626', 0.016]} />
      <hemisphereLight args={['#5a6f9a', '#1a1018', 1.0]} />
      <directionalLight ref={moon} position={[8, 20, 10]} color="#aab8e0" shadow-mapSize={[q.shadow, q.shadow]} />
      <Ship rock={2.4} scale={0.55} /><Ocean size={500} y={-1.2} amp={1.1} /><Peaks /><Rain /><Post /><Rig />
    </>
  );
}

/** PROLOGUE - THE CALL: black screen + Elara's V.O., lightning, the ship in the storm, the island's twin peaks, title card. */
export default function Prologue() {
  const [stage, setStage] = useState<'black' | 'sea' | 'title' | 'out'>('black');
  const [flash, setFlash] = useState(false);
  const alive = useRef(true);
  const finish = () => {
    if (!alive.current) return; alive.current = false;
    clearDialogue(); stopWaves(); fx.proPlay = false;
    const s = useGame.getState(); s.set({ screen: 'game', startAt: 'intro', runId: s.runId + 1, paused: false });
  };
  useEffect(() => {
    resetFx(); clearDialogue(); const W = async (ms: number) => { await sleep(ms); if (!alive.current) throw new Error('skip'); };
    (async () => {
      startWaves(); await W(1500); thunder();                        // [SFX: distant thunder] [heavy ocean waves]
      await sayLines(PROLOGUE_VO, Prio.Cutscene); if (!alive.current) return;
      await W(600);
      setFlash(true); thunder(); fx.proPlay = true; setStage('sea'); await W(250); setFlash(false); // [Lightning strikes.] CUT TO: the ocean
      await W(9500);
      setStage('title'); thunder(); await W(5200);                   // TITLE CARD
      setStage('out'); await W(1600); finish();
    })().catch(() => { /* skipped */ });
    const key = (e: KeyboardEvent) => { if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') finish(); };
    addEventListener('keydown', key);
    return () => { alive.current = false; removeEventListener('keydown', key); clearDialogue(); stopWaves(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Canvas dpr={QUALITY[useGame.getState().quality].dpr} camera={{ fov: 60, near: 0.1, far: 600 }}><Scene /></Canvas>
      <div className="fade" style={{ position: 'fixed', inset: 0, background: '#000', opacity: stage === 'black' || stage === 'out' ? 1 : 0, zIndex: 5, pointerEvents: 'none', transitionDuration: stage === 'sea' ? '1.4s' : '1.2s' }} />
      <div style={{ position: 'fixed', inset: 0, background: '#fff', opacity: flash ? 0.9 : 0, transition: flash ? 'none' : 'opacity .5s', zIndex: 6, pointerEvents: 'none' }} />
      {stage === 'title' && (
        <div className="ui hud" style={{ zIndex: 7, display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <img className="logo" src="/art/logo.png" alt="UNBOUND" style={{ animation: 'slam .5s cubic-bezier(.2,2,.4,1) both' }} />
            <div className="sub">THE ISLAND OF VEYRA</div>
          </div>
        </div>
      )}
      <button className="btn" style={{ position: 'fixed', right: 20, top: 14, zIndex: 30, fontSize: 16, opacity: 0.7 }} onClick={finish}>SKIP ▸</button>
    </>
  );
}
