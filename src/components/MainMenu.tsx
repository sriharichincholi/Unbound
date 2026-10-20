import { useState } from 'react';
import { useGame } from '../managers/store';
import { hasSave, loadSave, resetProgress } from '../managers/SaveManager';

export default function MainMenu() {
  const screen = useGame((s) => s.screen), set = useGame((s) => s.set);
  const [step, setStep] = useState(0); // 0 closed, 1 first confirm, 2 final confirm
  const [, bump] = useState(0);
  if (screen !== 'menu') return null;
  const save = hasSave();
  return (
    <div className="ui">
      <div className="menu">
        <button disabled={!save} onClick={() => loadSave()}>Continue</button>
        <button onClick={() => set({ screen: 'select' })}>New Game</button>
        <button disabled={!save} onClick={() => loadSave()}>Load Game</button>
        <button onClick={() => set({ screen: 'select' })}>Character Select</button>
        <button onClick={() => set({ screen: 'settings' })}>Settings</button>
        <button onClick={() => set({ screen: 'credits' })}>Credits</button>
        <button disabled={!save} style={{ color: '#c1121f' }} onClick={() => setStep(1)}>Reset Progress</button>
      </div>
      {step > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', display: 'grid', placeItems: 'center' }}>
          <div className="panel" style={{ position: 'static', maxWidth: 480, textAlign: 'center' }}>
            <h2 style={{ color: '#c1121f' }}>{step === 1 ? 'RESET ALL PROGRESS?' : 'ARE YOU ABSOLUTELY SURE?'}</h2>
            <p>{step === 1 ? 'This will permanently erase your story progress.' : 'Press RESET once more to erase everything. This cannot be undone.'}</p>
            <button className="btn" onClick={() => setStep(0)}>CANCEL</button>
            <button className="btn" style={{ color: '#c1121f' }} onClick={() => { if (step === 1) setStep(2); else { resetProgress(); setStep(0); bump((n) => n + 1); } }}>RESET</button>
          </div>
        </div>
      )}
    </div>
  );
}
