const appState = {
  Jmin: 1e-25,
  Jmax: 1e-15,
  topUnit: 'eV',
  independentTicks: false,
};

function bindControls() {
  const unitSelect = document.getElementById('unit-select');
  const independent = document.getElementById('independent-ticks');
  if (unitSelect) {
    unitSelect.value = appState.topUnit;
    unitSelect.addEventListener('change', () => {
      appState.topUnit = unitSelect.value;
      renderPlot(appState);
    });
  }
  if (independent) {
    independent.checked = appState.independentTicks;
    independent.addEventListener('change', () => {
      appState.independentTicks = independent.checked;
      renderPlot(appState);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bindControls();
  renderPlot(appState);
});
