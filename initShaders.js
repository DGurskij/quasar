var gl;
var position_buffer;
var color_buffer;

// shaders
var particle_shader;
var particle_j_shader;
var jet_shader;
var black_hole_shader;

// particle uniforms
var particle_u_screen;
var particle_u_light;
var particle_u_transform;
var particle_u_distance;
var particle_u_radius;

// jet particles uniforms
var particle_j_u_screen;
var particle_j_u_light;
var particle_j_u_transform;
var particle_j_u_distance;
var particle_j_u_max_h;

// black hole uniforms
var black_hole_u_distance;

// jet particles attributes
var particle_j_a_pos;
var particle_j_a_color;

var black_hole_a_pos;

var transformation;
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

  width = canvas.width = document.body.clientWidth;
  height = canvas.height = document.body.clientHeight;
  depth = width + height;

  gl = canvas.getContext("webgl2", { alpha: false });

  if(!gl)
  {
    document.getElementById('error').style.display = "block";
    return 0;
  }

  let vertexShaderSource;
  let fragmentShaderSource;

  let vertexShader;
  let fragmentShader;

  // prepare particle programm
  vertexShaderSource = document.getElementById("particle-vertex-shader").text;
  fragmentShaderSource = document.getElementById("particle-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  particle_shader = createProgram(gl, vertexShader, fragmentShader);

  particle_u_light     = gl.getUniformLocation(particle_shader, "u_light");
  particle_u_transform = gl.getUniformLocation(particle_shader, "u_transform");
  particle_u_distance  = gl.getUniformLocation(particle_shader, "u_distance");
  particle_u_radius    = gl.getUniformLocation(particle_shader, "u_radius");

  particle_a_pos   = gl.getAttribLocation(particle_shader, "a_position");
  particle_a_color = gl.getAttribLocation(particle_shader, "a_color");

  // prepare particle jet programm
  vertexShaderSource = document.getElementById("particle_J-vertex-shader").text;
  fragmentShaderSource = document.getElementById("particle-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  particle_j_shader = createProgram(gl, vertexShader, fragmentShader);

  particle_j_u_light     = gl.getUniformLocation(particle_j_shader, "u_light");
  particle_j_u_transform = gl.getUniformLocation(particle_j_shader, "u_transform");
  particle_j_u_distance  = gl.getUniformLocation(particle_j_shader, "u_distance");
  particle_j_u_max_h     = gl.getUniformLocation(particle_j_shader, "u_max_h");

  particle_j_a_pos   = gl.getAttribLocation(particle_shader, "a_position");
  particle_j_a_color = gl.getAttribLocation(particle_shader, "a_color");

  // prepare black hole programm
  vertexShaderSource = document.getElementById("black_hole-vertex-shader").text;
  fragmentShaderSource = document.getElementById("black_hole-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  black_hole_shader = createProgram(gl, vertexShader, fragmentShader);

  black_hole_u_distance = gl.getUniformLocation(black_hole_shader, "u_distance");

  black_hole_a_pos = gl.getAttribLocation(black_hole_shader, "a_position");

  position_buffer = gl.createBuffer();
  color_buffer = gl.createBuffer();

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 1);
  gl.viewport(0, 0, width, height);

  return 1;
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
