import { useEffect } from 'react';
import { useGame } from '../managers/store';

/** UNBOUND logo (taken from the concept art) slams in with a screen shake; chains lower into the menu. */
export default function Title() {
  const screen = useGame((s) => s.screen), set = useGame((s) => s.set);
  useEffect(() => { if (screen !== 'title') return; const t = setTimeout(() => set({ screen: 'menu' }), 4800); return () => clearTimeout(t); }, [screen, set]);
  if (screen !== 'title' && screen !== 'menu') return null;
  return (
    <div className="ui" onClick={() => screen === 'title' && set({ screen: 'menu' })}>
      <div className="chain" style={{ left: '12%' }} /><div className="chain" style={{ right: '12%' }} />
      <div className="title" style={screen === 'menu' ? { top: '4%', animation: 'none' } : undefined}>
        <img className="logo" src="/art/logo.png" alt="UNBOUND" style={screen === 'menu' ? { width: 'min(46vw,460px)' } : undefined} />
      </div>
    </div>
  );
}
