import { WEBGL_STATUSES } from 'src/webgl/WebGLStatus';

import { QuasarAnimation } from './Animation';
import { drawScene, initWebGL } from './DrawFunctions';
import { animationEngine, initParticlesForCanvas } from './EngineFunctions';

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
  quasarAnimation.start();
}

export function playPause() {
  if (quasarAnimation.animationState === 2) {
    quasarAnimation.resume();
  } else if (quasarAnimation.animationState === 1) {
    quasarAnimation.pause();
  }
}

export function setAreaSize(width: number, height: number) {
  quasarAnimation.setAreaSize(width, height);
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
