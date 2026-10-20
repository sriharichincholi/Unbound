import { useGame, type Line } from './store';
import { castOf } from '../story/cast';
import type { L } from '../story/script';

/** Lower number = higher priority. Cutscene > Boss Taunts > Story Banter > Ambient */
export const Prio = { Cutscene: 0, BossTaunt: 1, StoryBanter: 2, Ambient: 3 } as const;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
const waiters = new Map<number, () => void>();
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function showNext() {
  clearTimeout(timer);
  const { queue } = useGame.getState();
  const line = queue[0] ?? null;
  useGame.setState({ current: line, queue: queue.slice(1) });
  if (line) timer = setTimeout(finish, line.ms);
}
function finish() {
  const cur = useGame.getState().current;
  if (cur) { const w = waiters.get(cur.id); waiters.delete(cur.id); w?.(); }
  showNext();
}

export function say(speaker: string, text: string, prio: number = Prio.StoryBanter, onDone?: () => void): number {
  const c = castOf(speaker);
  const line: Line = { id: nextId++, speaker, text, prio, color: c.color, img: c.img, ms: Math.max(2200, text.length * 55) };
  if (onDone) waiters.set(line.id, onDone);
  const { current, queue } = useGame.getState();
  const q = [...queue, line].sort((a, b) => a.prio - b.prio || a.id - b.id);
  if (!current) { useGame.setState({ queue: q }); showNext(); return line.id; }
  if (line.prio < current.prio) { useGame.setState({ queue: [current, ...q] }); showNext(); return line.id; } // pre-empt, current is re-queued
  useGame.setState({ queue: q });
  return line.id;
}
/** Plays lines one after another and resolves when the last one has finished. */
export async function sayLines(lines: L[], prio: number = Prio.Cutscene): Promise<void> {
  for (const [who, text] of lines) {
    if (who === '_pause') { await sleep(Number(text)); continue; }
    await new Promise<void>((res) => say(who, text, prio, res));
    await sleep(220);
  }
}
export function clearDialogue() { clearTimeout(timer); waiters.clear(); useGame.setState({ queue: [], current: null }); }
