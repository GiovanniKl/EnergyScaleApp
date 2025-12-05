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
      ['eV','Hz','K','J'].forEach(u => {
        const opt = document.createElement('option');
        opt.value = u; opt.textContent = u; if (axis.unit === u) opt.selected = true; unitSel.appendChild(opt);
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
      const prefixes = ['', 'T','G','M','k','m','µ','n','p','f'];
      prefixes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p || '(none)'; if (axis.prefix === p) opt.selected = true; prefixSel.appendChild(opt);
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
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure at least one overlay axis exists by default
  if (!Array.isArray(appState.axes) || appState.axes.length === 0) {
    appState.axes = [{ id: 1, unit: 'eV', prefix: '' }];
  }
  bindControls();
  renderPlot(appState);
});
