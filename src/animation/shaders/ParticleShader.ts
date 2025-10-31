import IShaderSrc from 'src/webgl/IShaderSrc';

const vertex = `#version 300 es
layout (location = 0) in vec4 a_position;
layout (location = 1) in vec3 a_color;

//global transform params
uniform mat4 u_transform;
uniform float u_distance;
uniform float u_radius;

out vec4 v_color;

const vec3 center_color = vec3(0.8, 0.9, 1.0);

void main()
{
  float x = a_position.x * cos(a_position.w);
  float y = a_position.x * sin(a_position.w);

  float factor;
  if (a_position.x < 201.0) {
    factor = pow(1.0 - (a_position.x / u_radius), 10.0);
    // factor = a_position.x / u_radius;
    factor = 1.0;
    } else {
    factor = 1.0;
    // factor = 1.0 -a_position.x / u_radius;
  }

  // gl_Position = u_transform * vec4(x, y, a_position.y * a_position.x / u_radius, u_distance);
  gl_Position = u_transform * vec4(x, y, a_position.y * factor  , u_distance);
  // gl_PointSize = a_position.z * (1.5 - a_position.x / u_radius) / u_distance;
  gl_PointSize = a_position.z / u_distance;

  float t = a_position.x / u_radius;
  vec3 finalColor = mix(center_color, a_color, t);

  v_color = vec4(finalColor, 1.0);
  // v_color = vec4(a_color, 1.0) * pow(1.0 - a_position.x / u_radius, 1.4);
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
  uniforms: ['u_transform', 'u_distance', 'u_radius', 'u_light'],
} as IShaderSrc;
