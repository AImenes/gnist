import type { Lang } from '../i18n/strings'

/** Per-route SEO copy. Keys are app paths without the language prefix. */
export const PAGE_META: Record<string, Record<Lang, { title: string; description: string }>> = {
  '/': {
    nb: {
      title: 'Gnist – lær kretsteori og signalteori ved å se det',
      description:
        'Gratis, interaktiv kretssimulator og visuelle forklaringer av elektronikk: Ohms lov, motstand, spole, kondensator, RC-kretser, Fourierrekker og frekvensdomene. På norsk og engelsk.',
    },
    en: {
      title: 'Gnist – learn circuit theory and signal theory by seeing it',
      description:
        'Free interactive circuit simulator and visual explanations of electronics: Ohm’s law, resistors, inductors, capacitors, RC circuits, Fourier series and the frequency domain. In English and Norwegian.',
    },
  },
  '/circuits': {
    nb: {
      title: 'Kretslab – tegn og simuler elektriske kretser i nettleseren | Gnist',
      description:
        'Tegn din egen krets med motstander, spoler, kondensatorer, batterier, vekselkilder og brytere. Se strømmen flyte, spenningen i farger og kurver i et oscilloskop. Gratis, uten installasjon.',
    },
    en: {
      title: 'Circuit lab – draw and simulate electric circuits in the browser | Gnist',
      description:
        'Draw your own circuit with resistors, inductors, capacitors, batteries, AC sources and switches. Watch current flow, see voltage as colour and read the waveforms on a scope. Free, no install.',
    },
  },
  '/circuits/learn': {
    nb: { title: 'Kretsteori – interaktive forklaringer | Gnist', description: 'Ohms lov, motstand, spole og kondensator, RC- og RL-sprangrespons, serie og parallell. Vri på en knapp og se hva som skjer.' },
    en: { title: 'Circuit theory – interactive explanations | Gnist', description: 'Ohm’s law, resistor, inductor and capacitor, RC and RL step response, series and parallel. Turn a knob and watch what happens.' },
  },
  '/circuits/ohm': {
    nb: { title: 'Ohms lov forklart med animasjon: U = R · I | Gnist', description: 'Interaktiv forklaring av Ohms lov. Lås spenning, strøm eller motstand, dra i de andre, og se strømmen i kretsen endre seg. Med effekt P = U · I.' },
    en: { title: 'Ohm’s law explained with animation: V = R · I | Gnist', description: 'Interactive explanation of Ohm’s law. Lock voltage, current or resistance, drag the others, and watch the current in the loop change. With power P = V · I.' },
  },
  '/circuits/components': {
    nb: { title: 'Motstand, spole og kondensator – hva de gjør, visuelt | Gnist', description: 'Hvordan en motstand, en spole og en kondensator reagerer på likespenning og vekselspenning. Faseforskyvning på 90° og impedans mot frekvens, animert.' },
    en: { title: 'Resistor, inductor and capacitor – what they do, visually | Gnist', description: 'How a resistor, an inductor and a capacitor respond to DC and AC. The 90° phase shift and impedance versus frequency, animated.' },
  },
  '/circuits/step': {
    nb: { title: 'RC- og RL-kretser: lading, tidskonstant τ og sprangrespons | Gnist', description: 'Se en kondensator lades og en spole magnetiseres når bryteren lukkes. Tidskonstanten τ = RC og τ = L/R forklart med animerte kurver.' },
    en: { title: 'RC and RL circuits: charging, time constant τ and step response | Gnist', description: 'Watch a capacitor charge and an inductor energise when the switch closes. The time constant τ = RC and τ = L/R explained with animated curves.' },
  },
  '/circuits/series-parallel': {
    nb: { title: 'Motstander i serie og parallell – strøm og spenning fordelt | Gnist', description: 'Hvordan tre motstander kombineres i serie og parallell, hva ekvivalent motstand blir, og hvordan strøm og spenning fordeler seg. Animert.' },
    en: { title: 'Resistors in series and parallel – how current and voltage split | Gnist', description: 'How three resistors combine in series and parallel, what the equivalent resistance becomes, and how current and voltage divide. Animated.' },
  },
  '/signals': {
    nb: { title: 'Signalteori – Fourierrekker, tids- og frekvensdomene | Gnist', description: 'Alt periodisk er bygget av sinuser. Interaktive forklaringer av Fourierrekker, harmoniske, spektrum og sammenhengen mellom tid og frekvens.' },
    en: { title: 'Signal theory – Fourier series, time and frequency domain | Gnist', description: 'Everything periodic is made of sines. Interactive explanations of Fourier series, harmonics, spectra and the link between time and frequency.' },
  },
  '/signals/fourier': {
    nb: { title: 'Fourierrekker med roterende sirkler: se en firkantbølge bli til | Gnist', description: 'Episykel-animasjon av Fourierrekker. Hver sirkel er ett sinusledd; legg til flere og se sporet konvergere mot firkant-, sagtann- eller trekantbølge. Med spektrum.' },
    en: { title: 'Fourier series with rotating circles: watch a square wave emerge | Gnist', description: 'Epicycle animation of Fourier series. Each circle is one sine term; add more and watch the trace converge to a square, sawtooth or triangle wave. With spectrum.' },
  },
  '/signals/builder': {
    nb: { title: 'Bygg et signal av sinuser – tidsdomene og frekvensdomene | Gnist', description: 'Legg til sinuser med amplitude, frekvens og fase og se tidskurven og linjespekteret side om side. Svevning, firkant og sagtann som forhåndsvalg.' },
    en: { title: 'Build a signal from sines – time domain and frequency domain | Gnist', description: 'Add sines with amplitude, frequency and phase and see the time curve and the line spectrum side by side. Beat, square and sawtooth presets.' },
  },
}

export const ROUTES = Object.keys(PAGE_META)
