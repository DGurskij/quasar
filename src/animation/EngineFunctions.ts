/* eslint-disable prefer-destructuring */
import { centerBiasedRandom, leftBiasedRandom, random, vecMulValue, vecSumVec } from 'src/common/math';
import { FLOAT32_SIZE } from 'src/webgl/size.const';

import { PI, PI_DIV_TWO, PI_MUL_TWO } from '../common/math.const';

import {
  COLORS,
  JETS_MOVE_A,
  JETS_MOVE_X,
  JETS_MOVE_Z,
  JETS_START_X,
  JETS_START_X_DISPERSION,
  JETS_START_Z_MULTIPLIER,
  JETS_START_Z_OFFSET,
  MAX_SIZE,
  MIN_SIZE_MUL,
  P_D_ALPHA,
  PARTICLE_Z_DISPERSION_MULTIPLIER,
  QUANTITY_ARM,
  QUANTITY_EL_GENERATE,
} from './animation.const';
import { QuasarAnimation } from './QuasarAnimation';

/**
 * Buffer data for particles
 * [x, y, z, angle, colorR, colorG, colorB]
 */
let particlesGPU: Float32Array;
/**
 * 35M elements for 5M particles - 7 floats per particle
 */
const PARTICLES_GPU_SIZE = 35000000;
let offsetParticlesGPU: number;
/**
 * Data for CPU calculations
 * [abs(0.1 * originZ), originDeltaAngle, originAngle]
 */
let particlesCPU: Float32Array;
/**
 * 15M elements for 5M particles - 3 floats per particle
 */
const PARTICLES_CPU_SIZE = 15000000;
let offsetParticlesCPU: number;

let quantityParticles: number;

/**
 * Buffer data for JET particles
 * [x, y, z, angle, colorR, colorG, colorB]
 */
let jetParticlesGPU: Float32Array;
/**
 * 1.75M elements for 250K jet particles - 7 floats per particle
 */
const JET_PARTICLES_GPU_SIZE = 1750000;
let offsetJetParticlesGPU: number;
/**
 * Data for CPU calculations
 * [directionSign]
 */
let jetParticlesCPU: Float32Array;
/**
 * 250K elements for 250K jet particles - 1 float per particle
 */
const JET_PARTICLES_CPU_SIZE = 250000;
let offsetJetParticlesCPU: number;

let quantityJetParticles: number;

// computed constants
let blackHoleRadiusSquared: number;
let particleZCollapseRadius: number;

let quasarRadius: number;

let particleMoveX: number;
let particleMoveAngle: number;
let particleZ_Dispersion: number;

let jetParticleMoveX: number;
let jetParticleMoveZ: number;
let jetParticleMoveAngle: number;

let jetsStartX: number;
let jetStartXMin: number;
let jetStartXMax: number;
let jetsStartZ: number;

let particlesIndicesForRefresh: number[];
const PARTICLES_INDICES_FOR_REFRESH_SIZE = 100000;
let quantityParticlesForRefresh: number;

let buffersInitialized: boolean = false;
let jetsGPUAllocated: boolean = false;

/**
 * Get Window params and Deploy Field
 */
export function initParticlesForCanvas(this: QuasarAnimation) {
  if (!buffersInitialized) {
    particlesGPU = new Float32Array(PARTICLES_GPU_SIZE);
    particlesCPU = new Float32Array(PARTICLES_CPU_SIZE);

    jetParticlesGPU = new Float32Array(JET_PARTICLES_GPU_SIZE);
    jetParticlesCPU = new Float32Array(JET_PARTICLES_CPU_SIZE);

    particlesIndicesForRefresh = new Array(PARTICLES_INDICES_FOR_REFRESH_SIZE);

    buffersInitialized = true;
  }

  this.particlesGpuF32 = particlesGPU;
  this.jetParticlesGpuF32 = jetParticlesGPU;

  offsetParticlesGPU = 0;
  offsetParticlesCPU = 0;
  quantityParticles = 0;

  offsetJetParticlesGPU = 0;
  offsetJetParticlesCPU = 0;
  quantityJetParticles = 0;

  quantityParticlesForRefresh = 0;

  quasarRadius = this.quasarGenerativeParameters.quasarRadius;
  const blackHoleRadius = this.quasarGenerativeParameters.blackHoleSize * 0.5;

  // compute constants
  blackHoleRadiusSquared = blackHoleRadius ** 2;
  particleZCollapseRadius = blackHoleRadius + quasarRadius * 0.3;

  // copy generative parameters
  particleMoveX = this.quasarGenerativeParameters.particleMoveX;
  particleMoveAngle = this.quasarGenerativeParameters.particleMoveAngle;

  particleZ_Dispersion = this.quasarGenerativeParameters.blackHoleSize * PARTICLE_Z_DISPERSION_MULTIPLIER;

  jetParticleMoveX = JETS_MOVE_X;
  jetParticleMoveZ = JETS_MOVE_Z;
  jetParticleMoveAngle = JETS_MOVE_A;

  jetsStartX = JETS_START_X;
  jetStartXMin = jetsStartX - JETS_START_X_DISPERSION;
  jetStartXMax = jetsStartX + JETS_START_X_DISPERSION;
  jetsStartZ = this.quasarGenerativeParameters.blackHoleSize * JETS_START_Z_MULTIPLIER + JETS_START_Z_OFFSET;

  let radius = quasarRadius;

  const { particleGenerateStep } = this.quasarGenerativeParameters;

  while (radius > blackHoleRadius) {
    generateParticles(radius);
    radius -= particleGenerateStep;
  }

  this.quantityParticles = quantityParticles;

  const { gl } = this;

  // allocate memory for particles
  gl.bindVertexArray(this.particlesVAO);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
  gl.bufferData(gl.ARRAY_BUFFER, offsetParticlesGPU * FLOAT32_SIZE, gl.STREAM_DRAW);

  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
  gl.enableVertexAttribArray(0);

  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
  gl.enableVertexAttribArray(1);

  gl.bindVertexArray(null);

  // allocate memory for jet particles, can be done once
  if (!jetsGPUAllocated) {
    gl.bindVertexArray(this.jetParticlesVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.jetParticlesVBO);
    gl.bufferData(gl.ARRAY_BUFFER, JET_PARTICLES_GPU_SIZE * FLOAT32_SIZE, gl.STREAM_DRAW);

    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
    gl.enableVertexAttribArray(1);

    gl.bindVertexArray(null);

    jetsGPUAllocated = true;
  }
}

/**
 * Move particles and jet particles
 */
export function animationEngine(this: QuasarAnimation) {
  quantityParticlesForRefresh = 0;

  for (let i = 0; i < quantityParticles; i++) {
    if (particleInBlackHole(i)) {
      particlesIndicesForRefresh[quantityParticlesForRefresh++] = i;
    } else {
      const particleF32Ptr = 7 * i;
      // move particles which are not in the black hole
      // particlesGPU[particlePtr] -= particleMoveX * (2.0 - particlesGPU[particlePtr] / quasarRadius);
      // particlesGPU[particlePtr + 3] += particleMoveAngle * (2.0 - particlesGPU[particlePtr] / quasarRadius);
      particlesGPU[particleF32Ptr] -= particleMoveX;
      particlesGPU[particleF32Ptr + 3] += particleMoveAngle;

      if (particlesGPU[particleF32Ptr] < particleZCollapseRadius && Math.abs(particlesGPU[particleF32Ptr + 1]) > particlesCPU[3 * i]) {
        particlesGPU[particleF32Ptr + 1] *= 0.995;
      }
    }
  }

  // console.log(quantityParticlesForRefresh);

  refreshParticles();

  for (let i = 0; i < quantityJetParticles; i++) {
    const jetParticleF32Ptr = 7 * i;

    jetParticlesGPU[jetParticleF32Ptr] += jetParticleMoveX;
    jetParticlesGPU[jetParticleF32Ptr + 1] += jetParticleMoveZ * jetParticlesCPU[i];
    jetParticlesGPU[jetParticleF32Ptr + 3] -= jetParticleMoveAngle * jetParticlesCPU[i]; // angle is reversed for top jets
  }

  if (this.jetsTime > 0) {
    this.jetLight = 1;
    generateJetParticles();
    this.jetsTime--;
  } else {
    this.jetLight -= 0.025;

    if (this.jetLight < 0 && this.quantityJetParticles !== 0) {
      // console.log(this.quantityJetParticles);

      quantityJetParticles = 0;
      offsetJetParticlesGPU = 0;
      offsetJetParticlesCPU = 0;
    }
  }

  this.quantityJetParticles = quantityJetParticles;
}

function particleInBlackHole(index: number) {
  const x = particlesGPU[7 * index];
  const z = particlesGPU[7 * index + 1];
  const distanceSquared = x * x + z * z;

  return distanceSquared < blackHoleRadiusSquared;
}

function refreshParticles() {
  for (let i = 0; i < quantityParticlesForRefresh; i++) {
    const particleF32Ptr = 7 * particlesIndicesForRefresh[i];
    const particleIndex = particlesIndicesForRefresh[i];

    const z = centerBiasedRandom(-particleZ_Dispersion, particleZ_Dispersion, 2.1);
    const dispersion = (Math.abs(particlesCPU[3 * particleIndex + 1]) / PI) * 3 + Math.abs(z) / particleZ_Dispersion;

    particlesGPU[particleF32Ptr] = quasarRadius; // set particle to quasar radius
    particlesGPU[particleF32Ptr + 1] = z; // set particle z to origin z
    particlesGPU[particleF32Ptr + 2] = MAX_SIZE - MIN_SIZE_MUL * dispersion; // set particle size based on dispersion
    particlesGPU[particleF32Ptr + 3] = particlesCPU[3 * particleIndex + 2]; // set particle angle to origin angle

    particlesCPU[3 * particleIndex] = leftBiasedRandom(0, 0.8, 3.0) * z;
  }
}

function generateParticles(v: number) {
  let angle = PI_MUL_TWO;
  let size;
  const deltaColor = [0, 0, 0];
  // let start = startPosition;

  const alphaOffset = (particleMoveAngle * (quasarRadius - v)) / particleMoveX;

  // const quantityElGenerate = QUANTITY_EL_GENERATE * 0.5 + QUANTITY_EL_GENERATE * (1.0 - v / quasarRadius);

  for (let k = 0; k < QUANTITY_ARM; k++) {
    for (let i = 0; i < QUANTITY_EL_GENERATE; i++) {
      // const deltaAngle = random(-PI_DIV_TWO, PI_DIV_TWO);
      // const z = random(-particleZ_Dispersion, particleZ_Dispersion);
      const deltaAngle = centerBiasedRandom(-PI_DIV_TWO, PI_DIV_TWO, 1.1 + (0.9 - v / quasarRadius));
      const z = centerBiasedRandom(-particleZ_Dispersion, particleZ_Dispersion, 1.1 + (0.9 - v / quasarRadius));
      const minZ = leftBiasedRandom(0, 0.8, 3.0) * z;
      const dispersion = (Math.abs(deltaAngle) / PI) * 3 + Math.abs(z) / particleZ_Dispersion;

      size = MAX_SIZE - MIN_SIZE_MUL * dispersion;

      deltaColor[0] = dispersion;

      const color = vecMulValue(vecSumVec(COLORS[k], deltaColor), 1.0);

      particlesGPU[offsetParticlesGPU++] = v;
      particlesGPU[offsetParticlesGPU++] = v < particleZCollapseRadius ? minZ : z;
      particlesGPU[offsetParticlesGPU++] = size;
      particlesGPU[offsetParticlesGPU++] = angle + alphaOffset + deltaAngle;

      particlesGPU[offsetParticlesGPU++] = color[0];
      particlesGPU[offsetParticlesGPU++] = color[1];
      particlesGPU[offsetParticlesGPU++] = color[2];

      particlesCPU[offsetParticlesCPU++] = Math.abs(minZ);
      particlesCPU[offsetParticlesCPU++] = deltaAngle;
      particlesCPU[offsetParticlesCPU++] = angle + deltaAngle;

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

  for (let i = 0; i < 50; i++) {
    // bottom jet
    x = centerBiasedRandom(jetStartXMin, jetStartXMax, 5.3);
    angle = centerBiasedRandom(0, PI_MUL_TWO, 5.3);
    size = random(0.7, 1.5);
    z = -jetsStartZ - random(0, 16);

    jetParticlesGPU[offsetJetParticlesGPU++] = x;
    jetParticlesGPU[offsetJetParticlesGPU++] = z;
    jetParticlesGPU[offsetJetParticlesGPU++] = size;
    jetParticlesGPU[offsetJetParticlesGPU++] = angle;

    jetParticlesGPU[offsetJetParticlesGPU++] = 0;
    jetParticlesGPU[offsetJetParticlesGPU++] = 1.4 - angle / PI_MUL_TWO;
    jetParticlesGPU[offsetJetParticlesGPU++] = 1;

    jetParticlesCPU[offsetJetParticlesCPU++] = -1;

    // jetMinus[quantityParticlesJetMinus++] = {
    //   x: x,
    //   z: z,
    //   size: size,
    //   angle: angle,
    //   color: [0, 1.4 - angle / PI_MUL_TWO, 1],
    // };

    // top jet
    x = centerBiasedRandom(jetStartXMin, jetStartXMax, 5.3);
    angle = centerBiasedRandom(0, PI_MUL_TWO, 5.3);
    size = random(0.7, 1.5);
    z = jetsStartZ + random(0, 16);

    jetParticlesGPU[offsetJetParticlesGPU++] = x;
    jetParticlesGPU[offsetJetParticlesGPU++] = z;
    jetParticlesGPU[offsetJetParticlesGPU++] = size;
    jetParticlesGPU[offsetJetParticlesGPU++] = angle;

    jetParticlesGPU[offsetJetParticlesGPU++] = 0;
    jetParticlesGPU[offsetJetParticlesGPU++] = 1.4 - angle / PI_MUL_TWO;
    jetParticlesGPU[offsetJetParticlesGPU++] = 1;

    jetParticlesCPU[offsetJetParticlesCPU++] = 1;

    // jetPlus[quantityParticlesJetPlus++] = {
    //   x: x,
    //   z: z,
    //   size: size,
    //   angle: angle,
    //   color: [0, 1.4 - angle / PI_MUL_TWO, 1.0],
    // };
  }

  quantityJetParticles += 50 * 2; // 40 bottom jets + 40 top jets
}

/**
 * destroy and unlink float32 arrays and another large arrays
 */
export function destroyBuffers(qa: QuasarAnimation) {
  (qa.particlesGpuF32 as any) = null;
  (qa.jetParticlesGpuF32 as any) = null;

  (particlesGPU as any) = null;
  (jetParticlesGPU as any) = null;

  (particlesCPU as any) = null;
  (jetParticlesCPU as any) = null;

  (particlesIndicesForRefresh as any) = null;
  quantityParticlesForRefresh = 0;

  buffersInitialized = false;
  jetsGPUAllocated = false;
}
