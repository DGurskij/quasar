const COLORS =
[
	[0.67, 0.87, 0.3],
	[0.1, 0.9, 0.7],
	[0.1, 1.0, 1.0]
];

const PI_DIV_TWO = Math.PI / 2;
const PI_MUL_TWO = Math.PI * 2;

const DEGR_TO_RAD = Math.PI / 180;
const RAD_TO_DEGR = 1 / DEGR_TO_RAD;

const MAX_SIZE = 7.5;
const MIN_SIZE_MUL = 4;

const Z_DISPERSION = 120;

const QUANTITY_ARM = 2;
const QUANTITY_EL_GENERATE = 8;

const D_ALPHA = PI_MUL_TWO / QUANTITY_ARM;

const MOVE_ANGLE = 0.00026;
const MOVE_X = 0.02;
const GEN_OFFSET = MOVE_ANGLE / MOVE_X;

const GENERATE_STEP = 0.4;
const ADD_STEP = 1 / (GENERATE_STEP / MOVE_X - 1.1);

const MIN_X = 4.0;

const INIT_ANGLE_X = PI_MUL_TWO - 1.08;
const INIT_ANGLE_Y = 0.24;
const INIT_ANGLE_Z = 0;
