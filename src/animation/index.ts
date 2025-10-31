import { WEBGL_STATUSES } from 'src/webgl/WebGLStatus';

import { QuasarAnimation } from './Animation';
import { drawScene, initWebGL } from './DrawFunctions';
import { animationEngine, initParticlesForCanvas } from './EngineFunctions';
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

export function setQuasarRadius(radius: number) {
  quasarAnimation.setQuasarRadius(radius);
}

export function setParticleGenerateStep(step: number) {
  quasarAnimation.setParticleGenerateStep(step);
}

export function rotate(value: number, axis: 'x' | 'y' | 'z') {
  quasarAnimation.rotate(value, axis);
}

export function forward(value: number) {
  quasarAnimation.forward(value);
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
