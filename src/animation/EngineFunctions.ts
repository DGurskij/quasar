import { random, vecMulValue, vecSumVec } from 'src/common/math';

import { QuasarAnimation } from './Animation';
import {
  COLORS,
  JETS_MAX_Z,
  JETS_MOVE_A,
  JETS_MOVE_X,
  JETS_MOVE_Z,
  JETS_START_X,
  JETS_START_Z,
  MAX_SIZE,
  MIN_SIZE_MUL,
  P_D_ALPHA,
  P_GEN_OFFSET,
  P_GENERATE_STEP,
  P_MIN_X,
  P_MOVE_ANGLE,
  P_MOVE_X,
  P_Z_DISPERSION,
  PI,
  PI_DIV_TWO,
  PI_MUL_TWO,
  QUANTITY_ARM,
  QUANTITY_EL_GENERATE,
} from './constants';
import { IJetParticle } from './types';

/**
 * Buffer data for particles
 */
let particles: number[] = [];
let quantityParticles: number = 0;
let offset: number = 0;

let jetMinus: IJetParticle[] = [];
let quantityParticlesJetMinus: number = 0;
let jetPlus: IJetParticle[] = [];
let quantityParticlesJetPlus: number = 0;
let jetsTime: number = 0;

// let addParticle;

let globalRadius: number;
let globalConst: number;

let particleMoveX: number;
let particleMoveAngle: number;
// let particlesAddStep: number;
let particleZ_Dispersion: number;
let particleMinX: number;

//let p_add_step_j;

let particleGenerateOffset: number;

let jetParticleMoveX: number;
let jetParticleMoveZ: number;
let jetParticleMoveAngle: number;

let jetsMaxZ: number;
let jetsStartX: number;
let jetsStartZ: number;

/**
 * Get Window params and Deploy Field
 */
export function initParticlesForCanvas(this: QuasarAnimation) {
  particles = [];
  // flashes = [];
  quantityParticles = 0;
  // quantity_flashes = flashes.length;
  jetsTime = 0;
  jetMinus = [];
  this.jetMinus = jetMinus;
  jetPlus = [];
  this.jetPlus = jetPlus;

  quantityParticlesJetMinus = 0;
  quantityParticlesJetPlus = 0;

  globalRadius = this.width / 2.5;
  this.globalRadius = globalRadius;
  globalConst = globalRadius / 600;
  this.globalConst = globalConst;

  particleMoveX = P_MOVE_X / globalConst;
  particleMoveAngle = P_MOVE_ANGLE / globalConst;

  particleGenerateOffset = P_GEN_OFFSET / globalConst;
  // particlesAddStep = P_ADD_STEP / globalConst;
  particleZ_Dispersion = P_Z_DISPERSION * globalConst;
  particleMinX = P_MIN_X * globalConst;

  jetParticleMoveX = JETS_MOVE_X * globalConst;
  jetParticleMoveZ = JETS_MOVE_Z * globalConst;
  jetParticleMoveAngle = JETS_MOVE_A * globalConst;
  jetsMaxZ = JETS_MAX_Z * globalConst;
  this.jetsMaxZ = jetsMaxZ;
  jetsStartX = JETS_START_X * globalConst;
  jetsStartZ = JETS_START_Z * globalConst;

  let radius = globalRadius;
  offset = 0;

  const particleGenerateStep = P_GENERATE_STEP * globalConst;

  while (radius > particleMinX) {
    generateParticles(radius, false, 0);
    radius -= particleGenerateStep;
  }

  this.quantityParticles = quantityParticles;

  const { gl } = this;

  gl.bindVertexArray(this.particlesVAO);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles), gl.STATIC_DRAW);

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
  let flag = 0;
  let deletedStart = -1; // Index of the first particle to be deleted

  for (let i = 0; i < quantityParticles; i++) {
    if (particles[7 * i] < particleMinX) {
      if (!flag) {
        deletedStart = 7 * i;
        flag = 1;
      }
    } else {
      // move particles which are not in the black hole
      particles[7 * i] -= particleMoveX;
      particles[7 * i + 3] += particleMoveAngle;
    }
  }

  if (deletedStart != -1) {
    generateParticles(globalRadius, true, deletedStart);
  }

  for (let i = 0; i < quantityParticlesJetMinus; i++) {
    jetMinus[i].x += jetParticleMoveX;
    jetMinus[i].z -= jetParticleMoveZ;
    jetMinus[i].angle += jetParticleMoveAngle;

    // remove jet particle if it is out of the screen
    if (jetMinus[i].z < -jetsMaxZ) {
      jetMinus.splice(i--, 1);
      quantityParticlesJetMinus--;
    }
  }

  for (let i = 0; i < quantityParticlesJetPlus; i++) {
    jetPlus[i].x += jetParticleMoveX;
    jetPlus[i].z += jetParticleMoveZ;
    jetPlus[i].angle -= jetParticleMoveAngle;

    // remove jet particle if it is out of the screen
    if (jetPlus[i].z > jetsMaxZ) {
      jetPlus.splice(i--, 1);
      quantityParticlesJetPlus--;
    }
  }

  if (jetsTime > 0) {
    this.jetLight = 1;
    generateJetParticles();
    jetsTime--;
  } else {
    this.jetLight -= 0.025;

    if (this.jetLight < 0) {
      quantityParticlesJetPlus = 0;
      quantityParticlesJetMinus = 0;

      jetPlus = [];
      jetMinus = [];
    }
  }

  this.quantityParticlesJetMinus = quantityParticlesJetMinus;
  this.quantityParticlesJetPlus = quantityParticlesJetPlus;
}

function generateParticles(v: number, firstGeneration: boolean, startPosition: number) {
  let angle = PI_MUL_TWO;
  let size;
  const deltaColor = [0, 0, 0];
  let start = startPosition;

  const alphaOffset = particleGenerateOffset * (globalRadius - v);

  for (let k = 0; k < QUANTITY_ARM; k++) {
    for (let i = 0; i < QUANTITY_EL_GENERATE; i++) {
      const deltaAngle = random(-PI_DIV_TWO, PI_DIV_TWO);
      const z = random(-particleZ_Dispersion, particleZ_Dispersion);
      const dispersion = (Math.abs(deltaAngle) / PI) * 3 + Math.abs(z) / particleZ_Dispersion;

      size = MAX_SIZE - MIN_SIZE_MUL * dispersion;

      deltaColor[0] = dispersion;

      const color = vecMulValue(vecSumVec(COLORS[k], deltaColor), 2.0 - dispersion);

      if (!firstGeneration) {
        particles[offset++] = v;
        particles[offset++] = z;
        particles[offset++] = size;
        particles[offset++] = angle + alphaOffset + deltaAngle;

        particles[offset++] = color[0];
        particles[offset++] = color[1];
        particles[offset++] = color[2];

        quantityParticles++;
      } else {
        particles[start++] = v;
        particles[start++] = z;
        particles[start++] = size;
        particles[start++] = angle + alphaOffset + deltaAngle;

        particles[start++] = color[0];
        particles[start++] = color[1];
        particles[start++] = color[2];
      }
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

  for (let i = 0; i < 30; i++) {
    x = random(jetsStartX - 10, jetsStartX + 10);
    angle = random(0, PI_MUL_TWO);
    size = random(1, 3);
    z = -jetsStartZ + random(0, 3);

    jetMinus[quantityParticlesJetMinus++] = {
      x: x,
      z: z,
      size: size,
      angle: angle,
      color: [0, 1.4 - angle / PI_MUL_TWO, 1],
    };

    x = random(jetsStartX - 10, jetsStartX + 10);
    angle = random(0, PI_MUL_TWO);
    size = random(1, 3);
    z = jetsStartZ + random(0, 3);

    jetPlus[quantityParticlesJetPlus++] = {
      x: x,
      z: z,
      size: size,
      angle: angle,
      color: [0, 1.4 - angle / PI_MUL_TWO, 1],
    };
  }
}
