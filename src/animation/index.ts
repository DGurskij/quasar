import { initWebGL } from './DrawFunctions';

export function init(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { alpha: false });

  if (!gl) {
    alert(`Browser doesn't support WebGL2.`);
    return;
  }

  initWebGL(gl);
}
