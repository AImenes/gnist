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

## What is in the first version

Two tracks, chosen from the front page.

**Circuit theory** (`/circuits`)

1. **Ohm's law** – lock one of U, R, I and drag the other two. The loop shows conventional
   current as moving dots whose speed and density follow I. Power is shown too.
2. **Resistor, inductor, capacitor** – each component's defining equation, an animated
   applied/response wave that makes the 90° lead visible, and a log–log plot of |Z| versus
   frequency for all three.
3. **RC and RL step response** – a switch closes at t = 0; the capacitor fills (or the
   inductor's field grows) while the curves trace 1 − e^(−t/τ) with 1τ and 5τ marked.
4. **Series and parallel** – three resistors, both topologies, per-resistor U, I and P,
   and current dots that split between branches.

**Signal theory** (`/signals`)

1. **Fourier series with rotating circles** – the classic epicycle animation. Each term is
   an arm of radius A spinning at nω; the chained tip traces the wave on the right.
   Square, sawtooth and triangle targets, 1–30 terms, a live spectrum and the series
   written out.
2. **Build a signal from sines** – add up to seven sines with amplitude, frequency and
   phase, and see the time domain and the line spectrum side by side.

## Deploy (gnist.tools on Cloudflare Workers)

The site is static and is served for free as Cloudflare Workers static assets, built from this repo
by Workers Builds. The Worker is configured in `wrangler.jsonc`: assets come from `dist`, and
`not_found_handling: single-page-application` returns `index.html` for client-side routes so a hard
refresh on `/signals/fourier` works. Do not add a `_redirects` file; Workers rejects a catch-all
redirect as a loop.

- Build command `npm run build`, deploy command `npx wrangler deploy`, Node from `.node-version`.
- Production branch is `main`. Every merge to `main` builds and deploys.
- The custom domain `gnist.tools` is attached under the Worker's Domains tab.

## Conventions

- Voltage is written **U** in Norwegian and **V** in English, following each tradition.
- Resistors are drawn as the IEC rectangle in Norwegian and the ANSI zigzag in English.
- Language and light/dark theme are remembered in `localStorage`.

## Stack

Vite + React + TypeScript. No charting or math libraries: every visualisation is plain
SVG or Canvas in `src/viz/`, so it can be tuned freely. Strings live in
`src/i18n/strings.ts`; add a key there and it is available in both languages.

```
src/
  i18n/        language provider and the NB/EN dictionary
  components/  layout, slider, formula, readouts, callouts
  viz/         circuit symbols, current dots, plot, spectrum, epicycles
  lib/         Fourier coefficients, SI formatting, animation hook
  pages/       one file per topic, under circuits/ and signals/
```

## Roadmap ideas

- Class A/B amplifier: bias, crossover distortion, an audio signal through the stage.
- AC phasor view and RLC resonance.
- Thévenin / Norton, Kirchhoff's laws with a small node solver.
- Sampling, aliasing and the discrete Fourier transform.
