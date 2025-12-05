const appState = {
  Jmin: 1e-25,
  Jmax: 1e-15,
  axes: [
    { id: 1, unit: 'eV', prefix: '' },
  ],
  primaryUnit: 'J',
  primaryPrefix: '',
  scale: 'log10',
  independentTicks: false,
  independentTickCount: 0,
  figureWidthPct: 100,
  figureFont: 'system-ui',
  showAxisLabels: true,
  tickLabelsIncludeUnits: true,
  formatDecimals: 2,
};

function bindControls() {
  const independent = document.getElementById('independent-ticks');
  const primaryUnit = document.getElementById('primary-unit');
  const primaryPrefix = document.getElementById('primary-prefix');
  const scaleLog = document.getElementById('scale-log');
  const scaleLinear = document.getElementById('scale-linear');
  const minInput = document.getElementById('range-min');
  const maxInput = document.getElementById('range-max');
  const centerInput = document.getElementById('range-center');
  const spanInput = document.getElementById('range-span');
  const applyMinMax = document.getElementById('apply-minmax');
  const applyCenterSpan = document.getElementById('apply-centerspan');
  const indepTickCountInput = document.getElementById('independent-tick-count');
  const axesList = document.getElementById('axes-list');
  const addAxisBtn = document.getElementById('add-axis');
  const figureWidthInput = document.getElementById('figure-width');
  const figureWidthValue = document.getElementById('figure-width-value');
  const figureFontSelect = document.getElementById('figure-font');
  const exportFormatSelect = document.getElementById('export-format');
  const exportDpiInput = document.getElementById('export-dpi');
  const exportButton = document.getElementById('export-figure');
  const showAxisLabelsCheckbox = document.getElementById('show-axis-labels');
  const includeUnitsCheckbox = document.getElementById('tick-labels-include-units');
  const formatDecimalsInput = document.getElementById('format-decimals');
  if (primaryUnit) {
    primaryUnit.value = appState.primaryUnit;
    primaryUnit.addEventListener('change', () => {
      appState.primaryUnit = primaryUnit.value;
      syncRangeInputs();
      renderPlot(appState);
    });
  }
  if (primaryPrefix) {
    primaryPrefix.value = appState.primaryPrefix;
    primaryPrefix.addEventListener('change', () => {
      appState.primaryPrefix = primaryPrefix.value;
      syncRangeInputs();
      renderPlot(appState);
    });
  }
  if (scaleLog && scaleLinear) {
    scaleLog.checked = appState.scale === 'log10';
    scaleLinear.checked = appState.scale === 'linear';
    const onScaleChange = () => {
      appState.scale = scaleLog.checked ? 'log10' : 'linear';
      // Auto-disable independent tick count on log scale
      if (indepTickCountInput) indepTickCountInput.disabled = appState.scale === 'log10';
      syncRangeInputs();
      renderPlot(appState);
    };
    scaleLog.addEventListener('change', onScaleChange);
    scaleLinear.addEventListener('change', onScaleChange);
  }
  if (independent) {
    independent.checked = appState.independentTicks;
    independent.addEventListener('change', () => {
      appState.independentTicks = independent.checked;
      renderPlot(appState);
    });
  }
  if (indepTickCountInput) {
    indepTickCountInput.value = String(appState.independentTickCount);
    indepTickCountInput.disabled = appState.scale === 'log10';
    indepTickCountInput.addEventListener('change', () => {
      const v = Number(indepTickCountInput.value);
      appState.independentTickCount = isFinite(v) && v >= 0 ? Math.floor(v) : 0;
      renderPlot(appState);
    });
  }

  function applyRangeFromMinMax() {
    const pfx = typeof prefixFactor === 'function' ? prefixFactor(appState.primaryPrefix) : 1;
    const unit = appState.primaryUnit;
    if (appState.scale === 'log10') {
      const minExp = Number(minInput.value);
      const maxExp = Number(maxInput.value);
      if (isFinite(minExp) && isFinite(maxExp)) {
        const minScaled = Math.pow(10, minExp);
        const maxScaled = Math.pow(10, maxExp);
        appState.Jmin = UNIT_MAP[unit].toJ(minScaled * pfx);
        appState.Jmax = UNIT_MAP[unit].toJ(maxScaled * pfx);
      }
    } else {
      const minVal = Number(minInput.value);
      const maxVal = Number(maxInput.value);
      if (isFinite(minVal) && isFinite(maxVal)) {
        appState.Jmin = UNIT_MAP[unit].toJ(minVal * pfx);
        appState.Jmax = UNIT_MAP[unit].toJ(maxVal * pfx);
      }
    }
    renderPlot(appState);
  }

  function applyRangeFromCenterSpan() {
    const pfx = typeof prefixFactor === 'function' ? prefixFactor(appState.primaryPrefix) : 1;
    const unit = appState.primaryUnit;
    if (appState.scale === 'log10') {
      const cExp = Number(centerInput.value);
      const spanExp = Number(spanInput.value);
      if (isFinite(cExp) && isFinite(spanExp)) {
        const minExp = cExp - spanExp / 2;
        const maxExp = cExp + spanExp / 2;
        const minScaled = Math.pow(10, minExp);
        const maxScaled = Math.pow(10, maxExp);
        appState.Jmin = UNIT_MAP[unit].toJ(minScaled * pfx);
        appState.Jmax = UNIT_MAP[unit].toJ(maxScaled * pfx);
      }
    } else {
      const cVal = Number(centerInput.value);
      const sVal = Number(spanInput.value);
      if (isFinite(cVal) && isFinite(sVal)) {
        const minVal = cVal - sVal / 2;
        const maxVal = cVal + sVal / 2;
        appState.Jmin = UNIT_MAP[unit].toJ(minVal * pfx);
        appState.Jmax = UNIT_MAP[unit].toJ(maxVal * pfx);
      }
    }
    renderPlot(appState);
  }

  function syncRangeInputs() {
    const pfx = typeof prefixFactor === 'function' ? prefixFactor(appState.primaryPrefix) : 1;
    const unit = appState.primaryUnit;
    const minScaled = UNIT_MAP[unit].fromJ(appState.Jmin) / pfx;
    const maxScaled = UNIT_MAP[unit].fromJ(appState.Jmax) / pfx;
    if (appState.scale === 'log10') {
      minInput.value = isFinite(minScaled) && minScaled > 0 ? Math.log10(minScaled) : '';
      maxInput.value = isFinite(maxScaled) && maxScaled > 0 ? Math.log10(maxScaled) : '';
      const centerExp = (Number(minInput.value) + Number(maxInput.value)) / 2;
      const spanExp = Number(maxInput.value) - Number(minInput.value);
      centerInput.value = isFinite(centerExp) ? centerExp : '';
      spanInput.value = isFinite(spanExp) ? spanExp : '';
    } else {
      minInput.value = isFinite(minScaled) ? minScaled : '';
      maxInput.value = isFinite(maxScaled) ? maxScaled : '';
      const centerVal = (minScaled + maxScaled) / 2;
      const spanVal = (maxScaled - minScaled);
      centerInput.value = isFinite(centerVal) ? centerVal : '';
      spanInput.value = isFinite(spanVal) ? spanVal : '';
    }
  }

  if (applyMinMax) applyMinMax.addEventListener('click', applyRangeFromMinMax);
  if (applyCenterSpan) applyCenterSpan.addEventListener('click', applyRangeFromCenterSpan);

  // initialize inputs with current state
  if (minInput && maxInput && centerInput && spanInput) {
    syncRangeInputs();
  }

  function renderAxesList() {
    if (!axesList) return;
    axesList.innerHTML = '';
    appState.axes.forEach((axis, idx) => {
      const row = document.createElement('div');
      row.className = 'axis-row';
      row.dataset.id = String(axis.id);

      const unitLabel = document.createElement('label');
      unitLabel.className = 'control';
      unitLabel.innerHTML = '<span>Unit</span>';
      const unitSel = document.createElement('select');
      const unitOptions = [
        ['eV','eV (electronvolt)'],
        ['Hz','Hz (hertz)'],
        ['K','K (kelvin)'],
        ['J','J (joule)'],
        ['m','m (wavelength)'],
        ['m^-1','m⁻¹ (wavenumber)'],
        ['rad/m','rad/m (ang. wavenumber)'],
        ['erg','erg (cgs)'],
        ['kg','kg (mass)'],
        ['s','s (time)'],
        ['Wh','Wh (watt-hour)'],
        ['Ws','Ws (watt-second)'],
        ['cal','cal (calorie)'],
        ['tTNT','t TNT (tonne TNT)'],
      ];
      unitOptions.forEach(([value, text]) => {
        const opt = document.createElement('option');
        opt.value = value; opt.textContent = text; if (axis.unit === value) opt.selected = true; unitSel.appendChild(opt);
      });
      unitSel.addEventListener('change', () => {
        axis.unit = unitSel.value;
        renderPlot(appState);
      });
      unitLabel.appendChild(unitSel);

      const prefixLabel = document.createElement('label');
      prefixLabel.className = 'control';
      prefixLabel.innerHTML = '<span>Prefix</span>';
      const prefixSel = document.createElement('select');
      const prefixes = [
        ['', '(none)'],
        ['Z','Z (zetta)'],
        ['E','E (exa)'],
        ['P','P (peta)'],
        ['T','T (tera)'],
        ['G','G (giga)'],
        ['M','M (mega)'],
        ['k','k (kilo)'],
        ['c','c (centi)'],
        ['m','m (milli)'],
        ['µ','µ (micro)'],
        ['n','n (nano)'],
        ['p','p (pico)'],
        ['f','f (femto)'],
      ];
      prefixes.forEach(([val, text]) => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = text; if (axis.prefix === val) opt.selected = true; prefixSel.appendChild(opt);
      });
      prefixSel.addEventListener('change', () => {
        axis.prefix = prefixSel.value;
        renderPlot(appState);
      });
      prefixLabel.appendChild(prefixSel);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        appState.axes = appState.axes.filter(a => a.id !== axis.id);
        renderAxesList();
        renderPlot(appState);
      });

      row.appendChild(unitLabel);
      row.appendChild(prefixLabel);
      row.appendChild(removeBtn);
      axesList.appendChild(row);
    });
  }

  if (addAxisBtn) {
    addAxisBtn.addEventListener('click', () => {
      const nextId = (appState.axes.reduce((m, a) => Math.max(m, a.id), 0) || 0) + 1;
      appState.axes.push({ id: nextId, unit: 'eV', prefix: '' });
      renderAxesList();
      renderPlot(appState);
    });
  }

  // initial render of axes list
  renderAxesList();

  // Figure width binding
  function applyFigureWidth() {
    const pct = Math.min(100, Math.max(20, Number(figureWidthInput.value)));
    appState.figureWidthPct = pct;
    const plotEl = document.getElementById('plot');
    if (plotEl) {
      plotEl.style.setProperty('--plot-width', pct + '%');
      // If plot initialized, update only width to avoid height jumps
      if (plotEl._fullLayout && window.Plotly && typeof Plotly.relayout === 'function') {
        // Wait a frame so CSS width takes effect, then set plot width only
        requestAnimationFrame(() => {
          const rect = plotEl.getBoundingClientRect();
          const newWidth = Math.max(200, Math.floor(rect.width));
          Plotly.relayout(plotEl, { width: newWidth });
        });
      }
    }
    if (figureWidthValue) figureWidthValue.textContent = String(pct);
  }
  if (figureWidthInput) {
    figureWidthInput.value = String(appState.figureWidthPct);
    applyFigureWidth();
    const onWidthChange = () => applyFigureWidth();
    figureWidthInput.addEventListener('input', onWidthChange);
    figureWidthInput.addEventListener('change', onWidthChange);
  }

  // Figure font binding
  if (figureFontSelect) {
    figureFontSelect.value = appState.figureFont;
    figureFontSelect.addEventListener('change', () => {
      appState.figureFont = figureFontSelect.value;
      renderPlot(appState);
    });
  }

  // Export handling
  // Toggle DPI input enabled/disabled based on format (PNG uses DPI, SVG ignores)
  function syncExportDpiEnabled() {
    if (!exportDpiInput) return;
    const fmt = exportFormatSelect ? exportFormatSelect.value : 'png';
    const isSvg = fmt === 'svg';
    exportDpiInput.disabled = isSvg;
  }
  if (exportFormatSelect) {
    exportFormatSelect.addEventListener('change', () => {
      syncExportDpiEnabled();
    });
    // Initialize state
    syncExportDpiEnabled();
  }

  function exportFigure() {
    const fmt = exportFormatSelect ? exportFormatSelect.value : 'png';
    const scale = exportDpiInput && fmt === 'png' ? Math.max(1, Number(exportDpiInput.value) / 72) : 1;
    const opts = { format: fmt, scale };
    // Plotly.downloadImage supports png, svg, jpeg, webp
    if (window.Plotly && document.getElementById('plot')) {
      Plotly.downloadImage('plot', opts).catch(() => {
        // Fallback to toImage + manual download
        Plotly.toImage('plot', opts).then((dataUrl) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'energy-scale.' + fmt;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });
    }
  }
  if (exportButton) {
    exportButton.addEventListener('click', exportFigure);
  }

  // Axis title labels visibility
  if (showAxisLabelsCheckbox) {
    showAxisLabelsCheckbox.checked = appState.showAxisLabels;
    showAxisLabelsCheckbox.addEventListener('change', () => {
      appState.showAxisLabels = showAxisLabelsCheckbox.checked;
      renderPlot(appState);
    });
  }
  // Include units in tick labels
  if (includeUnitsCheckbox) {
    includeUnitsCheckbox.checked = appState.tickLabelsIncludeUnits;
    includeUnitsCheckbox.addEventListener('change', () => {
      appState.tickLabelsIncludeUnits = includeUnitsCheckbox.checked;
      renderPlot(appState);
    });
  }

  // Decimal places for formatting
  if (formatDecimalsInput) {
    formatDecimalsInput.value = String(appState.formatDecimals);
    formatDecimalsInput.addEventListener('change', () => {
      let v = Number(formatDecimalsInput.value);
      if (!isFinite(v)) v = 2;
      v = Math.max(0, Math.min(6, Math.floor(v)));
      appState.formatDecimals = v;
      renderPlot(appState);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure at least one overlay axis exists by default
  if (!Array.isArray(appState.axes) || appState.axes.length === 0) {
    appState.axes = [{ id: 1, unit: 'eV', prefix: '' }];
  }
  bindControls();
  renderPlot(appState);
  // Avoid triggering an immediate resize after first render to prevent layout jumping.
});
