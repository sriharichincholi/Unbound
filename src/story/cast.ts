export interface CastInfo { img?: string; color: string }
export const CAST: Record<string, CastInfo> = {
  TAKESHI: { img: '/art/takeshi.png', color: '#8a9cff' },
  ELARA: { img: '/art/elara.png', color: '#7fd8ff' },
  AGNIV: { img: '/art/agniv.png', color: '#ff9a3a' },
  MAEVE: { img: '/art/maeve.png', color: '#ff6a9a' },
  KOFI: { img: '/art/kofi.png', color: '#e0b050' },
  CAEL: { img: '/art/cael.png', color: '#8fd08a' },
  SILAS: { img: '/art/silas.png', color: '#ff6a5a' },
};
/** "ELARA (V.O.)" -> ELARA. Unknown speakers get the default gold and no portrait. */
export function castOf(name: string): CastInfo {
  const k = name.replace(/\s*\(.*\)$/, '').toUpperCase();
  return CAST[k] ?? { color: '#c9a95c' };
}
