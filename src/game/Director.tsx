import { useEffect } from 'react';
import { useGame } from '../managers/store';
import { clearDialogue } from '../managers/DialogueManager';
import { stopWaves } from '../managers/audio';
import { runChapter1, Cancelled } from '../story/chapter1';

/** Runs the story script for the current run. Cancelled cleanly on retry, quit or unmount. */
export default function Director() {
  const screen = useGame((s) => s.screen), runId = useGame((s) => s.runId);
  useEffect(() => {
    if (screen !== 'game') return;
    const sig = { c: false };
    runChapter1(useGame.getState().startAt, sig).catch((e) => { if (!(e instanceof Cancelled)) console.error(e); });
    return () => { sig.c = true; clearDialogue(); stopWaves(); };
  }, [screen, runId]);
  return null;
}
