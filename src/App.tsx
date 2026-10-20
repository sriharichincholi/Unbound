import { useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import Ocean from './game/Ocean';
import World from './game/World';
import Director from './game/Director';
import Title from './components/Title';
import MainMenu from './components/MainMenu';
import CharacterSelect from './components/CharacterSelect';
import Settings from './components/Settings';
import PauseMenu from './components/PauseMenu';
import Prologue from './components/Prologue';
import HUD from './components/HUD';
import DialogueToast from './components/DialogueToast';
import Overlays from './components/Overlays';
import { useGame } from './managers/store';
import { loadSettings } from './managers/SaveManager';
import { QUALITY } from './game/quality';

/** Night storm backdrop shared by title, menu and select screens (lightning is driven inside <Ocean/>). */
function StormBackdrop() {
  useFrame(({ camera, clock }) => {
    camera.position.set(0, 3 + Math.sin(clock.elapsedTime * 0.6) * 0.4, 14);
    camera.lookAt(0, 2, 0);
  });
  return (
    <>
      <color attach="background" args={['#0b1220']} />
      <fogExp2 attach="fog" args={['#0b1220', 0.03]} />
      <ambientLight intensity={0.3} />
      <Ocean size={300} />
    </>
  );
}

export default function App() {
  const screen = useGame((s) => s.screen), quality = useGame((s) => s.quality), runId = useGame((s) => s.runId);
  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { if (screen !== 'game') document.exitPointerLock?.(); }, [screen]);
  return (
    <>
      {screen === 'prologue' ? <Prologue /> : (
        <Canvas key={screen === 'game' ? `game-${runId}` : 'menu'} shadows dpr={QUALITY[quality].dpr} camera={{ fov: 60, near: 0.1, far: 600 }}>
          {screen === 'game' ? <World /> : <StormBackdrop />}
        </Canvas>
      )}
      <Title /><MainMenu /><CharacterSelect /><Settings /><PauseMenu /><HUD /><DialogueToast /><Overlays /><Director />
    </>
  );
}
