import { create } from 'zustand';
import type { HeroId } from '../game/heroes';

export type Screen = 'title' | 'menu' | 'select' | 'settings' | 'credits' | 'prologue' | 'game';
export type Quality = 'Low' | 'Medium' | 'High' | 'Epic';
export type StartAt = 'intro' | 'sharks' | 'shore';
export interface Line { id: number; speaker: string; text: string; prio: number; ms: number; color?: string; img?: string }

interface State {
  screen: Screen; hero: HeroId; quality: Quality; chapter: number;
  scene: 'ship' | 'shore'; phase: string; startAt: StartAt; runId: number;
  objective: string; objDone: string[];
  hp: number; stamina: number; energy: number; cd: [number, number, number];
  queue: Line[]; current: Line | null;
  paused: boolean; pauseSettings: boolean; locked: boolean; blackout: boolean;
  caption: string | null; boss: { name: string; hp: number; max: number } | null; chapterCard: boolean;
  lastCp: { milestone: string; startAt: StartAt } | null;
  set: (p: Partial<State>) => void;
}
export const useGame = create<State>((set) => ({
  screen: 'title', hero: 'takeshi', quality: 'High', chapter: 1,
  scene: 'ship', phase: 'intro', startAt: 'intro', runId: 0,
  objective: '', objDone: [],
  hp: 100, stamina: 100, energy: 100, cd: [0, 0, 0], queue: [], current: null,
  paused: false, pauseSettings: false, locked: false, blackout: false,
  caption: null, boss: null, chapterCard: false, lastCp: null,
  set: (p) => set(p),
}));

export function setObjective(text: string) {
  const s = useGame.getState();
  const done = s.objective && s.objective !== text ? [...s.objDone, s.objective] : s.objDone;
  useGame.setState({ objective: text, objDone: done });
}
export function completeObjective() {
  const s = useGame.getState();
  if (s.objective) useGame.setState({ objDone: [...s.objDone, s.objective], objective: '' });
}
let capT: ReturnType<typeof setTimeout> | undefined;
export function caption(text: string, ms = 3200) {
  clearTimeout(capT); useGame.setState({ caption: text });
  capT = setTimeout(() => useGame.setState({ caption: null }), ms);
}
