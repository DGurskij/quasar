import { centerBiasedRandom, leftBiasedRandom, random, vecMulValue, vecSumVec } from 'src/common/math';

import { PI, PI_DIV_TWO, PI_MUL_TWO } from '../common/math.const';

import { QuasarAnimation } from './Animation';
import {
  BLACK_HOLE_RADIUS_SQUARED,
  BLACK_HOLE_SIZE,
  COLORS,
  JETS_MAX_Z,
  JETS_MOVE_A,
  JETS_MOVE_X,
  JETS_MOVE_Z,
  JETS_START_X,
  JETS_START_X_DISPERSION,
  JETS_START_Z,
  MAX_SIZE,
  MIN_SIZE_MUL,
  P_D_ALPHA,
  P_GEN_OFFSET,
  P_MOVE_ANGLE,
  P_MOVE_X,
  P_Z_DISPERSION,
  QUANTITY_ARM,
  QUANTITY_EL_GENERATE,
} from './generate.const';
import { IJetParticle } from './types';

/**
 * Buffer data for particles
 * [x, y, z, angle, colorR, colorG, colorB]
 */
let particlesGPU: Float32Array;
let offsetGPU: number = 0;
/**
 * Data for CPU calculations
 * [abs(0.1 * originZ), originZ, originAngle]
 */
let particlesCPU: Float32Array;
let offsetCPU: number = 0;

let quantityParticles: number = 0;

let jetMinus: IJetParticle[] = [];
let quantityParticlesJetMinus: number = 0;
let jetPlus: IJetParticle[] = [];
let quantityParticlesJetPlus: number = 0;

// let addParticle;

let quasarRadius: number;
let globalConst: number;

let particleMoveX: number;
let particleMoveAngle: number;
// let particlesAddStep: number;
let particleZ_Dispersion: number;

//let p_add_step_j;

let particleGenerateOffset: number;

let jetParticleMoveX: number;
let jetParticleMoveZ: number;
let jetParticleMoveAngle: number;

let jetsMaxZ: number;
let jetsStartX: number;
let jetStartXMin: number;
let jetStartXMax: number;
let jetsStartZ: number;

const particlesIndicesForRefresh: number[] = new Array(100000);
let quantityParticlesForRefresh: number = 0;

/**
 * Get Window params and Deploy Field
 */
export function initParticlesForCanvas(this: QuasarAnimation) {
  particlesGPU = new Float32Array(35000000); // 35M elements for 5M particles
  particlesCPU = new Float32Array(15000000); // 15M elements for 5M particles

  this.particlesF32 = particlesGPU;
  jetMinus = [];
  this.jetMinus = jetMinus;
  jetPlus = [];
  this.jetPlus = jetPlus;

  offsetGPU = 0;
  offsetCPU = 0;

  quantityParticles = 0;
  quantityParticlesJetMinus = 0;
  quantityParticlesJetPlus = 0;

  // eslint-disable-next-line prefer-destructuring
  quasarRadius = this.quasarRadius;
  // this.globalRadius = globalRadius;
  globalConst = quasarRadius / 600;
  this.globalConst = globalConst;

  particleMoveX = P_MOVE_X * globalConst;
  particleMoveAngle = P_MOVE_ANGLE * globalConst;

  particleGenerateOffset = P_GEN_OFFSET / globalConst;
  particleZ_Dispersion = P_Z_DISPERSION; // P_Z_DISPERSION * globalConst;

  jetParticleMoveX = JETS_MOVE_X;
  jetParticleMoveZ = JETS_MOVE_Z;
  jetParticleMoveAngle = JETS_MOVE_A;
  jetsMaxZ = JETS_MAX_Z * globalConst;
  this.jetsMaxZ = jetsMaxZ;
  jetsStartX = JETS_START_X;
  jetStartXMin = jetsStartX - JETS_START_X_DISPERSION;
  jetStartXMax = jetsStartX + JETS_START_X_DISPERSION;
  jetsStartZ = JETS_START_Z;

  let radius = quasarRadius;
  offsetGPU = 0;

  // eslint-disable-next-line prefer-destructuring
  const particleGenerateStep = this.particleGenerateStep;
  console.log('particleGenerateStep', particleGenerateStep);

  while (radius > 0) {
    generateParticles(radius);
    radius -= particleGenerateStep;
  }

  this.quantityParticles = quantityParticles;
  // console.log(particles);

  // store particles in buffer
  const { gl } = this;

  gl.bindVertexArray(this.particlesVAO);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particlesGPU), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
  gl.enableVertexAttribArray(0);

  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
  gl.enableVertexAttribArray(1);

  gl.bindVertexArray(null);
}

/**
 * Move particles and jet particles
 */
export function animationEngine(this: QuasarAnimation) {
  // let flag = 0;
  // let deletedStart = -1; // Index of the first particle to be deleted
  quantityParticlesForRefresh = 0;

  for (let i = 0; i < quantityParticles; i++) {
    if (particleInBlackHole(i)) {
      particlesIndicesForRefresh[quantityParticlesForRefresh++] = i;
    } else {
      const particlePtr = 7 * i;
      // move particles which are not in the black hole
      // particlesGPU[particlePtr] -= particleMoveX * (2.0 - particlesGPU[particlePtr] / quasarRadius);
      // particlesGPU[particlePtr + 3] += particleMoveAngle * (2.0 - particlesGPU[particlePtr] / quasarRadius);
      particlesGPU[particlePtr] -= particleMoveX;
      particlesGPU[particlePtr + 3] += particleMoveAngle;

      if (
        particlesGPU[particlePtr] < BLACK_HOLE_SIZE + quasarRadius * 0.3 &&
        Math.abs(particlesGPU[particlePtr + 1]) > particlesCPU[3 * i]
      ) {
        particlesGPU[particlePtr + 1] *= 0.995;
      }
    }
  }

  refreshParticles();

  for (let i = 0; i < quantityParticlesJetMinus; i++) {
    jetMinus[i].x += jetParticleMoveX;
    jetMinus[i].z -= jetParticleMoveZ;
    jetMinus[i].angle += jetParticleMoveAngle;
  }

  for (let i = 0; i < quantityParticlesJetPlus; i++) {
    jetPlus[i].x += jetParticleMoveX;
    jetPlus[i].z += jetParticleMoveZ;
    jetPlus[i].angle -= jetParticleMoveAngle;
  }

  if (this.jetsTime > 0) {
    this.jetLight = 1;
    generateJetParticles();
    this.jetsTime--;
  } else {
    this.jetLight -= 0.025;

    if (this.jetLight < 0 && this.quantityParticlesJetPlus !== 0 && this.quantityParticlesJetMinus !== 0) {
      console.log(this.quantityParticlesJetMinus, this.quantityParticlesJetPlus);
      quantityParticlesJetPlus = 0;
      quantityParticlesJetMinus = 0;

      jetPlus = [];
      this.jetPlus = jetPlus;
      jetMinus = [];
      this.jetMinus = jetMinus;
    }
  }

  this.quantityParticlesJetMinus = quantityParticlesJetMinus;
  this.quantityParticlesJetPlus = quantityParticlesJetPlus;
}

function particleInBlackHole(index: number) {
  const x = particlesGPU[7 * index];
  const z = particlesGPU[7 * index + 1];
  const distanceSquared = x * x + z * z;

  return distanceSquared < BLACK_HOLE_RADIUS_SQUARED;
  // return false;
}

function refreshParticles() {
  for (let i = 0; i < quantityParticlesForRefresh; i++) {
    const index = particlesIndicesForRefresh[i];
    particlesGPU[7 * index] = quasarRadius; // set particle to quasar radius
    particlesCPU[3 * index + 1] = centerBiasedRandom(-particleZ_Dispersion, particleZ_Dispersion, 0.1); // particlesCPU[3 * index + 2]; // set particle z to origin z
    particlesGPU[7 * index + 3] = particlesCPU[3 * index + 2]; // set particle angle to origin angle
    // particlesGPU[7 * index + 3] = particlesCPU[3 * index + 2] + centerBiasedRandom(-PI_DIV_TWO, PI_DIV_TWO, 1.1); // set particle angle to origin angle
  }
}

function generateParticles(v: number) {
  let angle = PI_MUL_TWO;
  let size;
  const deltaColor = [0, 0, 0];
  // let start = startPosition;

  const alphaOffset = particleGenerateOffset * (quasarRadius - v);

  const quantityElGenerate = QUANTITY_EL_GENERATE * 0.5 + QUANTITY_EL_GENERATE * (1.0 - v / quasarRadius);

  for (let k = 0; k < QUANTITY_ARM; k++) {
    for (let i = 0; i < quantityElGenerate; i++) {
      // const deltaAngle = random(-PI_DIV_TWO, PI_DIV_TWO);
      // const z = random(-particleZ_Dispersion, particleZ_Dispersion);
      const deltaAngle = centerBiasedRandom(-PI_DIV_TWO, PI_DIV_TWO, 1.1 + (0.9 - v / quasarRadius));
      const z = centerBiasedRandom(-particleZ_Dispersion, particleZ_Dispersion, 1.1 + (0.9 - v / quasarRadius));
      const minZ = leftBiasedRandom(0, 0.8, 3.0) * z;
      const dispersion = (Math.abs(deltaAngle) / PI) * 3 + Math.abs(z) / particleZ_Dispersion;

      size = MAX_SIZE - MIN_SIZE_MUL * dispersion;

      deltaColor[0] = dispersion;

      const color = vecMulValue(vecSumVec(COLORS[k], deltaColor), 1.0);

      particlesGPU[offsetGPU++] = v;
      particlesGPU[offsetGPU++] = v < BLACK_HOLE_SIZE + quasarRadius * 0.3 ? minZ : z;
      particlesGPU[offsetGPU++] = size;
      particlesGPU[offsetGPU++] = angle + alphaOffset + deltaAngle;

      particlesGPU[offsetGPU++] = color[0];
      particlesGPU[offsetGPU++] = color[1];
      particlesGPU[offsetGPU++] = color[2];

      particlesCPU[offsetCPU++] = Math.abs(minZ);
      particlesCPU[offsetCPU++] = z;
      particlesCPU[offsetCPU++] = angle + deltaAngle;

      quantityParticles++;
    }

    angle -= P_D_ALPHA;
  }
}

function generateJetParticles() {
  let angle: number;
  let size: number;
  let x: number;
  let z: number;
  // let color: [number, number, number];

  for (let i = 0; i < 40; i++) {
    x = centerBiasedRandom(jetStartXMin, jetStartXMax, 4.3);
    angle = centerBiasedRandom(0, PI_MUL_TWO, 4.3);
    size = random(1, 1.5);
    z = -jetsStartZ - random(0, 16);

    jetMinus[quantityParticlesJetMinus++] = {
      x: x,
      z: z,
      size: size,
      angle: angle,
      color: [0, 1.4 - angle / PI_MUL_TWO, 1],
    };

    x = centerBiasedRandom(jetStartXMin, jetStartXMax, 4.3);
    angle = centerBiasedRandom(0, PI_MUL_TWO, 4.3);
    size = random(1, 2.5);
    z = jetsStartZ + random(0, 16);

    jetPlus[quantityParticlesJetPlus++] = {
      x: x,
      z: z,
      size: size,
      angle: angle,
      color: [0, 1.4 - angle / PI_MUL_TWO, 1.0],
    };
  }
}
