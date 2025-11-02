import { RAD_TO_DEGR } from 'src/common/math.const';
import { WEBGL_STATUSES } from 'src/webgl/WebGLStatus';

import {
  INIT_ANGLE_X,
  INIT_ANGLE_Y,
  INIT_ANGLE_Z,
  INIT_BLACK_HOLE_SIZE,
  INIT_DISTANCE,
  INIT_LIGHT,
  INIT_PARTICLE_GENERATE_STEP,
  INIT_PARTICLE_MOVE_ANGLE,
  INIT_PARTICLE_MOVE_X,
  INIT_RADIUS,
  MAX_BLACK_HOLE_SIZE,
  MAX_DISTANCE,
  MAX_LIGHT,
  MAX_PARTICLE_GENERATE_STEP,
  MAX_PARTICLE_MOVE_ANGLE,
  MAX_PARTICLE_MOVE_X,
  MAX_RADIUS,
  MIN_BLACK_HOLE_SIZE,
  MIN_DISTANCE,
  MIN_LIGHT,
  MIN_PARTICLE_GENERATE_STEP,
  MIN_PARTICLE_MOVE_ANGLE,
  MIN_PARTICLE_MOVE_X,
  MIN_RADIUS,
  RECOMMEND_STEP_BLACK_HOLE_SIZE,
  RECOMMEND_STEP_DISTANCE,
  RECOMMEND_STEP_LIGHT,
  RECOMMEND_STEP_PARTICLE_GENERATE_STEP,
  RECOMMEND_STEP_PARTICLE_MOVE_ANGLE,
  RECOMMEND_STEP_PARTICLE_MOVE_X,
  RECOMMEND_STEP_RADIUS,
} from './animation.const';
import { disposeWebGL, drawScene, initWebGL } from './DrawFunctions';
import { animationEngine, destroyBuffers, initParticlesForCanvas } from './EngineFunctions';
import { QuasarAnimation } from './QuasarAnimation';
import { IQuasarMetrices } from './types';

let quasarAnimation: QuasarAnimation;

export function init(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { alpha: false });

  if (!gl) {
    alert(`Browser doesn't support WebGL2.`);
    return;
  }

  const status = initWebGL(gl);

  if (status < 0) {
    alert(WEBGL_STATUSES[status.toString()]);
    return;
  }

  quasarAnimation = new QuasarAnimation(gl);

  quasarAnimation.drawFunction = drawScene.bind(quasarAnimation);
  quasarAnimation.engineFunction = animationEngine.bind(quasarAnimation);
  quasarAnimation.initParticlesFunction = initParticlesForCanvas.bind(quasarAnimation);
}

// External API

export function start() {
  quasarAnimation.stop();

  setTimeout(() => {
    quasarAnimation.start();
  }, 100);
}

export function playPause() {
  if (quasarAnimation.animationState === 2) {
    quasarAnimation.resume();
  } else if (quasarAnimation.animationState === 1) {
    quasarAnimation.pause();
  }
}

export function setCanvasSize(width: number, height: number) {
  quasarAnimation.setCanvasSize(width, height);
}

/**
 * @returns clamped value
 */
export function setQuasarRadius(radius: number) {
  if (Number.isNaN(radius)) {
    throw new Error('Invalid quasar radius value');
  }

  const clampedValue = Math.min(Math.max(radius, MIN_RADIUS), MAX_RADIUS);
  quasarAnimation.nextQuasarGenerativeParameters.quasarRadius = clampedValue;

  return clampedValue;
}

/**
 * @returns clamped value
 */
export function setBlackHoleSize(size: number) {
  if (Number.isNaN(size)) {
    throw new Error('Invalid black hole size value');
  }

  const clampedValue = Math.min(Math.max(size, MIN_BLACK_HOLE_SIZE), MAX_BLACK_HOLE_SIZE);
  quasarAnimation.nextQuasarGenerativeParameters.blackHoleSize = clampedValue;

  return clampedValue;
}

/**
 * @returns clamped value
 */
export function setParticleGenerateStep(step: number) {
  if (Number.isNaN(step)) {
    throw new Error('Invalid particle generate step value');
  }

  const clampedValue = Math.min(Math.max(step, MIN_PARTICLE_GENERATE_STEP), MAX_PARTICLE_GENERATE_STEP);
  quasarAnimation.nextQuasarGenerativeParameters.particleGenerateStep = clampedValue;

  return clampedValue;
}

/**
 * @returns clamped value
 */
export function setParticleMoveX(x: number) {
  if (Number.isNaN(x)) {
    throw new Error('Invalid particle move x value');
  }

  const clampedValue = Math.min(Math.max(x, MIN_PARTICLE_MOVE_X), MAX_PARTICLE_MOVE_X);
  quasarAnimation.nextQuasarGenerativeParameters.particleMoveX = clampedValue;
}

/**
 * @returns clamped value
 */
export function setParticleMoveAngle(angle: number) {
  if (Number.isNaN(angle)) {
    throw new Error('Invalid particle move angle value');
  }

  const clampedValue = Math.min(Math.max(angle, MIN_PARTICLE_MOVE_ANGLE), MAX_PARTICLE_MOVE_ANGLE);
  quasarAnimation.nextQuasarGenerativeParameters.particleMoveAngle = clampedValue;

  return clampedValue;
}

export function rotate(value: number, axis: 'x' | 'y' | 'z') {
  if (Number.isNaN(value)) {
    throw new Error('Invalid rotate value');
  }

  quasarAnimation.rotate(value, axis);
}

/**
 * @returns clamped value
 */
export function forward(value: number) {
  if (Number.isNaN(value)) {
    throw new Error('Invalid distance value');
  }

  const clampedValue = Math.min(Math.max(value, MIN_DISTANCE), MAX_DISTANCE);

  quasarAnimation.forward(clampedValue);

  return clampedValue;
}

/**
 * @returns clamped value
 */
export function updateLight(value: number) {
  if (Number.isNaN(value)) {
    throw new Error('Invalid light value');
  }

  const clampedValue = Math.min(Math.max(value, MIN_LIGHT), MAX_LIGHT);

  quasarAnimation.updateLight(clampedValue);

  return clampedValue;
}

export function startJet() {
  quasarAnimation.startJet();
}

export function setRotateCb(cb: (value: number, axis: 'x' | 'y' | 'z') => void) {
  quasarAnimation.onRotate = cb;
}

export function setUpdateMetricesCb(cb: (metrices: IQuasarMetrices) => void) {
  quasarAnimation.onUpdateMetrices = cb;
}

type RangeParams = 'quasarRadius' | 'blackHoleSize' | 'particleGenerateStep' | 'particleMoveX' | 'particleMoveAngle' | 'distance' | 'light';

export function getParameterRangeInfo(param: RangeParams) {
  switch (param) {
    case 'quasarRadius':
      return { min: MIN_RADIUS, max: MAX_RADIUS, recommendStep: RECOMMEND_STEP_RADIUS };
    case 'blackHoleSize':
      return { min: MIN_BLACK_HOLE_SIZE, max: MAX_BLACK_HOLE_SIZE, recommendStep: RECOMMEND_STEP_BLACK_HOLE_SIZE };
    case 'particleGenerateStep':
      return { min: MIN_PARTICLE_GENERATE_STEP, max: MAX_PARTICLE_GENERATE_STEP, recommendStep: RECOMMEND_STEP_PARTICLE_GENERATE_STEP };
    case 'particleMoveX':
      return { min: MIN_PARTICLE_MOVE_X, max: MAX_PARTICLE_MOVE_X, recommendStep: RECOMMEND_STEP_PARTICLE_MOVE_X };
    case 'particleMoveAngle':
      return { min: MIN_PARTICLE_MOVE_ANGLE, max: MAX_PARTICLE_MOVE_ANGLE, recommendStep: RECOMMEND_STEP_PARTICLE_MOVE_ANGLE };
    case 'distance':
      return { min: MIN_DISTANCE, max: MAX_DISTANCE, recommendStep: RECOMMEND_STEP_DISTANCE };
    case 'light':
      return { min: MIN_LIGHT, max: MAX_LIGHT, recommendStep: RECOMMEND_STEP_LIGHT };
    default:
      throw new Error(`Invalid range parameter: ${param}`);
  }
}

export function getAllParameterRanges() {
  return {
    quasarRadius: getParameterRangeInfo('quasarRadius'),
    blackHoleSize: getParameterRangeInfo('blackHoleSize'),
    particleGenerateStep: getParameterRangeInfo('particleGenerateStep'),
    particleMoveX: getParameterRangeInfo('particleMoveX'),
    particleMoveAngle: getParameterRangeInfo('particleMoveAngle'),
    distance: getParameterRangeInfo('distance'),
    light: getParameterRangeInfo('light'),
  };
}

export function getInitialParameters() {
  return {
    quasarRadius: INIT_RADIUS,
    blackHoleSize: INIT_BLACK_HOLE_SIZE,
    particleGenerateStep: INIT_PARTICLE_GENERATE_STEP,
    particleMoveX: INIT_PARTICLE_MOVE_X,
    particleMoveAngle: INIT_PARTICLE_MOVE_ANGLE,

    distance: INIT_DISTANCE,
    light: INIT_LIGHT,
    angleX: INIT_ANGLE_X * RAD_TO_DEGR,
    angleY: INIT_ANGLE_Y * RAD_TO_DEGR,
    angleZ: INIT_ANGLE_Z * RAD_TO_DEGR,
  };
}

export function dispose() {
  if (!quasarAnimation) {
    return;
  }

  // Stop animation before disposing resources
  quasarAnimation.stop();

  disposeWebGL(quasarAnimation);
  destroyBuffers(quasarAnimation);

  (quasarAnimation as any) = null;
}
