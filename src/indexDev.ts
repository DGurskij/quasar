import { IQuasarMetrices } from './animation/types';

import { QuasarAnimation } from '.';

declare global {
  interface Window {
    quasarAnimationInit: (canvas: HTMLCanvasElement) => void;
    quasarAnimationPlayPause: (el: HTMLInputElement) => void;
    quasarAnimationStart: () => void;
    quasarAnimationStartJet: () => void;
    quasarAnimationRotate: (value: string, axis: 'x' | 'y' | 'z') => void;
    quasarAnimationForward: (value: string) => void;
    quasarAnimationSetQuasarRadius: (radius: string) => void;
    quasarAnimationSetParticleGenerateStep: (step: string) => void;
  }
}

window.quasarAnimationInit = () => {
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

window.quasarAnimationStart = () => {
  QuasarAnimation.start();
};

window.quasarAnimationPlayPause = (el: HTMLInputElement) => {
  if (el.value === 'Pause') {
    el.value = 'Resume';
  } else {
    el.value = 'Pause';
  }

  QuasarAnimation.playPause();
};

window.quasarAnimationStartJet = () => {
  QuasarAnimation.startJet();
};

window.quasarAnimationForward = (value: string) => {
  QuasarAnimation.forward(parseFloat(value));
};

window.quasarAnimationSetQuasarRadius = (radius: string) => {
  QuasarAnimation.setQuasarRadius(parseFloat(radius));
};

window.quasarAnimationSetParticleGenerateStep = (step: string) => {
  QuasarAnimation.setParticleGenerateStep(parseFloat(step));
};

window.quasarAnimationRotate = (value: string, axis: 'x' | 'y' | 'z') => {
  QuasarAnimation.rotate(parseFloat(value), axis);
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
