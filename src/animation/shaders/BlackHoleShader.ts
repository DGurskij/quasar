import IShaderSrc from 'src/webgl/IShaderSrc';

const vertex = `#version 300 es
layout (location = 0) in vec3 a_position;

uniform float u_distance;

void main()
{
  gl_Position = vec4(a_position.xy, 0.0, 1.0);
  gl_PointSize = a_position.z / u_distance;
}`;

const fragment = `#version 300 es
precision mediump float;

out vec4 out_FragColor;

void main()
{
  float len = length(gl_PointCoord - 0.5);
  float edge = smoothstep(0.49, 0.5, len);
  float alpha = 1.0 - edge;


  vec3 centerColor = vec3(0.0, 0.0, 0.0); // black center
  vec3 edgeColor = vec3(0.8, 0.9, 1.0); // color from particle shader

  float t = len / 0.5; // from center to edge
  vec3 finalColor = mix(centerColor, edgeColor, pow(t, 12.5));
  out_FragColor = vec4(finalColor, alpha);
}`;

export default {
  vert: vertex,
  frag: fragment,
  uniforms: ['u_distance'],
} as IShaderSrc;
