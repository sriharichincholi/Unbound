export type HeroId = 'takeshi' | 'elara' | 'agniv' | 'maeve' | 'kofi';
export interface Hero {
  id: HeroId; name: string; title: string; color: string; weapon: string;
  stats: { power: number; speed: number; magic: number; guard: number };
  abilities: [string, string, string]; // Q, E, R
  abilityCost: [number, number, number]; abilityCd: [number, number, number]; abilityRadius: [number, number, number];
  lore: string;
}
export const HEROES: Record<HeroId, Hero> = {
  takeshi: { id: 'takeshi', name: 'Takeshi', title: 'Voidcaller', color: '#7b5cff', weapon: 'Crescent blade',
    stats: { power: 7, speed: 8, magic: 7, guard: 4 }, abilities: ['Void Blink', 'Spatial Rift', 'Eclipse Strike'],
    abilityCost: [20, 30, 60], abilityCd: [4, 8, 20], abilityRadius: [2, 4, 6],
    lore: 'A wanderer who tore a seam in the world and never sewed it shut.' },
  elara: { id: 'elara', name: 'Elara', title: 'Celestial Orbis', color: '#7fd8ff', weapon: 'Floating luminous orb',
    stats: { power: 4, speed: 6, magic: 10, guard: 5 }, abilities: ['Astral Bolt', 'Healing Light', 'Astral Veil'],
    abilityCost: [15, 35, 55], abilityCd: [3, 10, 22], abilityRadius: [3, 3, 7],
    lore: 'Keeper of a captive star, sworn to read the sky for the dying.' },
  agniv: { id: 'agniv', name: 'Agniv', title: 'Phoenix Gauntlets', color: '#ff6a1a', weapon: 'Fiery gauntlets',
    stats: { power: 9, speed: 7, magic: 5, guard: 6 }, abilities: ['Flame Dash', 'Cinder Burst', 'Inferno Rebirth'],
    abilityCost: [20, 30, 70], abilityCd: [4, 9, 25], abilityRadius: [2.5, 4, 8],
    lore: 'A forge-born brawler whose hands remember every fire that raised him.' },
  maeve: { id: 'maeve', name: 'Maeve', title: 'Spectral Fang', color: '#6fe0a0', weapon: 'Phasing dagger',
    stats: { power: 6, speed: 10, magic: 6, guard: 3 }, abilities: ['Phase Step', 'Spirit Summon', 'Wild Hunt'],
    abilityCost: [15, 30, 60], abilityCd: [3, 9, 20], abilityRadius: [2, 4, 7],
    lore: 'A hunter of the green dark who walks beside the spirits she calls.' },
  kofi: { id: 'kofi', name: 'Kofi', title: 'Terra Hammer', color: '#c2a165', weapon: 'Massive stone hammer',
    stats: { power: 10, speed: 4, magic: 4, guard: 9 }, abilities: ['Stone Guard', 'Seismic Wave', 'Earthshatter'],
    abilityCost: [20, 35, 70], abilityCd: [5, 10, 25], abilityRadius: [2.5, 5, 9],
    lore: 'A mountain-raised smith who carries the weight of a fallen citadel.' },
};
export const HERO_LIST = Object.values(HEROES);
