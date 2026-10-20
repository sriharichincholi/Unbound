import { say, sayLines, Prio } from './DialogueManager';
import { useGame } from './store';
import type { L } from '../story/script';

const COMBAT: L[] = [
  ['AGNIV', 'Come on!'], ['KOFI', 'Behind you!'], ['ELARA', 'Left side!'], ['MAEVE', "They're surrounding us!"], ['TAKESHI', 'Stay together.'],
  ['AGNIV', 'More coming!'], ['KOFI', 'Then let them come!'], ['ELARA', "I've got you covered!"], ['MAEVE', 'Behind you!'], ['TAKESHI', 'Keep moving!'],
];
const LOW_HEALTH: L[] = [
  ['KOFI', "You're hurt. Fall back!"], ['ELARA', 'Stay with me!'], ['AGNIV', "Don't you dare drop now!"], ['MAEVE', "Get up. We're not done."], ['TAKESHI', 'Focus.'],
];
const MULTI_KILL: L[] = [['AGNIV', "That's more like it!"], ['MAEVE', "Don't celebrate yet."]];
const MAJOR_KILL: L[] = [
  ['AGNIV', 'Was that supposed to be difficult?'], ['MAEVE', 'You nearly fell off a cliff.'], ['AGNIV', "But I didn't."],
  ['KOFI', "That's your standard?"], ['AGNIV', "It's a good standard."],
];
const UNKNOWN_AREA: L[] = [
  ['ELARA', "This place wasn't abandoned."], ['MAEVE', 'No.'], ['TAKESHI', 'Something left it.'],
  ['KOFI', "Then let's hope it stays gone."], ['AGNIV', 'You really know how to make a place feel welcoming.'],
];
export type BarkKind = 'combat' | 'lowHealth' | 'multiKill' | 'majorKill' | 'unknownArea';
let last = 0;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Dynamic dialogue during gameplay. Never talks over a line that is already on screen. */
export function bark(kind: BarkKind, force = false) {
  const g = useGame.getState();
  if (g.screen !== 'game' || g.paused) return;
  const now = performance.now();
  if (!force && (g.current || g.queue.length || now - last < 5000)) return;
  last = now;
  if (kind === 'combat') { const [w, t] = pick(COMBAT); say(w, t, Prio.Ambient); }
  else if (kind === 'lowHealth') { const [w, t] = pick(LOW_HEALTH); say(w, t, Prio.StoryBanter); }
  else if (kind === 'multiKill') void sayLines(MULTI_KILL, Prio.StoryBanter);
  else if (kind === 'majorKill') void sayLines(MAJOR_KILL, Prio.StoryBanter);
  else void sayLines(UNKNOWN_AREA, Prio.StoryBanter);
}
