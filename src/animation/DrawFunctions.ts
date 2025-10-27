import WebGLShaderProgram from 'src/webgl/WebGLShader';

import Shaders from './shaders/Shaders';

let shaders: { [key: string]: WebGLShaderProgram };
let positionBuffer: WebGLBuffer;
let colorBuffer: WebGLBuffer;

export async function initWebGL(gl: WebGL2RenderingContext) {
  shaders = WebGLShaderProgram.initShaders(gl, Shaders);

  let status = 0;

  for (const s in shaders) {
    if (shaders[s].program === 0 || shaders[s].program === -1) {
      console.log(`Program '${s}' not created`);
      status = -1;
    }
  }

  if (status === 0) {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    positionBuffer = gl.createBuffer() as WebGLBuffer;
    colorBuffer = gl.createBuffer() as WebGLBuffer;

    if (!positionBuffer || !colorBuffer) {
      status = -2;
    }
  }

  return status;
}
