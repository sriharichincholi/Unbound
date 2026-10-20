import type { HeroId } from './heroes';
export type HairStyle = 'short' | 'spiky' | 'long' | 'bob' | 'curly';
export interface Look {
  skin: string; hair: string; style: HairStyle; top: string; coat: string; pants: string; boots: string;
  accent: string; eye: string; height: number; bulk: number; cape?: string;
}
/** Palettes follow the concept art: Takeshi navy/violet, Elara silver/ice-blue, Agniv earth/ember, Maeve crimson hair, Kofi stone/amber. */
export const LOOKS: Record<HeroId, Look> = {
  takeshi: { skin: '#f0cfb0', hair: '#17141f', style: 'short', top: '#1d2446', coat: '#2a3163', pants: '#14172a', boots: '#0d0e17', accent: '#8a6cff', eye: '#5b7cff', height: 1.0, bulk: 1.0, cape: '#1a1d3a' },
  elara: { skin: '#f6dcc8', hair: '#e3e9f7', style: 'long', top: '#d8ecff', coat: '#6fb4e8', pants: '#e8f1fb', boots: '#7a8fb0', accent: '#7fd8ff', eye: '#6fd0ff', height: 0.96, bulk: 0.86, cape: '#a9d8f5' },
  agniv: { skin: '#c58a5b', hair: '#2a1a10', style: 'curly', top: '#5d7d3b', coat: '#8a5a2a', pants: '#3b2b1b', boots: '#2a1a10', accent: '#ff8a2a', eye: '#ffb347', height: 1.04, bulk: 1.15 },
  maeve: { skin: '#f0c8b4', hair: '#d8305a', style: 'bob', top: '#5a1f35', coat: '#2b2030', pants: '#231a26', boots: '#150f18', accent: '#6fe0c0', eye: '#7fffd8', height: 0.98, bulk: 0.9, cape: '#3a1630' },
  kofi: { skin: '#6b4429', hair: '#14100c', style: 'short', top: '#8a6a3a', coat: '#5a4a30', pants: '#3a3a2e', boots: '#241c14', accent: '#e0a63a', eye: '#f0d090', height: 1.1, bulk: 1.32 },
};
