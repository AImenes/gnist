export type Lang = 'nb' | 'en'

const en = {
  // App / nav
  'app.name': 'Gnist',
  'app.tagline': 'circuit + signal lab',
  'nav.home': 'Home',
  'nav.circuits': 'Circuit lab',
  'nav.learn': 'Theory',
  'nav.signals': 'Signals',
  'nav.lang': 'Language',
  'footer.note': 'free + open · for students who learn by seeing',

  // Home
  'home.kicker': 'Circuits · Signals · NB / EN',
  'home.hero.a': 'Electronics you can',
  'home.hero.b': 'poke at.',
  'home.hero.sub': 'A circuit simulator and visual theory for students. Draw it, run it, watch the current move.',
  'home.circuits.title': 'Circuit theory',
  'home.circuits.sub': 'Draw your own circuit and watch it run. Wires, resistors, coils, capacitors, switches, scopes.',
  'home.signals.title': 'Signal theory',
  'home.signals.sub': 'Sine waves, Fourier series, time and frequency domains. Watch circles draw a square wave.',
  'home.start': 'Open the lab',
  'home.start.signals': 'Start here',
  'home.pick': 'Pick a track',

  // Common
  'common.play': 'Play',
  'common.pause': 'Pause',
  'common.reset': 'Reset',
  'common.speed': 'Speed',
  'common.intuition': 'Intuition',
  'common.formula': 'Formula',
  'common.tryThis': 'Try this',
  'common.topics': 'Topics',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.time': 'Time',
  'common.timeDomain': 'Time domain',
  'common.freqDomain': 'Frequency domain',
  'common.amplitude': 'Amplitude',
  'common.frequency': 'Frequency',
  'common.phase': 'Phase',
  'common.harmonic': 'Harmonic',
  'common.terms': 'Terms',
  'common.locked': 'computed',
  'common.lock': 'Compute this one',

  // Quantities
  'q.voltage': 'Voltage',
  'q.current': 'Current',
  'q.resistance': 'Resistance',
  'q.power': 'Power',
  'q.capacitance': 'Capacitance',
  'q.inductance': 'Inductance',
  'q.timeConstant': 'Time constant',
  'q.impedance': 'Impedance',

  // Circuits index
  'circuits.title': 'Circuit theory',
  'circuits.sub': 'Fundamentals first, then the components one by one. Every page is something you can drag.',
  'circuits.ohm.title': 'Ohm’s law',
  'circuits.ohm.sub': 'How voltage, current and resistance pull on each other.',
  'circuits.components.title': 'Resistor, inductor, capacitor',
  'circuits.components.sub': 'What each component does, and how it reacts when things change.',
  'circuits.rc.title': 'RC and RL step response',
  'circuits.rc.sub': 'Charging a capacitor, energising an inductor, and the time constant τ.',
  'circuits.sp.title': 'Series and parallel',
  'circuits.sp.sub': 'How resistors combine, and where the current and voltage go.',

  // Ohm's law page
  'ohm.lead':
    'A battery pushes charge around a loop. The push is voltage. The flow is current. The resistor decides how much flow a given push produces.',
  'ohm.intuition':
    'Think of a water hose. Voltage is the pressure from the tap, current is how much water comes out, and resistance is how narrow the hose is. Squeeze the hose (more resistance) and less water flows for the same pressure.',
  'ohm.try':
    'Lock current and increase the resistance. The battery must push harder to keep the same flow. Then lock voltage: more resistance means fewer dots moving through the loop.',
  'ohm.dots': 'The moving dots show conventional current: speed and density scale with the current.',
  'ohm.power': 'Power dissipated in the resistor as heat',

  // Components page
  'comp.lead':
    'Three components, three personalities. The resistor just obeys. The capacitor resists change in voltage. The inductor resists change in current.',
  'comp.R.name': 'Resistor',
  'comp.R.unit': 'ohm (Ω)',
  'comp.R.law': 'Voltage is proportional to current. Always. Instantly.',
  'comp.R.intuition':
    'The resistor has no memory. Whatever current flows right now sets the voltage right now. It turns electrical energy into heat.',
  'comp.R.viz': 'Voltage–current line. The slope is the resistance.',
  'comp.C.name': 'Capacitor',
  'comp.C.unit': 'farad (F)',
  'comp.C.law': 'Current flows only while the voltage is changing.',
  'comp.C.intuition':
    'Two plates storing charge. To change the voltage across it you must move charge onto the plates, and that takes time. Fast changes pass easily; a steady voltage means zero current. At DC a capacitor is an open circuit, at high frequency it is nearly a short.',
  'comp.C.viz': 'Apply a sine voltage. The current leads the voltage by 90°: it peaks where the voltage changes fastest.',
  'comp.L.name': 'Inductor',
  'comp.L.unit': 'henry (H)',
  'comp.L.law': 'Voltage appears only while the current is changing.',
  'comp.L.intuition':
    'A coil of wire with a magnetic field. The field stores energy, and it fights any change in current. At DC an inductor is just a wire, at high frequency it is nearly open.',
  'comp.L.viz': 'Apply a sine current. The voltage leads the current by 90°: it peaks where the current changes fastest.',
  'comp.imp.title': 'Impedance vs frequency',
  'comp.imp.sub': 'How much each component “resists” an AC signal, depending on frequency.',
  'comp.imp.note': 'Log–log axes. R is flat, C falls with frequency, L rises with frequency.',
  'comp.wave.applied': 'applied',
  'comp.wave.result': 'response',

  // RC / RL page
  'rc.lead':
    'Close a switch and connect a battery to a resistor and a capacitor. Nothing jumps. The capacitor voltage climbs along a curve, and the shape of that curve is the same every time: an exponential with time constant τ.',
  'rc.intuition':
    'At the first instant the capacitor is empty, so all the voltage lands on the resistor and the current is at its maximum. As the capacitor fills, less voltage is left for the resistor and the current drops. After one τ you are 63% of the way. After five τ you are, for all practical purposes, done.',
  'rc.try':
    'Double R or double C and watch τ double. Then switch to RL: the roles of voltage and current swap places.',
  'rc.mode.rc': 'RC: charge a capacitor',
  'rc.mode.rl': 'RL: energise an inductor',
  'rc.switch': 'Switch closes at t = 0',
  'rc.markers': 'Dashed lines mark 1τ (63%) and 5τ (99%).',

  // Series / parallel page
  'sp.lead':
    'Resistors in series share the same current and split the voltage. Resistors in parallel share the same voltage and split the current.',
  'sp.intuition':
    'Series: one path, so the current has no choice and every resistor sees all of it. More resistors, more total resistance. Parallel: several paths, so the current spreads out. More paths, less total resistance, always less than the smallest branch.',
  'sp.try':
    'In parallel, set one resistor very small. Almost all current takes that path, and the total resistance collapses toward it.',
  'sp.series': 'Series',
  'sp.parallel': 'Parallel',
  'sp.total': 'Equivalent resistance',
  'sp.totalCurrent': 'Total current',
  'sp.perResistor': 'Per resistor',

  // Signals index
  'signals.title': 'Signal theory',
  'signals.sub': 'Everything periodic is made of sines. Watch it happen.',
  'signals.fourier.title': 'Fourier series with rotating circles',
  'signals.fourier.sub': 'Stack spinning arms and watch their tip draw a square wave.',
  'signals.builder.title': 'Build a signal from sines',
  'signals.builder.sub': 'Add sines, tune amplitude, frequency and phase, and see time and frequency domains side by side.',

  // Fourier page
  'fourier.lead':
    'Each circle is one sine term. Its radius is the amplitude A, and it spins at angular speed ω = 2πf. Chain the circles tip to tail, trace the end point over time, and the sum of sines draws a wave. Add more arms and the wave converges toward the target shape.',
  'fourier.intuition':
    'A square wave needs only the odd harmonics (1, 3, 5, …), each one weaker by 1/n. That is why the smaller circles spin faster and faster: they are adding the sharp corners. The ripple near the edges that never quite disappears is the Gibbs phenomenon.',
  'fourier.try':
    'Set terms to 1 and you see a plain sine. Step up one at a time. Notice how term 2 is skipped for the square and triangle waves, because even harmonics cancel in symmetric shapes.',
  'fourier.wave.square': 'Square',
  'fourier.wave.sawtooth': 'Sawtooth',
  'fourier.wave.triangle': 'Triangle',
  'fourier.target': 'Show target wave',
  'fourier.terms': 'Number of terms',
  'fourier.spectrum': 'Spectrum: amplitude of each harmonic',
  'fourier.circles': 'Rotating arms (epicycles)',
  'fourier.trace': 'Trace of the tip over time',
  'fourier.series': 'Series',

  // Builder page
  'builder.lead':
    'A signal in the time domain is a curve. The same signal in the frequency domain is a list: which sines, how strong, and how shifted. Both views describe exactly the same thing.',
  'builder.intuition':
    'The time plot shows what an oscilloscope sees. The frequency plot shows what a spectrum analyser sees. Adding a high, weak sine barely moves the time curve but shows up clearly as its own bar in the spectrum.',
  'builder.try':
    'Load the “Square” preset and remove the highest term. Then shift the phase of one component by 90° and watch the time curve change while the spectrum magnitudes stay the same.',
  'builder.add': 'Add sine',
  'builder.remove': 'Remove',
  'builder.presets': 'Presets',
  'builder.preset.single': 'Single sine',
  'builder.preset.beat': 'Beat (two close tones)',
  'builder.preset.square': 'Square (5 terms)',
  'builder.preset.saw': 'Sawtooth (5 terms)',
  'builder.sum': 'Sum of all sines',
  'builder.components': 'Components',
  'builder.showParts': 'Show individual sines',
  // Circuit lab
  'lab.title': 'Circuit lab',
  'lab.tool.select': 'Select',
  'lab.el.wire': 'Wire',
  'lab.el.resistor': 'Resistor',
  'lab.el.capacitor': 'Capacitor',
  'lab.el.inductor': 'Inductor',
  'lab.el.dc': 'Battery',
  'lab.el.ac': 'AC source',
  'lab.el.switch': 'Switch',
  'lab.el.ground': 'Ground',
  'lab.running': 'Running',
  'lab.paused': 'Paused',
  'lab.reset.hint': 'Back to t = 0, discharge everything',
  'lab.examples': 'Examples',
  'lab.ex.rc': 'RC charging',
  'lab.ex.lrc': 'LRC ring',
  'lab.ex.divider': 'Voltage divider',
  'lab.ex.acrc': 'AC through a capacitor',
  'lab.ex.parallel': 'Parallel resistors',
  'lab.clear': 'Clear board',
  'lab.learn': 'Theory',
  'lab.sim': 'Simulation',
  'lab.simSpeed': 'Simulation speed',
  'lab.currentSpeed': 'Current dot speed',
  'lab.selected': 'Selection',
  'lab.hint': 'Pick a tool and drag on the board to draw. Click a component to edit it, drag it to move, drag its endpoints to resize. Click a switch to flip it. Delete removes, Space pauses.',
  'lab.value': 'Value',
  'lab.switch.open': 'Open the switch',
  'lab.switch.close': 'Close the switch',
  'lab.flip': 'Flip polarity',
  'lab.scope.add': 'Show in scope',
  'lab.scope.remove': 'Remove from scope',
  'lab.delete': 'Delete',
  'lab.legend': 'Reading the board',
  'lab.legend.pos': 'positive voltage',
  'lab.legend.neg': 'negative voltage',
  'lab.legend.dots': 'conventional current, speed ∝ I',
  'lab.error.singular': 'The circuit cannot be solved: a source is shorted or two sources fight each other.',
  'lab.empty': 'Empty board. Pick a tool above and drag to draw, or load an example.',
  'notfound.title': 'Nothing on this node',
  'notfound.sub': 'The page you asked for does not exist. The circuit is open.',
  // Theory index sections
  'learn.sec.fund': 'Fundamentals',
  'learn.sec.comp': 'Components',
  'circuits.opamp.title': 'Op-amp',
  'circuits.opamp.sub': 'Two golden rules, four circuits, and what happens at the supply rails.',

  // Op-amp page
  'opamp.lead':
    'An op-amp amplifies the difference between its two inputs by an enormous factor. Alone, that just slams the output into a supply rail. Close the loop with resistors and the resistors, not the chip, set the gain.',
  'opamp.rules': 'The two golden rules',
  'opamp.rule1': 'No current flows into either input.',
  'opamp.rule2': 'With negative feedback, the output does whatever it takes to make V+ equal V−.',
  'opamp.cfg.inverting': 'Inverting',
  'opamp.cfg.noninverting': 'Non-inverting',
  'opamp.cfg.follower': 'Follower',
  'opamp.cfg.comparator': 'Comparator',
  'opamp.cfg.inverting.desc': 'Input through Rin into the − pin, Rf feeds the output back. Gain is −Rf/Rin and the − pin sits at 0 V: a virtual ground.',
  'opamp.cfg.noninverting.desc': 'Input on the + pin, a divider from the output sets the − pin. Gain is 1 + Rf/R1, never below one, and the input draws no current.',
  'opamp.cfg.follower.desc': 'Output wired straight to the − pin. Gain is exactly one. Useless on paper, essential in practice: it copies a voltage without loading the source.',
  'opamp.cfg.comparator.desc': 'No feedback at all. The output is at +Vcc when Vin is above Vref and at −Vcc below it. An analog signal becomes a digital one.',
  'opamp.intuition.inverting':
    'Rule 2 pins the − input at 0 V because the + input is grounded. Rule 1 says the current through Rin has nowhere to go but through Rf. So Vin/Rin = −Vout/Rf, and the ratio of the resistors is the gain. Watch V− stay at zero while everything else moves.',
  'opamp.intuition.noninverting':
    'The output rises until the divider Rf–R1 brings the − pin up to Vin. The divider ratio is R1/(R1+Rf), so the output must be Vin times the inverse: 1 + Rf/R1. Set Rf to zero and you get the follower.',
  'opamp.intuition.follower':
    'With the output tied to the − pin, rule 2 forces Vout = Vin directly. The point is current, not voltage: the source feeding the + pin supplies nothing, while the output can drive a heavy load. It is an impedance converter.',
  'opamp.intuition.comparator':
    'Without feedback the enormous open-loop gain is all that is left. A few microvolts of difference saturate the output, so it lives at one rail or the other. Real comparators add a little hysteresis to stop chatter around the threshold.',
  'opamp.try':
    'Push the gain up until the output hits the rails: the sine becomes a trapezoid. That flat top is clipping, the sound of every overdriven guitar amp. Then lower Vcc and watch the rails close in on the signal.',
  'opamp.supply': 'Supply rails',
  'opamp.vin': 'Input amplitude',
  'opamp.vref': 'Reference',
  'opamp.gain': 'Gain',
  'opamp.clipping': 'Clipping: the output wants to reach {peak} but the rails are at ±{vcc}. The peaks are cut flat.',
  'opamp.if': 'if',
  'opamp.else': 'otherwise',
} as const

export type StringKey = keyof typeof en

const nb: Record<StringKey, string> = {
  'app.name': 'Gnist',
  'app.tagline': 'krets- og signallab',
  'nav.home': 'Hjem',
  'nav.circuits': 'Kretslab',
  'nav.learn': 'Teori',
  'nav.signals': 'Signaler',
  'nav.lang': 'Språk',
  'footer.note': 'gratis + åpent · for studenter som lærer ved å se',

  'home.kicker': 'Kretser · Signaler · NB / EN',
  'home.hero.a': 'Elektronikk du kan',
  'home.hero.b': 'pirke på.',
  'home.hero.sub': 'En kretssimulator og visuell teori for studenter. Tegn den, kjør den, se strømmen bevege seg.',
  'home.circuits.title': 'Kretsteori',
  'home.circuits.sub': 'Tegn din egen krets og se den gå. Ledninger, motstander, spoler, kondensatorer, brytere, skop.',
  'home.signals.title': 'Signalteori',
  'home.signals.sub': 'Sinusbølger, Fourierrekker, tids- og frekvensdomene. Se sirkler tegne en firkantbølge.',
  'home.start': 'Åpne laben',
  'home.start.signals': 'Start her',
  'home.pick': 'Velg et spor',

  'common.play': 'Spill av',
  'common.pause': 'Pause',
  'common.reset': 'Nullstill',
  'common.speed': 'Hastighet',
  'common.intuition': 'Intuisjon',
  'common.formula': 'Formel',
  'common.tryThis': 'Prøv dette',
  'common.topics': 'Emner',
  'common.back': 'Tilbake',
  'common.next': 'Neste',
  'common.time': 'Tid',
  'common.timeDomain': 'Tidsdomene',
  'common.freqDomain': 'Frekvensdomene',
  'common.amplitude': 'Amplitude',
  'common.frequency': 'Frekvens',
  'common.phase': 'Fase',
  'common.harmonic': 'Harmonisk',
  'common.terms': 'Ledd',
  'common.locked': 'beregnes',
  'common.lock': 'Beregn denne',

  'q.voltage': 'Spenning',
  'q.current': 'Strøm',
  'q.resistance': 'Motstand',
  'q.power': 'Effekt',
  'q.capacitance': 'Kapasitans',
  'q.inductance': 'Induktans',
  'q.timeConstant': 'Tidskonstant',
  'q.impedance': 'Impedans',

  'circuits.title': 'Kretsteori',
  'circuits.sub': 'Grunnlaget først, så komponentene én etter én. Hver side er noe du kan dra i.',
  'circuits.ohm.title': 'Ohms lov',
  'circuits.ohm.sub': 'Hvordan spenning, strøm og motstand drar i hverandre.',
  'circuits.components.title': 'Motstand, spole, kondensator',
  'circuits.components.sub': 'Hva hver komponent gjør, og hvordan den reagerer når noe endrer seg.',
  'circuits.rc.title': 'RC- og RL-sprangrespons',
  'circuits.rc.sub': 'Lading av en kondensator, magnetisering av en spole, og tidskonstanten τ.',
  'circuits.sp.title': 'Serie og parallell',
  'circuits.sp.sub': 'Hvordan motstander kombineres, og hvor strømmen og spenningen går.',

  'ohm.lead':
    'Et batteri dytter ladning rundt i en sløyfe. Dyttet er spenning. Flyten er strøm. Motstanden bestemmer hvor mye flyt et gitt dytt gir.',
  'ohm.intuition':
    'Tenk på en hageslange. Spenning er trykket fra kranen, strøm er hvor mye vann som kommer ut, og motstand er hvor trang slangen er. Klem på slangen (mer motstand) og mindre vann flyter ved samme trykk.',
  'ohm.try':
    'Lås strømmen og øk motstanden. Batteriet må dytte hardere for å holde samme flyt. Lås så spenningen: mer motstand gir færre prikker som beveger seg gjennom sløyfen.',
  'ohm.dots': 'Prikkene viser konvensjonell strømretning: fart og tetthet skalerer med strømmen.',
  'ohm.power': 'Effekt som avsettes som varme i motstanden',

  'comp.lead':
    'Tre komponenter, tre personligheter. Motstanden bare adlyder. Kondensatoren motsetter seg endring i spenning. Spolen motsetter seg endring i strøm.',
  'comp.R.name': 'Motstand',
  'comp.R.unit': 'ohm (Ω)',
  'comp.R.law': 'Spenningen er proporsjonal med strømmen. Alltid. Umiddelbart.',
  'comp.R.intuition':
    'Motstanden har ikke hukommelse. Strømmen som flyter akkurat nå bestemmer spenningen akkurat nå. Den gjør elektrisk energi om til varme.',
  'comp.R.viz': 'Spenning–strøm-linje. Stigningen er motstanden.',
  'comp.C.name': 'Kondensator',
  'comp.C.unit': 'farad (F)',
  'comp.C.law': 'Strøm flyter bare mens spenningen endrer seg.',
  'comp.C.intuition':
    'To plater som lagrer ladning. For å endre spenningen over den må du flytte ladning inn på platene, og det tar tid. Raske endringer slipper lett gjennom; en konstant spenning gir null strøm. Ved DC er en kondensator et brudd, ved høy frekvens er den nesten en kortslutning.',
  'comp.C.viz': 'Påtrykk en sinusspenning. Strømmen ligger 90° foran spenningen: den topper der spenningen endrer seg raskest.',
  'comp.L.name': 'Spole',
  'comp.L.unit': 'henry (H)',
  'comp.L.law': 'Spenning oppstår bare mens strømmen endrer seg.',
  'comp.L.intuition':
    'En trådvikling med et magnetfelt. Feltet lagrer energi, og det kjemper mot enhver endring i strømmen. Ved DC er en spole bare en ledning, ved høy frekvens er den nesten et brudd.',
  'comp.L.viz': 'Påtrykk en sinusstrøm. Spenningen ligger 90° foran strømmen: den topper der strømmen endrer seg raskest.',
  'comp.imp.title': 'Impedans mot frekvens',
  'comp.imp.sub': 'Hvor mye hver komponent «motstår» et vekselsignal, avhengig av frekvensen.',
  'comp.imp.note': 'Logaritmiske akser. R er flat, C faller med frekvensen, L stiger med frekvensen.',
  'comp.wave.applied': 'påtrykt',
  'comp.wave.result': 'respons',

  'rc.lead':
    'Lukk en bryter og koble et batteri til en motstand og en kondensator. Ingenting hopper. Kondensatorspenningen klatrer langs en kurve, og formen på kurven er den samme hver gang: en eksponentialfunksjon med tidskonstant τ.',
  'rc.intuition':
    'I første øyeblikk er kondensatoren tom, så hele spenningen lander på motstanden og strømmen er på sitt største. Etter hvert som kondensatoren fylles, blir det mindre spenning igjen til motstanden og strømmen synker. Etter én τ er du 63 % på vei. Etter fem τ er du i praksis ferdig.',
  'rc.try':
    'Doble R eller doble C og se at τ dobles. Bytt så til RL: spenning og strøm bytter roller.',
  'rc.mode.rc': 'RC: lad en kondensator',
  'rc.mode.rl': 'RL: magnetiser en spole',
  'rc.switch': 'Bryteren lukkes ved t = 0',
  'rc.markers': 'Stiplede linjer markerer 1τ (63 %) og 5τ (99 %).',

  'sp.lead':
    'Motstander i serie deler samme strøm og fordeler spenningen. Motstander i parallell deler samme spenning og fordeler strømmen.',
  'sp.intuition':
    'Serie: én vei, så strømmen har ikke noe valg og hver motstand ser hele strømmen. Flere motstander, mer total motstand. Parallell: flere veier, så strømmen sprer seg. Flere veier, mindre total motstand, alltid mindre enn den minste grenen.',
  'sp.try':
    'I parallell, sett én motstand veldig liten. Nesten all strøm tar den veien, og totalmotstanden kollapser mot den.',
  'sp.series': 'Serie',
  'sp.parallel': 'Parallell',
  'sp.total': 'Ekvivalent motstand',
  'sp.totalCurrent': 'Total strøm',
  'sp.perResistor': 'Per motstand',

  'signals.title': 'Signalteori',
  'signals.sub': 'Alt periodisk er bygget av sinuser. Se det skje.',
  'signals.fourier.title': 'Fourierrekker med roterende sirkler',
  'signals.fourier.sub': 'Stable roterende armer og se tuppen tegne en firkantbølge.',
  'signals.builder.title': 'Bygg et signal av sinuser',
  'signals.builder.sub': 'Legg til sinuser, juster amplitude, frekvens og fase, og se tids- og frekvensdomenet side om side.',

  'fourier.lead':
    'Hver sirkel er ett sinusledd. Radiusen er amplituden A, og den roterer med vinkelhastighet ω = 2πf. Lenk sirklene tupp til hale, følg endepunktet over tid, og summen av sinuser tegner en bølge. Legg til flere armer og bølgen konvergerer mot målformen.',
  'fourier.intuition':
    'En firkantbølge trenger bare de odde harmoniske (1, 3, 5, …), hver svakere med 1/n. Derfor roterer de små sirklene raskere og raskere: de legger til de skarpe hjørnene. Rippelen nær kantene som aldri helt forsvinner er Gibbs-fenomenet.',
  'fourier.try':
    'Sett ledd til 1 og du ser en ren sinus. Gå opp ett ledd om gangen. Legg merke til at ledd 2 hoppes over for firkant- og trekantbølgen, fordi like harmoniske kansellerer i symmetriske former.',
  'fourier.wave.square': 'Firkant',
  'fourier.wave.sawtooth': 'Sagtann',
  'fourier.wave.triangle': 'Trekant',
  'fourier.target': 'Vis målbølgen',
  'fourier.terms': 'Antall ledd',
  'fourier.spectrum': 'Spektrum: amplituden til hver harmoniske',
  'fourier.circles': 'Roterende armer (episykler)',
  'fourier.trace': 'Spor av tuppen over tid',
  'fourier.series': 'Rekke',

  'builder.lead':
    'Et signal i tidsdomenet er en kurve. Det samme signalet i frekvensdomenet er en liste: hvilke sinuser, hvor sterke, og hvor forskjøvet. Begge beskriver nøyaktig det samme.',
  'builder.intuition':
    'Tidsplottet viser det et oscilloskop ser. Frekvensplottet viser det en spektrumanalysator ser. En høy, svak sinus flytter knapt tidskurven, men dukker tydelig opp som sin egen stolpe i spekteret.',
  'builder.try':
    'Last inn «Firkant» og fjern det høyeste leddet. Forskyv så fasen til én komponent med 90° og se at tidskurven endrer seg mens stolpene i spekteret står stille.',
  'builder.add': 'Legg til sinus',
  'builder.remove': 'Fjern',
  'builder.presets': 'Forhåndsvalg',
  'builder.preset.single': 'Én sinus',
  'builder.preset.beat': 'Svevning (to nære toner)',
  'builder.preset.square': 'Firkant (5 ledd)',
  'builder.preset.saw': 'Sagtann (5 ledd)',
  'builder.sum': 'Sum av alle sinuser',
  'builder.components': 'Komponenter',
  'builder.showParts': 'Vis hver sinus',
  'lab.title': 'Kretslab',
  'lab.tool.select': 'Velg',
  'lab.el.wire': 'Ledning',
  'lab.el.resistor': 'Motstand',
  'lab.el.capacitor': 'Kondensator',
  'lab.el.inductor': 'Spole',
  'lab.el.dc': 'Batteri',
  'lab.el.ac': 'Vekselkilde',
  'lab.el.switch': 'Bryter',
  'lab.el.ground': 'Jord',
  'lab.running': 'Kjører',
  'lab.paused': 'Pause',
  'lab.reset.hint': 'Tilbake til t = 0, lad ut alt',
  'lab.examples': 'Eksempler',
  'lab.ex.rc': 'RC-lading',
  'lab.ex.lrc': 'LRC-ring',
  'lab.ex.divider': 'Spenningsdeler',
  'lab.ex.acrc': 'Veksel gjennom kondensator',
  'lab.ex.parallel': 'Parallelle motstander',
  'lab.clear': 'Tøm brettet',
  'lab.learn': 'Teori',
  'lab.sim': 'Simulering',
  'lab.simSpeed': 'Simuleringshastighet',
  'lab.currentSpeed': 'Fart på strømprikker',
  'lab.selected': 'Valgt',
  'lab.hint': 'Velg et verktøy og dra på brettet for å tegne. Klikk en komponent for å endre den, dra for å flytte, dra i endene for å endre lengde. Klikk en bryter for å vippe den. Delete sletter, mellomrom pauser.',
  'lab.value': 'Verdi',
  'lab.switch.open': 'Åpne bryteren',
  'lab.switch.close': 'Lukk bryteren',
  'lab.flip': 'Snu polaritet',
  'lab.scope.add': 'Vis i skop',
  'lab.scope.remove': 'Fjern fra skop',
  'lab.delete': 'Slett',
  'lab.legend': 'Slik leser du brettet',
  'lab.legend.pos': 'positiv spenning',
  'lab.legend.neg': 'negativ spenning',
  'lab.legend.dots': 'konvensjonell strøm, fart ∝ I',
  'lab.error.singular': 'Kretsen kan ikke løses: en kilde er kortsluttet, eller to kilder kjemper mot hverandre.',
  'lab.empty': 'Tomt brett. Velg et verktøy over og dra for å tegne, eller last inn et eksempel.',
  'notfound.title': 'Ingenting på denne noden',
  'notfound.sub': 'Siden du ba om finnes ikke. Kretsen er brutt.',
  'learn.sec.fund': 'Grunnlag',
  'learn.sec.comp': 'Komponenter',
  'circuits.opamp.title': 'Operasjonsforsterker',
  'circuits.opamp.sub': 'To gylne regler, fire koblinger, og hva som skjer ved forsyningsgrensene.',

  'opamp.lead':
    'En operasjonsforsterker forsterker forskjellen mellom de to inngangene med en enorm faktor. Alene gjør det bare at utgangen smeller i en forsyningsgrense. Lukk sløyfen med motstander, og det er motstandene, ikke brikken, som bestemmer forsterkningen.',
  'opamp.rules': 'De to gylne reglene',
  'opamp.rule1': 'Det går ingen strøm inn i noen av inngangene.',
  'opamp.rule2': 'Med negativ tilbakekobling gjør utgangen det som trengs for at V+ skal bli lik V−.',
  'opamp.cfg.inverting': 'Inverterende',
  'opamp.cfg.noninverting': 'Ikke-inverterende',
  'opamp.cfg.follower': 'Spenningsfølger',
  'opamp.cfg.comparator': 'Komparator',
  'opamp.cfg.inverting.desc': 'Inngang gjennom Rin til −-pinnen, Rf fører utgangen tilbake. Forsterkningen er −Rf/Rin, og −-pinnen ligger på 0 V: en virtuell jord.',
  'opamp.cfg.noninverting.desc': 'Inngang på +-pinnen, en deler fra utgangen setter −-pinnen. Forsterkningen er 1 + Rf/R1, aldri under én, og inngangen trekker ingen strøm.',
  'opamp.cfg.follower.desc': 'Utgangen koblet rett til −-pinnen. Forsterkningen er nøyaktig én. Ubrukelig på papiret, uunnværlig i praksis: den kopierer en spenning uten å belaste kilden.',
  'opamp.cfg.comparator.desc': 'Ingen tilbakekobling. Utgangen ligger på +Vcc når Vin er over Vref og på −Vcc under. Et analogt signal blir digitalt.',
  'opamp.intuition.inverting':
    'Regel 2 låser −-inngangen til 0 V fordi +-inngangen er jordet. Regel 1 sier at strømmen gjennom Rin ikke har noe annet sted å gå enn gjennom Rf. Dermed er Vin/Rin = −Vout/Rf, og forholdet mellom motstandene er forsterkningen. Se at V− står på null mens alt annet beveger seg.',
  'opamp.intuition.noninverting':
    'Utgangen stiger til deleren Rf–R1 løfter −-pinnen opp til Vin. Delerforholdet er R1/(R1+Rf), så utgangen må være Vin ganger det omvendte: 1 + Rf/R1. Sett Rf til null og du har spenningsfølgeren.',
  'opamp.intuition.follower':
    'Med utgangen knyttet til −-pinnen tvinger regel 2 fram Vout = Vin direkte. Poenget er strøm, ikke spenning: kilden som mater +-pinnen leverer ingenting, mens utgangen kan drive en tung last. Det er en impedansomformer.',
  'opamp.intuition.comparator':
    'Uten tilbakekobling er det bare den enorme åpne forsterkningen igjen. Noen få mikrovolt forskjell metter utgangen, så den ligger på den ene eller andre grensen. Ekte komparatorer legger til litt hysterese for å unngå skravling rundt terskelen.',
  'opamp.try':
    'Skru opp forsterkningen til utgangen treffer grensene: sinusen blir en trapes. Den flate toppen er klipping, lyden av alle overstyrte gitarforsterkere. Senk så Vcc og se grensene lukke seg om signalet.',
  'opamp.supply': 'Forsyningsgrenser',
  'opamp.vin': 'Inngangsamplitude',
  'opamp.vref': 'Referanse',
  'opamp.gain': 'Forsterkning',
  'opamp.clipping': 'Klipping: utgangen vil nå {peak}, men grensene ligger på ±{vcc}. Toppene kuttes flate.',
  'opamp.if': 'hvis',
  'opamp.else': 'ellers',
}

export const strings: Record<Lang, Record<StringKey, string>> = { en, nb }
