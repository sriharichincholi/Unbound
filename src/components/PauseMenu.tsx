import { useState } from 'react';
import { useGame, caption } from '../managers/store';
import { saveGame } from '../managers/SaveManager';

export default function PauseMenu() {
  const screen = useGame((s) => s.screen), paused = useGame((s) => s.paused), ps = useGame((s) => s.pauseSettings), set = useGame((s) => s.set);
  const [msg, setMsg] = useState('');
  if (screen !== 'game' || !paused || ps) return null;
  return (
    <div className="ui" style={{ background: 'rgba(0,0,0,.55)', zIndex: 30 }}>
      <div className="menu" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', alignItems: 'center', minWidth: 280 }}>
        <h2 style={{ margin: '0 0 8px', letterSpacing: '.2em' }}>PAUSED</h2>
        <button onClick={() => set({ paused: false })}>RESUME</button>
        <button onClick={() => { setMsg(saveGame() ? 'Checkpoint saved.' : 'Nothing to save yet.'); }}>SAVE GAME</button>
        <button onClick={() => set({ pauseSettings: true })}>SETTINGS</button>
        <button onClick={() => { caption(''); set({ paused: false, screen: 'menu', locked: false, blackout: false, boss: null, chapterCard: false }); }}>QUIT TO MENU</button>
        <small style={{ opacity: 0.8, minHeight: 18 }}>{msg}</small>
      </div>
    </div>
  );
}
