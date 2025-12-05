function log10(x) { return Math.log(x) / Math.LN10; }

function decadeFloor(x) { return Math.floor(log10(x)); }
function decadeCeil(x) { return Math.ceil(log10(x)); }

// Generate one tick per decade between Jmin and Jmax (inclusive)
function generateJTicks(Jmin, Jmax) {
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
  const abs = Math.abs(eV);
  if (abs >= 1e3 || abs < 1e-3) return `${eV.toExponential(0)} eV`;
  if (abs < 1) return `${eV.toPrecision(2)} eV`;
  return `${eV.toLocaleString(undefined, { maximumFractionDigits: 2 })} eV`;
}

function buildLayout(Jmin, Jmax) {
  const jTicks = generateJTicks(Jmin, Jmax);
  const evTicks = jTicks.map(J_to_eV);

  return {
    margin: { l: 40, r: 20, t: 100, b: 40 },
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
      showgrid: true,
      gridcolor: '#e2e8f0',
      zeroline: false,
      linecolor: '#334155',
      mirror: false,
      ticks: 'outside',
      ticklen: 6,
      tickcolor: '#334155',
    },

    xaxis2: {
      title: { text: 'Energy (eV)', standoff: 6 },
      overlaying: 'x',
      side: 'top',
      type: 'log',
      range: [Math.log10(Jmin), Math.log10(Jmax)],
      tickmode: 'array',
      tickvals: jTicks,
      ticktext: evTicks.map(formatEV),
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
      ticklabelposition: 'outside top',
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

function renderPlot() {
  const Jmin = 1e-25;
  const Jmax = 1e-15;
  const layout = buildLayout(Jmin, Jmax);
  const data = buildData(Jmin, Jmax);
  const config = { displayModeBar: false, responsive: true };
  Plotly.newPlot('plot', data, layout, config);
}
