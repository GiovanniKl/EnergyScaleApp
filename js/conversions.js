// Physical constants (SI)
const CONSTANTS = {
  h: 6.62607015e-34,      // Planck constant [J·s]
  c: 299792458,           // Speed of light [m/s]
  kB: 1.380649e-23,       // Boltzmann constant [J/K]
  eV: 1.602176634e-19     // Electronvolt [J]
};

function J_to_eV(J) {
  return J / CONSTANTS.eV;
}

function eV_to_J(eV) {
  return eV * CONSTANTS.eV;
}

function J_to_Hz(J) {
  return J / CONSTANTS.h;
}

function Hz_to_J(Hz) {
  return Hz * CONSTANTS.h;
}

function J_to_K(J) {
  return J / CONSTANTS.kB;
}

function K_to_J(K) {
  return K * CONSTANTS.kB;
}

const UNIT_MAP = {
  J: { toJ: x => x, fromJ: x => x, label: 'Energy (J)' },
  eV: { toJ: eV_to_J, fromJ: J_to_eV, label: 'Energy (eV)' },
  Hz: { toJ: Hz_to_J, fromJ: J_to_Hz, label: 'Frequency (Hz)' },
  K: { toJ: K_to_J, fromJ: J_to_K, label: 'Temperature (K)' },
  // Free-space wavelength λ [m]: E = h c / λ
  m: {
    toJ: (lambda_m) => (lambda_m > 0 ? (CONSTANTS.h * CONSTANTS.c) / lambda_m : NaN),
    fromJ: (J) => (J > 0 ? (CONSTANTS.h * CONSTANTS.c) / J : NaN),
    label: 'Wavelength (m)'
  },
  // Wavenumber κ [m^-1]: κ = 1/λ, so E = h c κ
  'm^-1': {
    toJ: (inv_m) => inv_m * CONSTANTS.h * CONSTANTS.c,
    fromJ: (J) => J / (CONSTANTS.h * CONSTANTS.c),
    label: 'Wavenumber (m⁻¹)'
  },
  // Angular wavenumber k [rad/m]: k = 2π/λ, so E = h c k / (2π)
  'rad/m': {
    toJ: (rad_per_m) => (rad_per_m * CONSTANTS.h * CONSTANTS.c) / (2 * Math.PI),
    fromJ: (J) => (J * (2 * Math.PI)) / (CONSTANTS.h * CONSTANTS.c),
    label: 'Wavenumber (rad/m)'
  },
  // Erg: 1 erg = 1e-7 J
  erg: {
    toJ: (erg) => erg * 1e-7,
    fromJ: (J) => J / 1e-7,
    label: 'Energy (erg)'
  },
  // Mass via E = m c^2
  kg: {
    toJ: (kg) => kg * CONSTANTS.c * CONSTANTS.c,
    fromJ: (J) => J / (CONSTANTS.c * CONSTANTS.c),
    label: 'Mass (kg)'
  },
  // Time via f = 1/t => E = h / t
  s: {
    toJ: (seconds) => (seconds > 0 ? CONSTANTS.h / seconds : NaN),
    fromJ: (J) => (J > 0 ? CONSTANTS.h / J : NaN),
    label: 'Time (s)'
  },
  // Watt-hour: 1 Wh = 3600 J
  Wh: {
    toJ: (wh) => wh * 3600,
    fromJ: (J) => J / 3600,
    label: 'Energy (Wh)'
  },
  // Watt-second: 1 Ws = 1 J
  Ws: {
    toJ: (ws) => ws * 1,
    fromJ: (J) => J / 1,
    label: 'Energy (Ws)'
  },
  // Calories (small calorie): 1 cal = 4.184 J
  cal: {
    toJ: (cal) => cal * 4.184,
    fromJ: (J) => J / 4.184,
    label: 'Energy (cal)'
  },
  // BTU (International): 1 BTU ≈ 1055.06 J
  BTU: {
    toJ: (btu) => btu * 1055.06,
    fromJ: (J) => J / 1055.06,
    label: 'Energy (BTU)'
  },
  // foe (astrophysical unit): 1 foe = 1e44 J
  foe: {
    toJ: (f) => f * 1e44,
    fromJ: (J) => J / 1e44,
    label: 'Energy (foe)'
  },
  // TNT tonnes: 1 tonne TNT ≈ 4.184e9 J
  tTNT: {
    toJ: (t) => t * 4.184e9,
    fromJ: (J) => J / 4.184e9,
    label: 'Energy (t TNT)'
  },
};

function convert(value, fromUnit, toUnit) {
  const J = UNIT_MAP[fromUnit].toJ(value);
  return UNIT_MAP[toUnit].fromJ(J);
}

// SI-like prefix factors
const PREFIX_FACTOR = {
  '': 1,
  c: 1e-2,
  Z: 1e21, // zetta
  E: 1e18, // exa
  P: 1e15, // peta
  T: 1e12,
  G: 1e9,
  M: 1e6,
  k: 1e3,
  m: 1e-3,
  'µ': 1e-6,
  n: 1e-9,
  p: 1e-12,
  f: 1e-15,
};

function prefixFactor(prefix) {
  return PREFIX_FACTOR[prefix] ?? 1;
}
