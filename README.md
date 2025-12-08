# EnergyScaleApp

EnergyScaleApp is a client-side, interactive tool to compare and visualize energy across many units on a single figure using Plotly.js. It supports a primary axis in a chosen unit and optional secondary axes overlaid with shared or independent ticks, making it easy to relate values across domains (particle physics, spectroscopy, thermodynamics, energy consumption, etc.).

## Key Features
- Log10 and linear scales.
- Primary and multiple secondary axes, each in selectable unit and metric prefix.
- Range controls: set by Min/Max or Center/Span (primary unit space) of the primary axis.
- Secondary axes manager: add/remove axes with their own units/prefixes.
- Figure controls: width slider (width-only relayout), font selection.
- Export: PNG (configurable DPI) and SVG.
- Formatting controls: show/hide axis titles, include unit symbols in tick labels, set decimal places for scientific notation.
- Tick formatting: 
  - on log10 scale: shared ticks aligned to primary axis or independent ticks per axis (decade ticks in log).
  - on linear scale: automatic or manual tick count, always aligned to primary axis.


## Supported Units
Energy and related conversions across:
- J (joule), eV (electronvolt), Hz (hertz), K (kelvin)
- wavelength (m), wavenumber (m⁻¹), angular wavenumber (rad/m) by free-space dispersion relation of light
- erg (cgs), kg (mass via E=mc^2), s (time via E=h/t)
- Wh, Ws, Ah (at 5 or 12 V), cal, t TNT (tonne TNT), BTU, foe (10^51 erg)

Metric prefixes include: Z, E, P, T, G, M, k, c, m, µ, n, p, f.

## Use Cases
- Cross-domain comparison: relate photon energies (eV) to wavelengths (m) and frequencies (Hz).
- Educational visualization: show how temperature (K) maps to energy via Boltzmann constant.
- Engineering context: compare stored energy (Wh, Ws, Ah, BTU) on one scale.
- Research communication: export clean figures for papers or presentations.

## How to use it
Visit [https://giovannikl.github.io/EnergyScaleApp/](https://giovannikl.github.io/EnergyScaleApp/) and try it yourself in your browser!

If you want to try it locally on your machine, download the contents of this repository and open the `index.html` file in a browser.

For further development, these are needed:
- Files: `index.html`, `css/styles.css`, `js/conversions.js`, `js/plot.js`, `js/main.js`.
- No build step; all logic runs client-side.

## Suggestions?
If you have any suggestions on how to make this app better, let me know by posting an [Issue](https://github.com/GiovanniKl/EnergyScaleApp/issues) and we can discuss the details. Or you can fork this repository and try it yourself.

This was just a funny little project for me, because I was bored and annoyed when I needed to graphically relate different energy units I need in my studies and research.

*Disclaimer: I build this with the help of GH Copilot, so there might be some strange artifacts not really needed for the functioning of the app, even though I tried to curate it well and edit everything.*
