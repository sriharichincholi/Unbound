import * as THREE from 'three';
import { useGame, setObjective, caption, type StartAt } from '../managers/store';
import { sayLines, sleep, clearDialogue, Prio } from '../managers/DialogueManager';
import { checkpoint } from '../managers/SaveManager';
import { fx, resetFx, setCine, tweenCine } from '../game/fx';
import { enemies, playerState } from '../game/combat';
import { clearSharks } from '../game/Sharks';
import { rumble, crack, splash, startWaves, stopWaves } from '../managers/audio';
import { bark } from '../managers/Barks';
import type { L } from './script';
import * as S from './script';

export class Cancelled extends Error {}
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Prologue hand-off + Chapter I: ship approach (1.1), shark attack (1.2), the ship breaks (1.3), the shore (1.4). */
export async function runChapter1(startAt: StartAt, sig: { c: boolean }) {
  const G = () => useGame.getState();
  const chk = () => { if (sig.c) throw new Cancelled(); };
  const wait = async (ms: number) => { await sleep(ms); chk(); };
  const until = async (f: () => boolean) => { while (!f()) { await sleep(100); chk(); } };
  const say = async (l: L[], p: number = Prio.Cutscene) => { await sayLines(l, p); chk(); };
  const ramp = (k: 'calm' | 'dawn' | 'tilt', to: number, ms: number) => new Promise<void>((res) => {
    const from = fx[k], t0 = performance.now();
    const iv = setInterval(() => {
      if (sig.c) { clearInterval(iv); res(); return; }
      const u = Math.min(1, (performance.now() - t0) / ms); fx[k] = from + (to - from) * u;
      if (u >= 1) { clearInterval(iv); res(); }
    }, 33);
  });

  resetFx(); enemies.length = 0; clearDialogue();
  G().set({ hp: 100, stamina: 100, energy: 100, boss: null, locked: false, blackout: false, chapterCard: false, paused: false, caption: null, objective: '', objDone: [], chapter: 1 });

  if (startAt !== 'shore') {
    G().set({ scene: 'ship', phase: startAt === 'intro' ? 'intro' : 'sharks' }); startWaves();
    if (startAt === 'intro') {
      // SCENE 1.1 - APPROACHING VEYRA
      fx.formation = 'stand'; G().set({ locked: true, blackout: true }); setObjective('REACH VEYRA');
      setCine(V(0, 3.4, -8), V(0, 1.6, 7)); await wait(500); G().set({ blackout: false });
      const move = tweenCine(V(-5.2, 2.3, 10.8), V(0.3, 1.7, 7.2), 7); // camera moves along the deck to the five heroes
      await say(S.S1_1); await move; chk();
      caption('The ocean suddenly becomes unnaturally quiet.'); rumble(); void ramp('calm', 1, 2000); await wait(2800);
      caption('A gigantic shark erupts from the water.'); fx.eruptNow = true; fx.shake = 1.2; splash(); void ramp('calm', 0, 1200); await wait(1500);
      fx.formation = 'follow'; fx.cine.active = false; G().set({ locked: false });
      setObjective('SURVIVE THE SHARK ATTACK'); // REACH VEYRA is now ticked off
    } else setObjective('SURVIVE THE SHARK ATTACK');

    // SCENE 1.2 - SHARK ATTACK
    G().set({ phase: 'sharks' }); checkpoint('Shark encounter', 'sharks'); caption('Sharks begin circling the ship.');
    fx.wave = true; fx.kills = 0;
    void sayLines(S.S1_2_OPEN, Prio.Cutscene); // plays while the player is already fighting
    await until(() => fx.kills >= 3);
    setObjective('DEFEND THE SHIP'); void sayLines(S.S1_2_DEFEND, Prio.StoryBanter);
    await until(() => fx.kills >= 6);
    fx.wave = false; clearSharks(); void ramp('calm', 1, 1800); caption('The ocean suddenly becomes silent again.');
    await wait(2400); await say(S.S1_2_STOP);
    G().set({ phase: 'alpha' }); caption('The Alpha Shark erupts from the ocean.'); setObjective('DEFEAT THE ALPHA SHARK');
    fx.alphaGo = true; fx.shake = 1.2; rumble(); void ramp('calm', 0, 1500);
    await until(() => fx.alphaDead);
    G().set({ boss: null }); checkpoint('After the Alpha Shark', 'shore');

    // SCENE 1.3 - THE SHIP BREAKS
    G().set({ phase: 'break', locked: true }); crack(); fx.shake = 1.4; caption('The ship is severely damaged.'); void ramp('tilt', 0.1, 4500);
    await say(S.S1_3);
    caption('Everyone looks toward the island.', 2200); await wait(1800);
    G().set({ blackout: true }); stopWaves(); await wait(1800); // CUT TO BLACK
  }

  // SCENE 1.4 - THE SHORE
  resetFx(); enemies.length = 0; clearDialogue();
  G().set({ scene: 'shore', phase: 'shore', locked: true, blackout: true, boss: null, hp: Math.max(G().hp, 60) });
  setObjective('REACH THE SHORE');
  setCine(V(7, 2.2, 24), V(0, 1.6, 13)); await wait(900); G().set({ blackout: false });
  void ramp('dawn', 1, 9000); caption('Morning light begins to appear.'); await wait(2800);
  caption('The team reaches Veyra.'); checkpoint('Arrival at Veyra', 'shore'); await wait(1800);
  caption('Camera reveals abandoned structures and strange markings.', 4500);
  const pan = tweenCine(V(-5, 3, 6), V(0, 2.2, -10), 5);
  await say(S.S1_4); await pan; chk();
  fx.cine.active = false; G().set({ locked: false }); setObjective('EXPLORE THE ISLAND'); // REACH THE SHORE ticked off
  await until(() => Math.hypot(playerState.pos.x, playerState.pos.z + 14) < 9);
  bark('unknownArea', true); await wait(9000);
  checkpoint('Chapter I complete', 'shore'); G().set({ chapterCard: true, locked: true });
}
