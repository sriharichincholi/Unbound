import { useGame, type StartAt } from './store';
const KEY = 'unbound.save.v2', SETTINGS = 'unbound.settings.v1';
export interface SaveData { hero: string; chapter: number; milestone: string; startAt: StartAt; at: number }

export const hasSave = () => { try { return !!localStorage.getItem(KEY); } catch { return false; } };
export function readSave(): SaveData | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { return null; }
}
function write(milestone: string, startAt: StartAt) {
  const s = useGame.getState();
  const data: SaveData = { hero: s.hero, chapter: s.chapter, milestone, startAt, at: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage full or blocked */ }
}
/** Auto-checkpoint tied to a narrative milestone. */
export function checkpoint(milestone: string, startAt: StartAt) {
  useGame.setState({ lastCp: { milestone, startAt } }); write(milestone, startAt);
}
/** Manual save from the pause menu = re-save the latest checkpoint. */
export function saveGame() {
  const cp = useGame.getState().lastCp; if (cp) write(cp.milestone, cp.startAt);
  return !!cp;
}
export function loadSave(): boolean {
  const d = readSave(); if (!d) return false;
  const s = useGame.getState();
  s.set({ hero: d.hero as never, chapter: d.chapter, startAt: d.startAt, screen: 'game', runId: s.runId + 1, paused: false });
  return true;
}
export function resetProgress() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } useGame.setState({ lastCp: null }); }
export function saveSettings() { try { localStorage.setItem(SETTINGS, JSON.stringify({ quality: useGame.getState().quality })); } catch { /* ignore */ } }
export function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(SETTINGS) ?? 'null'); if (s?.quality) useGame.setState({ quality: s.quality }); } catch { /* ignore */ }
}
