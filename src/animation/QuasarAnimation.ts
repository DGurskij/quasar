import { getProjectionMatrix, getRotationX, getRotationY, getRotationZ, getTransformation } from 'src/common/math';
import { DEGR_TO_RAD, RAD_TO_DEGR } from 'src/common/math.const';

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
  JETS_TIME,
} from './animation.const';
import { IQuasarGenerativeParameters, IQuasarMetrices } from './types';

let drawTimeSum: number = 0;
let frameCount: number = 0;

export class QuasarAnimation {
  engineFPS: number = 60;
  frameTime: number = 0;
  lastTime: number = 0;
  bindedLoop: () => void;

  /** Game state: 0 - not started, 1 - started, 2 - paused */
  animationState: 0 | 1 | 2 = 0;

  // quasar size and generative parameters
  nextQuasarGenerativeParameters: IQuasarGenerativeParameters;
  quasarGenerativeParameters: IQuasarGenerativeParameters;

  // dynamic parameters
  angleX: number = 0;
  angleY: number = 0;
  angleZ: number = 0;
  distance: number = 0;
  light: number = 0;

  // view matrices and parameters
  width: number = 0;
  height: number = 0;
  depth: number = 0;

  matRotateX: number[] = []; // rotate matrix for x axis
  matRotateY: number[] = []; // rotate matrix for y axis
  matRotateZ: number[] = []; // rotate matrix for z axis
  matProjection: number[] = []; // projection matrix
  matTransformation: number[] = []; // transformation matrix

  // particles
  particlesGpuF32!: Float32Array;
  quantityParticles: number = 0;
  particlesVAO: WebGLVertexArrayObject;
  particlesVBO: WebGLBuffer;

  // jet particles
  jetParticlesGpuF32!: Float32Array;
  quantityJetParticles: number = 0;
  jetParticlesVAO: WebGLVertexArrayObject;
  jetParticlesVBO: WebGLBuffer;

  jetsTime: number = 0;
  jetLight: number = 0;
  blackHoleSize: number = 0;
  jetsMaxZ: number = 0;

  engineFunction: (...args: any[]) => void;
  initParticlesFunction: (...args: any[]) => void;
  drawFunction: (...args: any[]) => void;
  onPlayPause: (state: 0 | 1) => void;
  onRotate: (value: number, axis: 'x' | 'y' | 'z') => void;
  onUpdateMetrices: (metrices: IQuasarMetrices) => void;

  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.engineFunction = () => {};
    this.initParticlesFunction = () => {};
    this.drawFunction = () => {};
    this.onPlayPause = () => {};
    this.onRotate = () => {};
    this.onUpdateMetrices = () => {};

    this.particlesVAO = gl.createVertexArray();
    this.particlesVBO = gl.createBuffer();

    this.jetParticlesVAO = gl.createVertexArray();
    this.jetParticlesVBO = gl.createBuffer();

    this.nextQuasarGenerativeParameters = {
      quasarRadius: INIT_RADIUS,
      blackHoleSize: INIT_BLACK_HOLE_SIZE,
      particleMoveX: INIT_PARTICLE_MOVE_X,
      particleMoveAngle: INIT_PARTICLE_MOVE_ANGLE,
      particleGenerateStep: INIT_PARTICLE_GENERATE_STEP,
    };
    this.quasarGenerativeParameters = { ...this.nextQuasarGenerativeParameters };

    this.angleX = INIT_ANGLE_X;
    this.angleY = INIT_ANGLE_Y;
    this.angleZ = INIT_ANGLE_Z;
    this.distance = INIT_DISTANCE;
    this.light = INIT_LIGHT;

    this.bindedLoop = this.loop.bind(this);
  }

  setCanvasSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.depth = (width + height) * 2.5;

    this.gl.canvas.width = width;
    this.gl.canvas.height = height;

    this.matProjection = getProjectionMatrix(this.width, this.height, this.depth);
    this.updateTransformation();

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    if (this.animationState === 2) {
      this.drawFunction();
    }
  }

  start() {
    this.frameTime = 1000 / this.engineFPS;

    this.animationState = 1;

    this.jetLight = 1.0;
    this.jetsTime = 0;
    this.quasarGenerativeParameters = { ...this.nextQuasarGenerativeParameters }; // copy next parameters to current

    this.initParticlesFunction();

    this.matProjection = getProjectionMatrix(this.width, this.height, this.depth);

    this.matRotateX = getRotationX(this.angleX);
    this.matRotateY = getRotationY(this.angleY);
    this.matRotateZ = getRotationZ(this.angleZ);

    this.updateTransformation();

    this.onRotate(this.angleX * RAD_TO_DEGR, 'x');
    this.onRotate(this.angleY * RAD_TO_DEGR, 'y');
    this.onRotate(this.angleZ * RAD_TO_DEGR, 'z');

    this.onUpdateMetrices({
      quantityParticles: this.quantityParticles,
      quantityValues: this.quantityParticles * 7,
    });

    drawTimeSum = 0;
    frameCount = 0;
    this.lastTime = performance.now();
    // for (let i = 0; i < 2000; i++) {
    //   this.engineFunction();
    // }
    this.loop();
  }

  loop() {
    if (this.animationState !== 1) {
      return;
    }

    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= this.frameTime) {
      this.lastTime = now;

      // const t1 = performance.now();
      this.engineFunction();
      const t2 = performance.now();
      this.drawFunction();
      const t3 = performance.now();
      // console.log('draw time', t3 - t2);
      drawTimeSum += t3 - t2;
      frameCount++;
    }

    setTimeout(this.bindedLoop, 1);

    // const t1 = performance.now();

    // this.engineFunction();
    // const t2 = performance.now();
    // this.drawFunction();

    // const t3 = performance.now();

    // console.log('engine', t2 - t1, 'draw', t3 - t2);
  }

  stop() {
    this.animationState = 0;
  }

  pause(send = false) {
    this.animationState = 2;

    if (send) {
      this.onPlayPause(0);
    }

    console.log('drawTimeSum', drawTimeSum);
    console.log('frameCount', frameCount);
    console.log('avgDrawTime', drawTimeSum / frameCount);
  }

  resume(send = false) {
    this.animationState = 1;
    this.loop();

    if (send) {
      this.onPlayPause(1);
    }
  }

  startJet() {
    this.jetsTime = JETS_TIME;
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

  forward(value: number) {
    this.distance = value;

    if (this.animationState === 2) {
      this.drawFunction();
    }
  }

  updateLight(value: number) {
    this.light = value;
  }

  private updateTransformation() {
    this.matTransformation = getTransformation(this.matRotateZ, this.matRotateY, this.matRotateX, this.matProjection);
  }
}
