import { useGame } from '../managers/store';

/** Cut-to-black fade, cinematic captions for stage directions, and the end-of-chapter card. */
export default function Overlays() {
  const screen = useGame((s) => s.screen), blackout = useGame((s) => s.blackout), caption = useGame((s) => s.caption), chapterCard = useGame((s) => s.chapterCard), set = useGame((s) => s.set);
  if (screen !== 'game') return null;
  return (
    <>
      <div className="fade" style={{ position: 'fixed', inset: 0, background: '#000', opacity: blackout ? 1 : 0, pointerEvents: 'none', zIndex: 15 }} />
      {caption && <div className="ui hud" style={{ zIndex: 16 }}><div className="cap" key={caption}>{caption}</div></div>}
      {chapterCard && (
        <div className="ui" style={{ background: 'rgba(0,0,0,.78)', display: 'grid', placeItems: 'center', zIndex: 35 }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/art/ch_1.png" alt="" style={{ width: 'min(60vw,520px)', border: '2px solid #8a7240' }} />
            <h1 style={{ letterSpacing: '.2em', margin: '16px 0 4px' }}>CHAPTER I — THE DEAD SHORE</h1>
            <h3 style={{ margin: 0, color: '#c9a95c', letterSpacing: '.3em' }}>COMPLETE</h3>
            <p style={{ opacity: 0.75 }}>Next: Chapter II — The Green Silence</p>
            <button className="btn" onClick={() => { document.exitPointerLock?.(); set({ chapterCard: false, locked: false }); }}>Keep Exploring</button>
            <button className="btn" onClick={() => set({ chapterCard: false, locked: false, screen: 'menu' })}>Main Menu</button>
          </div>
        </div>
      )}
    </>
  );
}
