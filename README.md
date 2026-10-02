# Gnist ⚡

**Se det. Forstå det.** · *See it. Understand it.*

Gnist is an interactive, bilingual (Norwegian / English) learning tool for electronics.
It is built for students who understand things by watching them move: turn a knob, see
the current change, add a harmonic and watch the square wave sharpen.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

Other scripts:

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Typecheck and build a static site into `dist/` |
| `npm run preview`   | Serve the built site locally                   |
| `npm run typecheck` | TypeScript only                                |

## What is in it

Two tracks, chosen from the front page. Every page exists in Norwegian (`/nb/…`) and English (`/en/…`).

**Circuit lab** (`/circuits`) – the core. A Falstad-style drawing board: pick a tool, drag on the grid,
and the circuit runs as you draw. Wires, resistors, capacitors, inductors, batteries, AC sources,
switches and ground. Voltage shows as colour, conventional current as moving dots, and any element
can be pinned to a scope strip showing voltage and current over time. The simulator is a Modified
Nodal Analysis engine with trapezoidal companion models (`src/sim/engine.ts`), linear elements only
for now, verified against RC, LRC resonance and AC impedance cases. The board autosaves to
`localStorage`. Hotkeys: W R C L V A S G for tools, Esc to select, Delete, Space to pause.

**Theory** (`/circuits/learn`) – interactive explanations: Ohm's law, resistor/inductor/capacitor
with phase and impedance plots, RC and RL step response, series and parallel.

**Signals** (`/signals`) – Fourier series as rotating epicycles converging on square, sawtooth and
triangle waves, and a sine builder showing time and frequency domains side by side.

## Deploy (gnist.tools on Cloudflare Workers)

The site is static and is served for free as Cloudflare Workers static assets, built from this repo
by Workers Builds. The Worker is configured in `wrangler.jsonc`: assets come from `dist`, and
`not_found_handling: single-page-application` returns `index.html` for client-side routes so a hard
refresh on `/signals/fourier` works. Do not add a `_redirects` file; Workers rejects a catch-all
redirect as a loop.

- Build command `npm run build`, deploy command `npx wrangler deploy`, Node from `.node-version`.
- `npm run build` typechecks, builds the client, builds an SSR bundle and runs `scripts/prerender.mjs`,
  which writes static HTML for every route in both languages plus `sitemap.xml` and `robots.txt`.
  Each page carries its own title, description, canonical, hreflang, Open Graph and JSON-LD tags
  (copy lives in `src/seo/pages.ts`). The client hydrates the prerendered markup.
- `html_handling: drop-trailing-slash` keeps canonical URLs without a trailing slash.
- Production branch is `main`. Every merge to `main` builds and deploys.
- The custom domain `gnist.tools` is attached under the Worker's Domains tab.

## Conventions

- The language is part of the URL. `/` hops to the visitor's stored or browser language.
- Voltage is written **U** in Norwegian and **V** in English, following each tradition.
- Resistors are drawn as the IEC rectangle in Norwegian and the ANSI zigzag in English.
- Language and light/dark theme are remembered in `localStorage`.

## Stack

Vite + React + TypeScript. No charting or math libraries: every visualisation is plain
SVG or Canvas in `src/viz/`, so it can be tuned freely. Strings live in
`src/i18n/strings.ts`; add a key there and it is available in both languages.

```
src/
  i18n/        language provider (URL-driven) and the NB/EN dictionary
  seo/         head manager, per-page titles and descriptions
  sim/         circuit simulator: types, MNA engine, example circuits
  components/  layout, slider, formula, readouts, callouts, language-aware links
  viz/         circuit symbols, current dots, plot, spectrum, epicycles, lab board and scopes
  lib/         Fourier coefficients, SI formatting and parsing, animation hook
  pages/       one file per page, under circuits/ and signals/
  entry-server.tsx   SSR entry used by scripts/prerender.mjs
```

## Roadmap ideas

- Diodes, transistors and op-amps in the lab (needs a Newton loop in the engine).
- Share a circuit by URL.
- Class A/B amplifier: bias, crossover distortion, an audio signal through the stage.
- AC phasor view and RLC resonance.
- Thévenin / Norton, Kirchhoff's laws with a small node solver.
- Sampling, aliasing and the discrete Fourier transform.
