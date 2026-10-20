import { useGame } from '../managers/store';

export default function DialogueToast() {
  const line = useGame((s) => s.current);
  if (!line) return null;
  return (
    <div className="ui hud" style={{ zIndex: 20 }}><div className="toast" key={line.id}>
      {line.img ? <img className="avatar" style={{ borderColor: line.color }} src={line.img} alt="" />
        : <div className="avatar" style={{ borderColor: line.color, display: 'grid', placeItems: 'center', background: '#10141f', fontSize: 26 }}>{line.speaker[0]}</div>}
      <div><b style={{ color: line.color, letterSpacing: '.12em' }}>{line.speaker}</b><div style={{ fontStyle: 'italic', fontSize: 18 }}>{line.text}</div></div>
    </div></div>
  );
}
