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

function generateLinearTicks(minVal, maxVal, count = 6) {
  const min = Math.min(minVal, maxVal);
  const max = Math.max(minVal, maxVal);
  if (!(isFinite(min) && isFinite(max)) || min === max) return [min, max];
  const step = (max - min) / (count - 1);
  const ticks = [];
  for (let i = 0; i < count; i++) ticks.push(min + i * step);
  return ticks;
}

function generateIndependentUnitTicks(uMin, uMax, isLog, linearCount) {
  // Normalize bounds to handle inverse relationships (e.g., wavelength, time)
  const lo = Math.min(uMin, uMax);
  const hi = Math.max(uMin, uMax);
  let unitTicks = isLog ? generateDecadeTicks(lo, hi) : generateLinearTicks(lo, hi, linearCount || 7);
  // Compute interior ticks only
  let interior = unitTicks.filter(v => v > lo * 1.0000001 && v < hi / 1.0000001);
  // If none, synthesize evenly spaced interior ticks (linear) or a midpoint (log)
  if (interior.length === 0) {
    if (isLog && lo > 0 && hi > 0) {
      const mid = Math.pow(10, (log10(lo) + log10(hi)) / 2);
      interior = [mid];
    } else {
      // Generate 3 interior linear ticks between lo and hi
      const count = 4;
      const step = (hi - lo) / count;
      interior = [];
      for (let i = 1; i < count; i++) interior.push(lo + i * step);
    }
  }
  // Ensure sorted and finite
  interior = interior.filter(v => isFinite(v)).sort((a,b) => a - b);
  return interior;
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

function formatUnitValue(unit, value, prefix = '', decimals = 2) {
  const f = typeof prefixFactor === 'function' ? prefixFactor(prefix) : 1;
  const scaled = value / f;
  switch (unit) {
    case 'eV': return `${Number(scaled).toExponential(decimals)} ${prefix}eV`;
    case 'Hz': return `${Number(scaled).toExponential(decimals)} ${prefix}Hz`;
    case 'K': return `${Number(scaled).toExponential(decimals)} ${prefix}K`;
    case 'J': return `${Number(scaled).toExponential(decimals)} ${prefix}J`;
    case 'm': return `${Number(scaled).toExponential(decimals)} ${prefix}m`;
    case 'm^-1': return `${Number(scaled).toExponential(decimals)} ${prefix}m⁻¹`;
    case 'rad/m': return `${Number(scaled).toExponential(decimals)} ${prefix}rad/m`;
    case 'erg': return `${Number(scaled).toExponential(decimals)} ${prefix}erg`;
    case 'kg': return `${Number(scaled).toExponential(decimals)} ${prefix}kg`;
    case 's': return `${Number(scaled).toExponential(decimals)} ${prefix}s`;
    case 'Wh': return `${Number(scaled).toExponential(decimals)} ${prefix}Wh`;
    case 'Ws': return `${Number(scaled).toExponential(decimals)} ${prefix}Ws`;
    case 'cal': return `${Number(scaled).toExponential(decimals)} ${prefix}cal`;
    case 'BTU': return `${Number(scaled).toExponential(decimals)} ${prefix}BTU`;
    case 'foe': return `${Number(scaled).toExponential(decimals)} ${prefix}foe`;
    case 'tTNT': return `${Number(scaled).toExponential(decimals)} ${prefix}t TNT`;
    default: return `${Number(scaled).toExponential(decimals)} ${prefix}${unit}`;
  }
}

function formatValueNoUnit(unit, value, prefix = '', decimals = 2) {
  const f = typeof prefixFactor === 'function' ? prefixFactor(prefix) : 1;
  const scaled = value / f;
  return `${Number(scaled).toExponential(decimals)}`;
}

function axisTitleForUnit(unit, prefix = '') {
  switch (unit) {
    case 'Hz': return `Frequency (${prefix}Hz)`;
    case 'K': return `Temperature (${prefix}K)`;
    case 'eV': return `Energy (${prefix}eV)`;
    case 'J': return `Energy (${prefix}J)`;
    case 'm': return `Wavelength (${prefix}m)`;
    case 'm^-1': return `Wavenumber (${prefix}m⁻¹)`;
    case 'rad/m': return `Wavenumber (${prefix}rad/m)`;
    case 'erg': return `Energy (${prefix}erg)`;
    case 'kg': return `Mass (${prefix}kg)`;
    case 's': return `Time (${prefix}s)`;
    case 'Wh': return `Energy (${prefix}Wh)`;
    case 'Ws': return `Energy (${prefix}Ws)`;
    case 'cal': return `Energy (${prefix}cal)`;
    case 'BTU': return `Energy (${prefix}BTU)`;
    case 'foe': return `Energy (${prefix}foe)`;
    case 'tTNT': return `Energy (${prefix}t TNT)`;
    default: return `${unit} (${prefix}${unit})`;
  }
}

function buildLayout(Jmin, Jmax, appState) {
  const topUnit = appState?.topUnit ?? 'eV';
  const axes = Array.isArray(appState?.axes) ? appState.axes : [];
  const independentTicks = !!appState?.independentTicks;
  const primaryUnit = appState?.primaryUnit ?? 'J';
  const primaryPrefix = appState?.primaryPrefix ?? '';
  const scale = appState?.scale ?? 'log10';
  const independentTickCount = appState?.independentTickCount ?? 0;
  const showAxisLabels = appState?.showAxisLabels ?? true;
  const includeUnits = appState?.tickLabelsIncludeUnits ?? true;
  const decimals = appState?.formatDecimals ?? 2;
  const isLog = scale === 'log10';

  const autoLinearCount = 6;
  const linearCount = independentTickCount && independentTickCount > 1 ? independentTickCount : autoLinearCount;
  let jTickVals; // tick positions in Joules for Plotly
  let primaryTickText; // labels formatted in primary unit space

  // Derive primary unit-space range (scaled by prefix for display)
  const pf = typeof prefixFactor === 'function' ? prefixFactor(primaryPrefix) : 1;
  const pMin = UNIT_MAP[primaryUnit].fromJ(Jmin);
  const pMax = UNIT_MAP[primaryUnit].fromJ(Jmax);
  let uLo = Math.min(pMin / pf, pMax / pf);
  let uHi = Math.max(pMin / pf, pMax / pf);

  if (isLog) {
    // Generate in primary unit space if positive; else fall back to Joules
    if (isFinite(uLo) && isFinite(uHi) && uLo > 0 && uHi > 0) {
      const pTicksScaled = generateDecadeTicks(uLo, uHi);
      jTickVals = pTicksScaled.map(v => UNIT_MAP[primaryUnit].toJ(v * pf));
      primaryTickText = pTicksScaled.map(v => includeUnits ?
        formatUnitValue(primaryUnit, v * pf, primaryPrefix, decimals) :
        formatValueNoUnit(primaryUnit, v * pf, primaryPrefix, decimals));
    } else {
      const jTicks = generateJTicks(Jmin, Jmax);
      jTickVals = jTicks;
      primaryTickText = jTicks.map(J => {
        const val = UNIT_MAP[primaryUnit].fromJ(J);
        return includeUnits ? formatUnitValue(primaryUnit, val, primaryPrefix, decimals)
                            : formatValueNoUnit(primaryUnit, val, primaryPrefix, decimals);
      });
    }
  } else {
    // Linear scale: generate evenly spaced ticks in primary unit space
    if (isFinite(uLo) && isFinite(uHi) && uLo !== uHi) {
      const pTicksScaled = generateLinearTicks(uLo, uHi, linearCount);
      jTickVals = pTicksScaled.map(v => UNIT_MAP[primaryUnit].toJ(v * pf));
      primaryTickText = pTicksScaled.map(v => includeUnits ?
        formatUnitValue(primaryUnit, v * pf, primaryPrefix, decimals) :
        formatValueNoUnit(primaryUnit, v * pf, primaryPrefix, decimals));
    } else {
      // Fallback to Joule-space linear ticks
      const jTicks = generateLinearTicks(Jmin, Jmax, linearCount);
      jTickVals = jTicks;
      primaryTickText = jTicks.map(J => {
        const val = UNIT_MAP[primaryUnit].fromJ(J);
        return includeUnits ? formatUnitValue(primaryUnit, val, primaryPrefix, decimals)
                            : formatValueNoUnit(primaryUnit, val, primaryPrefix, decimals);
      });
    }
  }

  const axesCount = axes.length;
  const spacingPx = 70; // desired pixel spacing between axes (including gap to primary)
  const baseHeight = 150;
  // Add spacing per overlay axis and one extra spacing below the stack so
  // the bottom-most secondary is also separated from the primary by spacingPx
  const layoutHeight = baseHeight + spacingPx * (axesCount > 0 ? axesCount : 0);
  const layout = {
    margin: { l: 40, r: 40, t: 100, b: 50 },
    showlegend: false,
    hovermode: false,
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    font: { family: appState?.figureFont || 'system-ui' },

    xaxis: {
      title: { text: showAxisLabels ? axisTitleForUnit(primaryUnit, primaryPrefix) : '' },
      type: isLog ? 'log' : 'linear',
      range: isLog ? [Math.log10(Jmin), Math.log10(Jmax)] : [Jmin, Jmax],
      tickmode: 'array',
      tickvals: jTickVals,
      ticktext: primaryTickText,
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

    yaxis: {
      visible: false,
      range: [-1, 1]
    },
    height: layoutHeight,
  };

  // Build overlay axes based on appState.axes
  const baseRange = isLog ? [Math.log10(Jmin), Math.log10(Jmax)] : [Jmin, Jmax];
  const plotAreaHeightPx = layoutHeight - layout.margin.t - layout.margin.b;
  // Use exact pixel->normalized conversion so spacing stays constant across counts
  const posStep = spacingPx / Math.max(plotAreaHeightPx, 1);
  axes.forEach((ax, i) => {
    const axisName = 'xaxis' + (i + 2);
    // Compute ticks for this axis
    let tickvalsJ, ticktext;
    if (independentTicks) {
      const uMin = UNIT_MAP[ax.unit].fromJ(Jmin);
      const uMax = UNIT_MAP[ax.unit].fromJ(Jmax);
      const pfa = typeof prefixFactor === 'function' ? prefixFactor(ax.prefix) : 1;
      const unitTicks = generateIndependentUnitTicks(uMin / pfa, uMax / pfa, isLog, linearCount);
      tickvalsJ = unitTicks.map(v => UNIT_MAP[ax.unit].toJ(v * pfa));
      ticktext = unitTicks.map(v => includeUnits ? formatUnitValue(ax.unit, v * pfa, ax.prefix, decimals)
                                                : formatValueNoUnit(ax.unit, v * pfa, ax.prefix, decimals));
    } else {
      // Shared ticks: reuse primary tick positions (in Joules)
      tickvalsJ = jTickVals;
      ticktext = jTickVals.map(J => {
        const val = UNIT_MAP[ax.unit].fromJ(J);
        return includeUnits ? formatUnitValue(ax.unit, val, ax.prefix, decimals)
                            : formatValueNoUnit(ax.unit, val, ax.prefix, decimals);
      });
    }

    layout[axisName] = {
      title: { text: showAxisLabels ? axisTitleForUnit(ax.unit, ax.prefix) : '', standoff: 6 },
      overlaying: 'x',
      side: 'bottom',
      type: isLog ? 'log' : 'linear',
      range: baseRange,
      tickmode: 'array',
      tickvals: tickvalsJ,
      ticktext,
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
      anchor: 'free',
      position: Math.max(0, 1 - i * posStep),
      layer: 'above traces',
      ticklabeloverflow: 'allow',
      ticklabelposition: 'outside bottom',
    };
  });

  return layout;
}

function buildData(Jmin, Jmax, appState) {
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

  const traces = [baseTrace];
  const axes = Array.isArray(appState?.axes) ? appState.axes : [];
  axes.forEach((ax, i) => {
    traces.push({
      x: [Jmin, Jmax],
      y: [0, 0],
      mode: 'lines',
      line: { color: 'rgba(0,0,0,0)' },
      hoverinfo: 'skip',
      xaxis: 'x' + (i + 2),
      yaxis: 'y',
      showlegend: false,
    });
  });

  return traces;
}

function renderPlot(appState) {
  const Jmin = appState?.Jmin ?? 1e-25;
  const Jmax = appState?.Jmax ?? 1e-15;
  const layout = buildLayout(Jmin, Jmax, appState ?? {});
  const data = buildData(Jmin, Jmax, appState ?? {});
  const config = { displayModeBar: false, responsive: false };
  Plotly.newPlot('plot', data, layout, config);
}
