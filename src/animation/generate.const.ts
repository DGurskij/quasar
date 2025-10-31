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

export const BLACK_HOLE_SIZE = 100.0;
export const P_MIN_X = BLACK_HOLE_SIZE;
export const BLACK_HOLE_RADIUS_SQUARED = 0.25 * BLACK_HOLE_SIZE * BLACK_HOLE_SIZE;

export const P_Z_DISPERSION = BLACK_HOLE_SIZE * 0.53;
export const P_MOVE_ANGLE = 0.00032;
export const P_MOVE_X = 0.02;

export const P_D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;
export const P_GEN_OFFSET = P_MOVE_ANGLE / P_MOVE_X;

export const JETS_TIME = 800;
export const JETS_START_X = 3.5;
export const JETS_START_X_DISPERSION = 2.5;
export const JETS_START_Z = BLACK_HOLE_SIZE * 0.5 + 2.5;
export const JETS_MAX_Z = 800;

export const JETS_MOVE_Z = 13.9;
export const JETS_MOVE_X = 0.32;
export const JETS_MOVE_A = 0.09;
