import { IQuasarMetrices } from './animation/types';

import { QuasarAnimation } from '.';

declare global {
  interface Window {
    animationInit: (canvas: HTMLCanvasElement) => void;
    animationPlayPause: (el: HTMLInputElement) => void;
    animationStart: () => void;
    animationStartJet: () => void;

    animationSetQuasarRadius: (radius: string) => void;
    animationSetBlackHoleSize: (size: string) => void;
    animationSetParticleGenerateStep: (step: string) => void;
    animationSetParticleMoveX: (x: string) => void;
    animationSetParticleMoveAngle: (angle: string) => void;

    animationRotate: (value: string, axis: 'x' | 'y' | 'z') => void;
    animationForward: (value: string) => void;
    animationUpdateLight: (value: string) => void;
  }
}

window.animationInit = () => {
  const canvas = document.getElementById('area') as HTMLCanvasElement;
  QuasarAnimation.init(canvas);

  QuasarAnimation.setRotateCb(rotateCbHandler);
  QuasarAnimation.setUpdateMetricesCb(updateMetricesCbHandler);

  const parentElement = canvas.parentElement as HTMLDivElement;
  const parentWidth = parentElement.clientWidth;
  const parentHeight = parentElement.clientHeight;

  QuasarAnimation.setCanvasSize(parentWidth, parentHeight);
  QuasarAnimation.start();
};

window.animationStart = () => {
  QuasarAnimation.start();
};

window.animationPlayPause = (el: HTMLInputElement) => {
  if (el.value === 'Pause') {
    el.value = 'Resume';
  } else {
    el.value = 'Pause';
  }

  QuasarAnimation.playPause();
};

window.animationStartJet = () => {
  QuasarAnimation.startJet();
};

// generator parameters set
window.animationSetQuasarRadius = (radius: string) => {
  QuasarAnimation.setQuasarRadius(parseFloat(radius));
};

window.animationSetBlackHoleSize = (size: string) => {
  QuasarAnimation.setBlackHoleSize(parseFloat(size));
};

window.animationSetParticleGenerateStep = (step: string) => {
  QuasarAnimation.setParticleGenerateStep(parseFloat(step));
};

window.animationSetParticleMoveX = (x: string) => {
  QuasarAnimation.setParticleMoveX(parseFloat(x));
};

window.animationSetParticleMoveAngle = (angle: string) => {
  QuasarAnimation.setParticleMoveAngle(parseFloat(angle));
};

// dynamic parameters update
window.animationRotate = (value: string, axis: 'x' | 'y' | 'z') => {
  QuasarAnimation.rotate(parseFloat(value), axis);
};

window.animationForward = (value: string) => {
  QuasarAnimation.forward(parseFloat(value));
};

window.animationUpdateLight = (value: string) => {
  QuasarAnimation.updateLight(parseFloat(value));
};

function rotateCbHandler(value: number, axis: 'x' | 'y' | 'z') {
  const rotateInputs = document.getElementsByName('control_rotate') as NodeListOf<HTMLInputElement>;

  switch (axis) {
    case 'x':
      rotateInputs[0].value = value.toString();
      break;
    case 'y':
      rotateInputs[1].value = value.toString();
      break;
    case 'z':
      rotateInputs[2].value = value.toString();
  }
}

function updateMetricesCbHandler(metrices: IQuasarMetrices) {
  console.log('metrices', metrices);
}

// var hide = function () {
//   let panel = document.getElementById('panel');
//   let h = document.getElementById('hide');

//   if (h.value == '<') {
//     let width = panel.getBoundingClientRect().width;
//     let h_w = h.getBoundingClientRect().width;

//     panel.style.left = -width + h_w + 'px';
//     h.value = '>';
//   } else {
//     panel.style.left = '1%';
//     h.value = '<';
//   }
// };
