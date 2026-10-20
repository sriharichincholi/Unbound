import type { Quality } from '../managers/store';
export const QUALITY: Record<Quality, { shadow: number; particles: number; bloom: boolean; vignette: boolean; dpr: number; oceanRes: number }> = {
  Low: { shadow: 512, particles: 40, bloom: false, vignette: false, dpr: 0.75, oceanRes: 48 },
  Medium: { shadow: 1024, particles: 100, bloom: true, vignette: false, dpr: 1, oceanRes: 96 },
  High: { shadow: 2048, particles: 200, bloom: true, vignette: true, dpr: 1.5, oceanRes: 160 },
  Epic: { shadow: 4096, particles: 400, bloom: true, vignette: true, dpr: 2, oceanRes: 256 },
};
