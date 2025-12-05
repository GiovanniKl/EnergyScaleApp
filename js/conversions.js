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
