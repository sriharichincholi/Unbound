import { useGame, type Quality } from '../managers/store';
import { saveSettings } from '../managers/SaveManager';

export default function Settings() {
  const screen = useGame((s) => s.screen), quality = useGame((s) => s.quality), inPause = useGame((s) => s.paused && s.pauseSettings), set = useGame((s) => s.set);
  const open = screen === 'settings' || screen === 'credits' || (screen === 'game' && inPause);
  if (!open) return null;
  const back = () => (screen === 'game' ? set({ pauseSettings: false }) : set({ screen: 'menu' }));
  return (
    <div className="ui" style={{ zIndex: 40 }}><div className="panel">
      {screen !== 'credits' ? <>
        <h2>Graphics Quality</h2>
        {(['Low', 'Medium', 'High', 'Epic'] as Quality[]).map((q) => <button key={q} className="btn" style={{ color: q === quality ? '#ffcf5a' : undefined }} onClick={() => { set({ quality: q }); saveSettings(); }}>{q}</button>)}
        <p style={{ opacity: 0.7 }}>Scales shadow resolution, ocean mesh density, rain/particle budget and post-processing passes.</p>
      </> : <><h2>Credits</h2><p>UNBOUND: The Heretic's Relic</p><p style={{ opacity: 0.7 }}>Concept art and story: project owner.</p></>}
      <button className="btn" onClick={back}>Back</button>
    </div></div>
  );
}
