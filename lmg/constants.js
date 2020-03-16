const PI         = Math.PI;
const PI_DIV_TWO = Math.PI / 2;
const PI_MUL_TWO = Math.PI * 2;

const DEGR_TO_RAD = Math.PI / 180;
const RAD_TO_DEGR = 1 / DEGR_TO_RAD;

const MAX_SIZE = 3.2;
const MIN_SIZE_MUL = 3.2;

const QUANTITY_ARM = 2;

const P_Z_DISPERSION = 150;
const P_MOVE_ANGLE = 0.00032;
const P_MOVE_X = 0.09;

const P_D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;
const P_GEN_OFFSET = P_MOVE_ANGLE / P_MOVE_X;
const P_GENERATE_STEP = 0.4;
const P_ADD_STEP = 1 / (P_GENERATE_STEP / P_MOVE_X - 1.1);

const BLACK_HOLE_SIZE = 100.0;
const P_MIN_X = BLACK_HOLE_SIZE / 2;

const INIT_ANGLE_X = 1.39 * Math.PI;
const INIT_ANGLE_Y = 0.24;
const INIT_ANGLE_Z = 0;
