var gl;
var position_buffer;
var color_buffer;

var particle_shader;
var flash_shader;

var particle_u_screen;
var particle_u_light;
var particle_u_projection;
var particle_u_rotation_x;
var particle_u_rotation_y;
var particle_u_rotation_z;
var particle_u_flash;
var particle_u_radius;

var particle_a_pos;
var particle_a_color;

var flash_u_color;
var flash_u_projection;
var flash_u_rotate;

var projection;
var rotate_x;
var rotate_y;
var rotate_z;
var scale;

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
  gl.getExtension('OES_standard_derivatives');
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let vertexShaderSource;
  let fragmentShaderSource;

  let vertexShader;
  let fragmentShader;

  vertexShaderSource = document.getElementById("particle-vertex-shader").text;
  fragmentShaderSource = document.getElementById("particle-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  particle_shader = createProgram(gl, vertexShader, fragmentShader);

  vertexShaderSource = document.getElementById("flash-vertex-shader").text;
  fragmentShaderSource = document.getElementById("flash-fragment-shader").text;

  vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  flash_shader = createProgram(gl, vertexShader, fragmentShader);

  position_buffer = gl.createBuffer();
  color_buffer = gl.createBuffer();

  gl.enable(gl.DEPTH_TEST);

  particle_u_light      = gl.getUniformLocation(particle_shader, "u_light");
  particle_u_projection = gl.getUniformLocation(particle_shader, "u_projection");
  particle_u_rotation_x = gl.getUniformLocation(particle_shader, "u_rotation_x");
  particle_u_rotation_y = gl.getUniformLocation(particle_shader, "u_rotation_y");
  particle_u_rotation_z = gl.getUniformLocation(particle_shader, "u_rotation_z");
  particle_u_flash      = gl.getUniformLocation(particle_shader, "u_flash");
  particle_u_radius     = gl.getUniformLocation(particle_shader, "u_radius");

  particle_a_pos   = gl.getAttribLocation(particle_shader, "a_position");
  particle_a_color = gl.getAttribLocation(particle_shader, "a_color");

  flash_u_color      = gl.getUniformLocation(flash_shader, "u_color");
  flash_u_projection = gl.getUniformLocation(flash_shader, "u_projection");
  flash_u_rotate     = gl.getUniformLocation(flash_shader, "u_rotate");
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
