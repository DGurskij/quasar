import { getProjectionMatrix, getRotationX, getRotationY, getRotationZ, getTransformation } from 'src/common/math';

import { BLACK_HOLE_SIZE, DEGR_TO_RAD, INIT_ANGLE_X, INIT_ANGLE_Y, INIT_ANGLE_Z, JETS_TIME } from './constants';
import { IJetParticle } from './types';

export class QuasarAnimation {
  engineFPS: number = 60;

  /** Game state: 0 - not started, 1 - started, 2 - paused */
  animationState: 0 | 1 | 2 = 0;

  globalRadius: number = 0;
  globalConst: number = 0;

  angleX: number = 0;
  angleY: number = 0;
  angleZ: number = 0;
  distance: number = 0;

  // shaders matrices
  matRotateX: number[] = []; // rotate matrix for x axis
  matRotateY: number[] = []; // rotate matrix for y axis
  matRotateZ: number[] = []; // rotate matrix for z axis
  matProjection: number[] = []; // projection matrix
  matTransformation: number[] = []; // transformation matrix

  // quasar size and depth
  width: number = 0;
  height: number = 0;
  depth: number = 0;

  // particles
  particles: number[] = [];
  quantityParticles: number = 0;
  particlesVAO: WebGLVertexArrayObject;
  particlesVBO: WebGLBuffer;

  // jet particles
  jetMinus: IJetParticle[] = [];
  quantityParticlesJetMinus: number = 0;
  jetPlus: IJetParticle[] = [];
  quantityParticlesJetPlus: number = 0;

  light: number = 0;
  jetTime: number = 0;
  jetLight: number = 0;
  blackHoleSize: number = 0;
  jetsMaxZ: number = 0;

  engineFunction: (...args: any[]) => void;
  initParticlesFunction: (...args: any[]) => void;
  drawFunction: (...args: any[]) => void;
  onPlayPause: (state: 0 | 1) => void;

  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.engineFunction = () => {};
    this.initParticlesFunction = () => {};
    this.drawFunction = () => {};
    this.onPlayPause = () => {};

    this.particlesVAO = gl.createVertexArray();
    this.particlesVBO = gl.createBuffer();
  }

  setAreaSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.gl.canvas.width = width;
    this.gl.canvas.height = height;

    this.matProjection = getProjectionMatrix(this.width, this.height, this.depth);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    if (this.animationState === 2) {
      this.drawFunction();
    }
  }

  start() {
    this.animationState = 1;

    this.light = 1.0;
    this.jetLight = 1.0;
    this.distance = 1;

    this.initParticlesFunction();

    this.blackHoleSize = BLACK_HOLE_SIZE * this.globalConst;

    this.matProjection = getProjectionMatrix(this.width, this.height, this.depth);

    this.matRotateX = getRotationX(INIT_ANGLE_X);
    this.matRotateY = getRotationY(INIT_ANGLE_Y);
    this.matRotateZ = getRotationZ(INIT_ANGLE_Z);

    this.updateTransformation();

    // let rotate_controllers = document.getElementsByName('control_rotate');

    // rotate_controllers[0].value = INIT_ANGLE_X * RAD_TO_DEGR;
    // rotate_controllers[1].value = INIT_ANGLE_Y * RAD_TO_DEGR;
    // rotate_controllers[2].value = INIT_ANGLE_Z * RAD_TO_DEGR;

    // distance = 1;

    this.engineFunction();
  }

  pause(send = false) {
    this.animationState = 2;
    this.drawFunction();

    if (send) {
      this.onPlayPause(0);
    }
  }

  resume(send = false) {
    this.animationState = 1;
    this.engineFunction();

    if (send) {
      this.onPlayPause(1);
    }
  }

  startJet() {
    this.jetTime = JETS_TIME;
  }

  forward(value: number) {
    this.distance = value;

    if (this.animationState === 2) {
      this.drawFunction();
    }
  }

  rotate(value: number, axis: 'x' | 'y' | 'z') {
    const v = value * DEGR_TO_RAD;

    switch (axis) {
      case 'z':
        this.angleZ = v;
        this.matRotateZ = getRotationZ(v);
        break;
      case 'y':
        this.angleY = v;
        this.matRotateY = getRotationY(v);
        break;
      case 'x':
        this.angleX = v;
        this.matRotateX = getRotationX(v);
    }

    this.updateTransformation();

    if (this.animationState === 2) {
      this.drawFunction();
    }
  }

  private updateTransformation() {
    this.matTransformation = getTransformation(this.matRotateZ, this.matRotateY, this.matRotateX, this.matProjection);
  }
}
