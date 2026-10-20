import { useGame } from '../managers/store';
import { HEROES } from '../game/heroes';
import { CAST } from '../story/cast';
import { playerState } from '../game/combat';

const Bar = ({ v, color, w }: { v: number; color: string; w: number }) => (
  <div className="bar" style={{ width: w }}><i style={{ background: color, transform: `scaleX(${Math.max(0, v) / 100})` }} />
    <span style={{ position: 'absolute', left: -6, top: -9, color: '#8a7240', fontSize: 11 }}>◆</span><span style={{ position: 'absolute', right: -6, bottom: -9, color: '#8a7240', fontSize: 11 }}>◆</span></div>
);
export default function HUD() {
  const { screen, hp, stamina, energy, cd, hero, objective, objDone, boss, set } = useGame();
  if (screen !== 'game') return null;
  const h = HEROES[hero];
  const retry = () => {
    const ph = useGame.getState().phase;
    set({ startAt: ph === 'intro' ? 'intro' : ph === 'shore' ? 'shore' : 'sharks', runId: useGame.getState().runId + 1, hp: 100, paused: false });
  };
  return (
    <div className="ui hud">
      <div style={{ position: 'absolute', left: 24, top: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
        <img className="avatar" style={{ borderColor: h.color }} src={CAST[h.name.toUpperCase()].img} alt="" />
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar v={hp} color="linear-gradient(#e03a3a,#8a0f1a)" w={300} /><Bar v={energy} color="linear-gradient(#5fe6ff,#1a6f8a)" w={230} /><Bar v={stamina} color="linear-gradient(#ffd45a,#9a6f12)" w={260} />
        </div>
      </div>
      <div style={{ position: 'absolute', right: 24, top: 20, width: 110, height: 110, borderRadius: '50%', border: '3px solid #8a7240', background: 'rgba(10,12,18,.7)' }}>
        <div style={{ position: 'absolute', left: 51, top: 51, width: 8, height: 8, background: '#ffcf5a', borderRadius: '50%' }} />
        <small style={{ position: 'absolute', bottom: -22, width: '100%', textAlign: 'center' }}>{Math.round(playerState.pos.x)}, {Math.round(playerState.pos.z)}</small>
      </div>
      <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', textShadow: '0 0 8px #000' }}>
        {objective && <><div style={{ fontSize: 12, letterSpacing: '.3em', color: '#c9a95c' }}>OBJECTIVE</div><div style={{ fontSize: 18, letterSpacing: '.12em' }}>◆ {objective}</div></>}
        {objDone.slice(-3).map((o, i) => <div key={i} style={{ fontSize: 12, opacity: 0.6, letterSpacing: '.1em' }}>✓ {o}</div>)}
      </div>
      {boss && (
        <div style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 'min(560px,60vw)', textAlign: 'center' }}>
          <div style={{ letterSpacing: '.3em', fontSize: 14, textShadow: '0 0 8px #000' }}>{boss.name}</div>
          <div className="bar" style={{ height: 14 }}><i style={{ background: 'linear-gradient(#c01f2a,#5a0a12)', transform: `scaleX(${boss.hp / boss.max})` }} /></div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 24, bottom: 24, display: 'flex', gap: 14 }}>
        {['Q', 'E', 'R'].map((k, i) => <div key={k} className="slot" title={h.abilities[i]} style={{ borderColor: h.color }}>{['✦', '✺', '☄'][i]}<s style={{ transform: `scaleY(${cd[i]})` }} /><b>{k}</b></div>)}
      </div>
      <small style={{ position: 'absolute', right: 20, bottom: 14, opacity: 0.55 }}>Click to lock mouse · WASD · Shift sprint · Space roll · LMB/RMB attack · Q/E/R · Esc/P pause</small>
      {hp <= 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}><h1 style={{ color: '#c1121f', fontSize: 72, margin: 0 }}>YOU DIED</h1>
            <button className="btn" onClick={() => { document.exitPointerLock?.(); retry(); }}>Retry from checkpoint</button>
            <button className="btn" onClick={() => { document.exitPointerLock?.(); set({ hp: 100, screen: 'menu' }); }}>Return to Menu</button></div>
        </div>
      )}
    </div>
  );
}
