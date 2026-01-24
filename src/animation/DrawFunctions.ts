import WebGLShaderProgram from 'src/webgl/WebGLShader';

import { QuasarAnimation } from './QuasarAnimation';
import Shaders from './shaders/Shaders';

let shaders: Record<keyof typeof Shaders, WebGLShaderProgram>;

// let blackHoleVAO: WebGLVertexArrayObject;
let blackHoleVBO: WebGLBuffer;

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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    blackHoleVBO = gl.createBuffer();

    if (!blackHoleVBO) {
      status = -2;
    }
  }

  return status;
}

//Draw image using GPU and data calculated by CPU
export function drawScene(this: QuasarAnimation) {
  const { gl } = this;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (this.quantityJetParticles) {
    gl.useProgram(shaders.jetParticle.program);

    gl.uniform1f(shaders.jetParticle.uniforms['u_light'], this.jetLight * this.light);
    gl.uniformMatrix4fv(shaders.jetParticle.uniforms['u_transform'], false, this.matTransformation);
    gl.uniform1f(shaders.jetParticle.uniforms['u_distance'], this.distance);
    // gl.uniform1f(shaders.jetParticle.uniforms['u_max_h'], this.jetsMaxZ);

    gl.bindVertexArray(this.jetParticlesVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.jetParticlesVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.jetParticlesGpuF32.subarray(0, this.quantityJetParticles * 7));

    gl.drawArrays(gl.POINTS, 0, this.quantityJetParticles);
    gl.bindVertexArray(null);
  }

  if (this.quantityParticles != 0) {
    gl.useProgram(shaders.particle.program);

    gl.uniform1f(shaders.particle.uniforms['u_light'], this.light);
    gl.uniformMatrix4fv(shaders.particle.uniforms['u_transform'], false, this.matTransformation);
    gl.uniform1f(shaders.particle.uniforms['u_distance'], this.distance);
    gl.uniform1f(shaders.particle.uniforms['u_radius'], this.quasarGenerativeParameters.quasarRadius);

    gl.bindVertexArray(this.particlesVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.particlesGpuF32.subarray(0, this.quantityParticles * 7));

    gl.drawArrays(gl.POINTS, 0, this.quantityParticles);

    gl.bindVertexArray(null);
  }

  gl.useProgram(shaders.blackHole.program);

  gl.uniform1f(shaders.blackHole.uniforms['u_distance'], this.distance);

  gl.bindBuffer(gl.ARRAY_BUFFER, blackHoleVBO);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, this.quasarGenerativeParameters.blackHoleSize]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.drawArrays(gl.POINTS, 0, 1);

  gl.disable(gl.BLEND);
}

export function disposeWebGL(qa: QuasarAnimation) {
  const { gl } = qa;

  // Unbind current WebGL resources
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
  gl.useProgram(null);

  // Delete VAOs and VBOs
  if (qa.particlesVAO) {
    gl.deleteVertexArray(qa.particlesVAO);
    (qa.particlesVAO as any) = null;
  }
  if (qa.particlesVBO) {
    gl.deleteBuffer(qa.particlesVBO);
    (qa.particlesVBO as any) = null;
  }
  if (qa.jetParticlesVAO) {
    gl.deleteVertexArray(qa.jetParticlesVAO);
    (qa.jetParticlesVAO as any) = null;
  }
  if (qa.jetParticlesVBO) {
    gl.deleteBuffer(qa.jetParticlesVBO);
    (qa.jetParticlesVBO as any) = null;
  }
  if (blackHoleVBO) {
    gl.deleteBuffer(blackHoleVBO);
    (blackHoleVBO as any) = null;
  }

  // Delete shader programs
  if (shaders) {
    Object.values(shaders).forEach(shader => {
      if (shader.program !== 0 && shader.program !== -1) {
        gl.deleteProgram(shader.program);
        (shader.program as any) = null;
      }
    });

    (shaders as any) = null;
  }
}
