import { PI_MUL_TWO } from '../common/math.const';

export const COLORS = [
  [0.67, 0.87, 0.36],
  [0.97, 0.87, 0.93],
  [0.97, 0.57, 0.03],
];

export const MAX_SIZE = 3.5;
export const MIN_SIZE_MUL = 2.5;

export const QUANTITY_ARM = 2;
export const QUANTITY_EL_GENERATE = 20;

// black hole constants
export const INIT_BLACK_HOLE_SIZE = 100;
export const MIN_BLACK_HOLE_SIZE = 30;
export const MAX_BLACK_HOLE_SIZE = 150;

// particle constants
export const INIT_PARTICLE_MOVE_X = 0.02;
export const MIN_PARTICLE_MOVE_X = 0.005;
export const MAX_PARTICLE_MOVE_X = 0.04;

export const INIT_PARTICLE_MOVE_ANGLE = 0.00025;
export const MIN_PARTICLE_MOVE_ANGLE = 0.0001;
export const MAX_PARTICLE_MOVE_ANGLE = 0.0004;

export const PARTICLE_Z_DISPERSION_MULTIPLIER = 0.53;

export const P_D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;

// jets constants
export const JETS_TIME = 800;
export const JETS_START_X = 2.5;
export const JETS_START_X_DISPERSION = 2.5;
// export const JETS_START_Z = BLACK_HOLE_SIZE * 0.5 + 2.5;
export const JETS_MAX_Z = 800;

export const JETS_START_Z_MULTIPLIER = 0.5;
export const JETS_START_Z_OFFSET = 2.5;

export const JETS_MOVE_Z = 13.9;
export const JETS_MOVE_X = 0.32;
export const JETS_MOVE_A = 0.09;

// angle no need to be clamped
export const INIT_ANGLE_X = 1.39 * Math.PI;
export const INIT_ANGLE_Y = 0.24;
export const INIT_ANGLE_Z = 0;

// Distance constants
export const INIT_DISTANCE = 1;
export const MIN_DISTANCE = 0.5;
export const MAX_DISTANCE = 5;

// Light constants
export const INIT_LIGHT = 1;
export const MIN_LIGHT = 0.5;
export const MAX_LIGHT = 1.5;

// Radius constants
export const INIT_RADIUS = 800;
export const MIN_RADIUS = 500;
export const MAX_RADIUS = 2000;

// Particle generate step constants
export const INIT_PARTICLE_GENERATE_STEP = 0.2;
export const MIN_PARTICLE_GENERATE_STEP = 0.05;
export const MAX_PARTICLE_GENERATE_STEP = 1;
