function log10(x) { return Math.log(x) / Math.LN10; }

function decadeFloor(x) { return Math.floor(log10(x)); }
function decadeCeil(x) { return Math.ceil(log10(x)); }

// Generate one tick per decade between min and max (inclusive)
function generateDecadeTicks(minVal, maxVal) {
  const Jmin = Math.min(minVal, maxVal);
  const Jmax = Math.max(minVal, maxVal);
  const start = decadeFloor(Jmin);
  const end = decadeCeil(Jmax);
  const ticks = [];
  for (let k = start; k <= end; k++) {
    const v = Math.pow(10, k);
    if (v >= Jmin / 1.0000001 && v <= Jmax * 1.0000001) {
      ticks.push(v);
    }
  }
  // Ensure endpoints appear when not exact decades
  if (ticks.length === 0 || ticks[0] > Jmin) ticks.unshift(Jmin);
  if (ticks[ticks.length - 1] < Jmax) ticks.push(Jmax);
  return ticks;
}

function generateJTicks(Jmin, Jmax) {
  return generateDecadeTicks(Jmin, Jmax);
}

function formatJ(J) {
  // Show compact sci-notation with unit
  if (J === 0) return "0 J";
  const exp = Math.floor(log10(Math.abs(J)));
  const mant = J / Math.pow(10, exp);
  if (!isFinite(exp)) return `${J} J`;
  // Prefer concise: 1e-20 J
  if (Math.abs(mant - 1) < 1e-12) return `1e${exp} J`;
  return `${mant.toFixed(1)}e${exp} J`;
}

function formatEV(eV) {
  if (!isFinite(eV) || eV === 0) return `${eV}`;
  // Pure scientific notation for consistency
  return `${Number(eV).toExponential(2)} eV`;
}

function formatHz(Hz) {
  if (!isFinite(Hz) || Hz === 0) return `${Hz}`;
  if (!isFinite(Hz) || Hz === 0) return `${Hz}`;
  return `${Number(Hz).toExponential(2)} Hz`;
}

function formatK(K) {
  if (!isFinite(K) || K === 0) return `${K}`;
  if (!isFinite(K) || K === 0) return `${K}`;
  return `${Number(K).toExponential(2)} K`;
}

function formatUnitValue(unit, value) {
  switch (unit) {
    case 'eV': return formatEV(value);
    case 'Hz': return formatHz(value);
    case 'K': return formatK(value);
    case 'J': default: return formatJ(value);
  }
}

function axisTitleForUnit(unit) {
  if (UNIT_MAP[unit] && UNIT_MAP[unit].label) return UNIT_MAP[unit].label;
  return 'Energy';
}

function buildLayout(Jmin, Jmax, topUnit, independentTicks) {
  const jTicks = generateJTicks(Jmin, Jmax);
  let topTickValsJ;
  let topTickText;

  if (independentTicks) {
    // Generate ticks in unit space, then map to J positions for tickvals
    const uMin = UNIT_MAP[topUnit].fromJ(Jmin);
    const uMax = UNIT_MAP[topUnit].fromJ(Jmax);
    let unitTicks = generateDecadeTicks(uMin, uMax);
    // Remove edge ticks to reduce clutter
    unitTicks = unitTicks.filter(v => v > uMin * 1.0000001 && v < uMax / 1.0000001);
    topTickValsJ = unitTicks.map(v => UNIT_MAP[topUnit].toJ(v));
    topTickText = unitTicks.map(v => formatUnitValue(topUnit, v));
  } else {
    topTickValsJ = jTicks;
    topTickText = jTicks.map(J => formatUnitValue(topUnit, UNIT_MAP[topUnit].fromJ(J)));
  }

  return {
    margin: { l: 40, r: 40, t: 100, b: 50 },
    showlegend: false,
    hovermode: false,
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',

    xaxis: {
      title: { text: 'Energy (J)' },
      type: 'log',
      range: [Math.log10(Jmin), Math.log10(Jmax)],
      tickmode: 'array',
      tickvals: jTicks,
      ticktext: jTicks.map(formatJ),
      showgrid: !independentTicks,
      gridcolor: '#e2e8f0',
      zeroline: false,
      linecolor: '#334155',
      mirror: false,
      ticks: 'outside',
      ticklen: 6,
      tickcolor: '#334155',
      automargin: true,
      ticklabeloverflow: 'allow',
      ticklabelposition: 'outside bottom',
    },

    xaxis2: {
      title: { text: axisTitleForUnit(topUnit), standoff: 6 },
      overlaying: 'x',
      // Draw the axis at the top edge but place ticks/labels below the axis line
      side: 'bottom',
      type: 'log',
      range: [Math.log10(Jmin), Math.log10(Jmax)],
      tickmode: 'array',
      tickvals: topTickValsJ,
      ticktext: topTickText,
      showgrid: false,
      showline: true,
      showticklabels: true,
      ticks: 'outside',
      ticklen: 6,
      tickcolor: '#334155',
      tickfont: { color: '#0f172a', size: 11 },
      automargin: true,
      zeroline: false,
      linecolor: '#334155',
      mirror: false,
      // Force rendering at the top edge
      anchor: 'free',
      position: 1,
      layer: 'above traces',
      ticklabeloverflow: 'allow',
      ticklabelposition: 'outside bottom',
    },

    yaxis: {
      visible: false,
      range: [-1, 1]
    },
    height: 440,
  };
}

function buildData(Jmin, Jmax) {
  const baseTrace = {
    x: [Jmin, Jmax],
    y: [0, 0],
    mode: 'lines',
    line: { color: 'rgba(0,0,0,0)' },
    hoverinfo: 'skip',
    xaxis: 'x',
    yaxis: 'y',
    showlegend: false,
  };

  const topTrace = {
    x: [Jmin, Jmax],
    y: [0, 0],
    mode: 'lines',
    line: { color: 'rgba(0,0,0,0)' },
    hoverinfo: 'skip',
    xaxis: 'x2',
    yaxis: 'y',
    showlegend: false,
  };

  return [baseTrace, topTrace];
}

function renderPlot(appState) {
  const Jmin = appState?.Jmin ?? 1e-25;
  const Jmax = appState?.Jmax ?? 1e-15;
  const topUnit = appState?.topUnit ?? 'eV';
  const independentTicks = !!appState?.independentTicks;
  const layout = buildLayout(Jmin, Jmax, topUnit, independentTicks);
  const data = buildData(Jmin, Jmax);
  const config = { displayModeBar: false, responsive: true };
  Plotly.newPlot('plot', data, layout, config);
}
