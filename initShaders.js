var gl;
var position_buffer;
var color_buffer;

var particle_shader;
var particle_j_shader;
var jet_shader;

var particle_u_screen;
var particle_u_light;
var particle_u_projection;
var particle_u_rotation_x;
var particle_u_rotation_y;
var particle_u_rotation_z;
var particle_u_distance;
var particle_u_radius;

var particle_j_u_screen;
var particle_j_u_light;
var particle_j_u_projection;
var particle_j_u_rotation_x;
var particle_j_u_rotation_y;
var particle_j_u_rotation_z;
var particle_j_u_distance;
var particle_j_u_max_h;

var particle_a_pos;
var particle_a_color;

var particle_j_a_pos;
var particle_j_a_color;

var projection;
var rotate_x;
var rotate_y;
var rotate_z;
var distance;

var width;
var height;
var depth;

var initShaders = function()
{
  let canvas = document.getElementById('area');

  width = canvas.width = screen.availWidth;
  height = canvas.height = screen.availHeight * 0.9;
  depth = (width + height) / 2;

  gl = canvas.getContext("webgl");

  let vertexShaderSource;
  let fragmentShaderSource;

  let vertexShader;
  let fragmentShader;

  // particle
  vertexShaderSource = document.getElementById("particle-vertex-shader").text;
  fragmentShaderSource = document.getElementById("particle-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  particle_shader = createProgram(gl, vertexShader, fragmentShader);

  // particle jet
  vertexShaderSource = document.getElementById("particle_J-vertex-shader").text;
  fragmentShaderSource = document.getElementById("particle-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  particle_j_shader = createProgram(gl, vertexShader, fragmentShader);

  position_buffer = gl.createBuffer();
  color_buffer = gl.createBuffer();

  gl.enable(gl.DEPTH_TEST);

  particle_u_light      = gl.getUniformLocation(particle_shader, "u_light");
  particle_u_projection = gl.getUniformLocation(particle_shader, "u_projection");
  particle_u_rotation_x = gl.getUniformLocation(particle_shader, "u_rotation_x");
  particle_u_rotation_y = gl.getUniformLocation(particle_shader, "u_rotation_y");
  particle_u_rotation_z = gl.getUniformLocation(particle_shader, "u_rotation_z");
  particle_u_distance   = gl.getUniformLocation(particle_shader, "u_distance");
  particle_u_radius     = gl.getUniformLocation(particle_shader, "u_radius");

  particle_a_pos   = gl.getAttribLocation(particle_shader, "a_position");
  particle_a_color = gl.getAttribLocation(particle_shader, "a_color");

  particle_j_u_light      = gl.getUniformLocation(particle_j_shader, "u_light");
  particle_j_u_projection = gl.getUniformLocation(particle_j_shader, "u_projection");
  particle_j_u_rotation_x = gl.getUniformLocation(particle_j_shader, "u_rotation_x");
  particle_j_u_rotation_y = gl.getUniformLocation(particle_j_shader, "u_rotation_y");
  particle_j_u_rotation_z = gl.getUniformLocation(particle_j_shader, "u_rotation_z");
  particle_j_u_distance   = gl.getUniformLocation(particle_j_shader, "u_distance");
  particle_j_u_max_h      = gl.getUniformLocation(particle_j_shader, "u_max_h");

  particle_j_a_pos   = gl.getAttribLocation(particle_shader, "a_position");
  particle_j_a_color = gl.getAttribLocation(particle_shader, "a_color");
}


var createShader = function(gl, type, source)
{
  let shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

var createProgram = function(gl, vertexShader, fragmentShader)
{
  let program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS))
  {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
