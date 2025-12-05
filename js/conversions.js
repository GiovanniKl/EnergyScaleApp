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
};

function convert(value, fromUnit, toUnit) {
  const J = UNIT_MAP[fromUnit].toJ(value);
  return UNIT_MAP[toUnit].fromJ(J);
}
