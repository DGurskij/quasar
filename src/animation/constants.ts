export const COLORS = [
  [0.67, 0.87, 0.36],
  [0.67, 0.87, 0.53],
];

export const PI = Math.PI;
export const PI_DIV_TWO = Math.PI / 2;
export const PI_MUL_TWO = Math.PI * 2;

export const DEGR_TO_RAD = Math.PI / 180;
export const RAD_TO_DEGR = 1 / DEGR_TO_RAD;

export const MAX_SIZE = 5.5;
export const MIN_SIZE_MUL = 4.5;

export const QUANTITY_ARM = 2;
export const QUANTITY_EL_GENERATE = 20;

export const P_Z_DISPERSION = 70;
export const P_MOVE_ANGLE = 0.00032;
export const P_MOVE_X = 0.02;

export const P_D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;
export const P_GEN_OFFSET = P_MOVE_ANGLE / P_MOVE_X;
export const P_GENERATE_STEP = 0.2;
export const P_ADD_STEP = 1 / (P_GENERATE_STEP / P_MOVE_X - 1.1);

export const BLACK_HOLE_SIZE = 50.0;
export const P_MIN_X = BLACK_HOLE_SIZE / 2;

export const INIT_ANGLE_X = 1.39 * Math.PI;
export const INIT_ANGLE_Y = 0.24;
export const INIT_ANGLE_Z = 0;

export const JETS_TIME = 800;
export const JETS_START_X = 5;
export const JETS_START_Z = BLACK_HOLE_SIZE / 2 + 2;
export const JETS_MAX_Z = 800;

export const JETS_MOVE_Z = 3.9;
export const JETS_MOVE_X = 0.2;
export const JETS_MOVE_A = 0.01;
