import IShaderSrc from './IShaderSrc';

export default class WebGLShaderProgram {
  readonly program: WebGLProgram;
  readonly uniforms: { [key: string]: WebGLUniformLocation };

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, vertex: string, fragment: string, uniforms = [] as string[]) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragment);

    this.uniforms = {};

    if (vertexShader && fragmentShader) {
      this.program = this.createProgram(gl, vertexShader, fragmentShader);

      if (this.program && uniforms) {
        for (let i = 0; i < uniforms.length; i++) {
          const uniform = gl.getUniformLocation(this.program, uniforms[i]);

          if (uniform) {
            this.uniforms[uniforms[i]] = uniform;
          } else {
            console.error(`Uniform not found: ${uniforms[i]}`);
          }
        }
      }
    } else {
      this.program = -1;
    }
  }

  private createShader(gl: WebGLRenderingContext | WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);

    if (!shader) {
      return 0;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);

    return 0;
  }

  private createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram();

    if (!program) {
      return 0;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);

    return 0;
  }

  static initShaders(gl: WebGLRenderingContext | WebGL2RenderingContext, shadersSrc: IShaderSrc[]) {
    const shaders: { [key: string]: WebGLShaderProgram } = {};

    for (let i = 0; i < shadersSrc.length; i++) {
      const src = shadersSrc[i];
      shaders[src.name] = new WebGLShaderProgram(gl, src.vert, src.frag, src.uniforms);
    }

    return shaders;
  }
}
