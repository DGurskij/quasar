import IShaderSrc from 'src/webgl/IShaderSrc';

const vertex = `
#version 300 es
layout (location = 0) in vec3 a_position;

uniform float u_distance;

void main()
{
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
  gl_PointSize = a_position.z / u_distance;
}`;

const fragment = `
#version 300 es
precision mediump float;

out vec4 out_FragColor;

void main()
{
  vec3 color = vec3(1.0, 0.8, 0.2);
  float len = length(gl_PointCoord - 0.5);

  out_FragColor = vec4(vec3(0.0), 1.0);

  if(len > 0.5)
  {
    discard;
  }
  if(len > 0.45)
  {
    out_FragColor.xyz = color * (1.45 - pow(len, 2.0));
  }
}`;

export default {
  vert: vertex,
  frag: fragment,
  uniforms: ['u_distance'],
} as IShaderSrc;
