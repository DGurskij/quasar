import IShaderSrc from 'src/webgl/IShaderSrc';

const vertex = `#version 300 es
layout (location = 0) in vec4 a_position;
layout (location = 1) in vec3 a_color;

//global transform params
uniform mat4 u_transform;
uniform float u_distance;
// uniform float u_max_h;

out vec4 v_color;

void main()
{
  // calc position in object
  float x = a_position.x * cos(a_position.w);
  float y = a_position.x * sin(a_position.w);

  gl_Position = u_transform * vec4(x, y, a_position.y, u_distance);

  gl_PointSize = a_position.z / u_distance;

  float z = a_position.y;

  if(a_position.y < 0.0)
  {
    z = -a_position.y;
  }

  v_color = vec4(a_color, 1.0); // * (1.0 - pow(z / u_max_h, 3.0));
}`;

const fragment = `#version 300 es
precision mediump float;

uniform float u_light;

in vec4 v_color;
out vec4 out_FragColor;

void main()
{
  if(length(gl_PointCoord - 0.5) > 0.5)
  {
    discard;
  }

  out_FragColor = v_color * u_light;
}`;

export default {
  vert: vertex,
  frag: fragment,
  uniforms: ['u_transform', 'u_distance', 'u_light'],
  // uniforms: ['u_transform', 'u_distance', 'u_max_h', 'u_light'],
} as IShaderSrc;
