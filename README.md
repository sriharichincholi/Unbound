# UNBOUND: The Heretic's Relic — build 2
Run: `npm install` then `npm run dev` (http://localhost:5173). Build: `npm run build`.
Deploy: Vercel (vercel.json SPA rewrite) or Render Static Site (build `npm run build`, publish `dist`).

Controls: click canvas to lock mouse · WASD · Shift sprint · Space roll (i-frames) · LMB light / RMB heavy · Q/E/R abilities · Esc or P = pause.

Flow: Title -> Menu -> New Game -> Character Select -> Prologue (skip with Esc/Enter/Space) -> Chapter I
(ship approach, shark attack, Alpha Shark, ship breaks, the shore) -> Chapter I complete card.

Story text lives in `src/story/script.ts`, bark pools in `src/managers/Barks.ts`, the Chapter I director in `src/story/chapter1.ts`.
Art in `public/art/` was cropped from the story-flow infographic (portraits, logo, chapter thumbnails).
