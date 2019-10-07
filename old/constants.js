const COLORS =
[
	[0.67, 0.87, 0.3],
	[0.67, 0.87, 0.3]
];

const PI_DIV_TWO = Math.PI / 2;
const PI_MUL_TWO = Math.PI * 2;

const DEGR_TO_RAD = Math.PI / 180;
const RAD_TO_DEGR = 1 / DEGR_TO_RAD;

const MAX_SIZE = 4.0;
const MIN_SIZE_MUL = 4;

const QUANTITY_ARM = 2;
const QUANTITY_EL_GENERATE = 15;

const P_Z_DISPERSION = 120;
const P_MOVE_ANGLE = 0.00026;
const P_MOVE_X = 0.02;

const P_D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;
const P_GEN_OFFSET = P_MOVE_ANGLE / P_MOVE_X;
const P_GENERATE_STEP = 0.4;
const P_ADD_STEP = 1 / (P_GENERATE_STEP / P_MOVE_X - 1.1);

const BLACK_HOLE_SIZE = 60.0;
const P_MIN_X = 30.0;

const INIT_ANGLE_X = 1.39 * Math.PI;
const INIT_ANGLE_Y = 0.24;
const INIT_ANGLE_Z = 0;

const JETS_TIME = 1000;
const JETS_START_X = 5;
const JETS_START_Z = BLACK_HOLE_SIZE / 2 + 2;
const JETS_MAX_Z = 800;

const JETS_MOVE_Z = 2.9;
const JETS_MOVE_X = 0.25;
const JETS_MOVE_A = 0.04;
