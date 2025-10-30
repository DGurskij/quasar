import { QuasarAnimation } from '.';

declare global {
  interface Window {
    quasarAnimationInit: (canvas: HTMLCanvasElement) => void;
    quasarAnimationPlayPause: (el: HTMLInputElement) => void;
    quasarAnimationStartJet: () => void;
  }
}

window.quasarAnimationInit = () => {
  const canvas = document.getElementById('area') as HTMLCanvasElement;
  QuasarAnimation.init(canvas);

  QuasarAnimation.setAreaSize(2040, 1000);
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

// var resume = function (el) {
//   el.value = 'Pause';
//   el.onclick = () => pause(el);

//   state = 1;
//   engine = setInterval(animationEngine, 16);
// };

// var rotate = function (value, index) {
//   let v = value * DEGR_TO_RAD;

//   if (index == 2) {
//     rotate_z = getRotationZ(v);
//   } else if (index) {
//     rotate_y = getRotationY(v);
//   } else {
//     rotate_x = getRotationX(v);
//   }

//   setTransformation();

//   drawScene();
// };

// var forward = function (value) {
//   distance = value;

//   drawScene();
// };

// var generateJet = function () {
//   if (jets_time == 0) {
//     jets_time = JETS_TIME;
//   }
// };

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
