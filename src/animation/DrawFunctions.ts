import WebGLShaderProgram from 'src/webgl/WebGLShader';

import { QuasarAnimation } from './Animation';
import Shaders from './shaders/Shaders';

let shaders: Record<keyof typeof Shaders, WebGLShaderProgram>;
let positionBuffer: WebGLBuffer;
let colorBuffer: WebGLBuffer;

let blackHolePositionBuffer: WebGLBuffer;

export function initWebGL(gl: WebGL2RenderingContext) {
  shaders = WebGLShaderProgram.initShaders(gl, Shaders);

  let status = 0;

  Object.entries(shaders).forEach(([key, shader]) => {
    if (shader.program === 0 || shader.program === -1) {
      console.log(`Program '${key}' not created`);
      status = -1;
    }
  });

  if (status === 0) {
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.BLEND);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    blackHolePositionBuffer = gl.createBuffer();
    positionBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();

    if (!blackHolePositionBuffer || !positionBuffer || !colorBuffer) {
      status = -2;
    }
  }

  return status;
}

//Draw image using GPU and data calculated by CPU
export function drawScene(this: QuasarAnimation) {
  const { gl } = this;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (this.quantityParticlesJetMinus || this.quantityParticlesJetPlus) {
    gl.useProgram(shaders.jetParticle.program);

    gl.uniform1f(shaders.jetParticle.uniforms['u_light'], this.jetLight);
    gl.uniformMatrix4fv(shaders.jetParticle.uniforms['u_transform'], false, this.matTransformation);
    gl.uniform1f(shaders.jetParticle.uniforms['u_distance'], this.distance);
    // gl.uniform1f(shaders.jetParticle.uniforms['u_max_h'], this.jetsMaxZ);

    const points: number[] = [];
    const colors: number[] = [];
    let k = 0;
    let l = 0;

    for (let i = 0; i < this.quantityParticlesJetMinus; i++) {
      points[l++] = this.jetMinus[i].x;
      points[l++] = this.jetMinus[i].z;
      points[l++] = this.jetMinus[i].size;
      points[l++] = this.jetMinus[i].angle;

      colors[k++] = this.jetMinus[i].color[0];
      colors[k++] = this.jetMinus[i].color[1];
      colors[k++] = this.jetMinus[i].color[2];
    }

    for (let i = 0; i < this.quantityParticlesJetPlus; i++) {
      points[l++] = this.jetPlus[i].x;
      points[l++] = this.jetPlus[i].z;
      points[l++] = this.jetPlus[i].size;
      points[l++] = this.jetPlus[i].angle;

      colors[k++] = this.jetPlus[i].color[0];
      colors[k++] = this.jetPlus[i].color[1];
      colors[k++] = this.jetPlus[i].color[2];
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    gl.drawArrays(gl.POINTS, 0, this.quantityParticlesJetPlus + this.quantityParticlesJetMinus);
  }

  if (this.quantityParticles != 0) {
    gl.useProgram(shaders.particle.program);

    gl.uniform1f(shaders.particle.uniforms['u_light'], this.light);
    gl.uniformMatrix4fv(shaders.particle.uniforms['u_transform'], false, this.matTransformation);
    gl.uniform1f(shaders.particle.uniforms['u_distance'], this.distance);
    gl.uniform1f(shaders.particle.uniforms['u_radius'], this.quasarRadius);

    gl.bindVertexArray(this.particlesVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.particlesF32.subarray(0, this.quantityParticles * 8));

    gl.drawArrays(gl.POINTS, 0, this.quantityParticles);
    gl.bindVertexArray(null);
  }

  gl.useProgram(shaders.blackHole.program);

  gl.uniform1f(shaders.blackHole.uniforms['u_distance'], this.distance);

  gl.bindBuffer(gl.ARRAY_BUFFER, blackHolePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, this.blackHoleSize]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.drawArrays(gl.POINTS, 0, 1);

  gl.disable(gl.BLEND);
}
