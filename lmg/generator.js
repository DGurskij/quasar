//Basic client function for play
var particles;
var quantity_particles;

var jet_minus;
var quantity_p_jet_minus;
var jet_plus;
var quantity_p_jet_plus;
var jets_time;

var state = 0;

var add_particle;

var light;
var light_up;

var engine = 0;

var r;
var c;

var p_move_x;
var p_move_angle;
var p_add_step;
var p_z_dispersion;
var p_min_x;

//var p_add_step_j;

var black_hole_size;

var p_gen_offset;
var p_generate_step;

var jets_p_move_x;
var jets_move_z;
var jets_move_a;
var jets_max_z;
var jets_start_x;
var jets_start_z;

var progress;
var progress_element;

var step_quantity;

var quantity_arms;
var arm_angle_step;
var arm_angle_disp;

var points;
var length;
var offset;

var vao_particles;
var vbo_particles;

var color = [];

//Get Window params and Deploy Field
var launch = function()
{
	if(!initShaders())
	{
		return 0;
	}

	vao_particles = gl.createVertexArray();
	vbo_particles = gl.createBuffer();

  progress_element = document.getElementById('progress');

	projection = getProjectionMatrix(width, height, depth);

	let rotate_controllers = document.getElementsByName('control_rotate');
	let color_controllers  = document.getElementsByName('color');
	let pre_processing = document.getElementsByName('pre-proc');

	quantity_arms = pre_processing[1].value;
	step_quantity = pre_processing[0].value;

	step_quantity /= quantity_arms;
	arm_angle_step = PI_MUL_TWO / quantity_arms;
	arm_angle_disp = PI / quantity_arms;

	rotate_x = getRotationX(rotate_controllers[0].value * DEGR_TO_RAD);
	rotate_y = getRotationY(rotate_controllers[1].value * DEGR_TO_RAD);
	rotate_z = getRotationZ(rotate_controllers[2].value * DEGR_TO_RAD);

	setTransformation();

	color[0] = color_controllers[0].value;
	color[1] = color_controllers[1].value;
	color[2] = color_controllers[2].value;

	distance = 1;

	state = 1;

	particles = [];
	flashes = [];
	quantity_particles = 0;
	quantity_flashes = flashes.length;
	jets_time = 0;
	jet_minus = [];
	jet_plus = [];
	quantity_p_jet_minus = 0;
	quantity_p_jet_plus = 0;

	add_particle = 0;

	light = 1.0;
	light_up = 0.0;

	r = gl.drawingBufferHeight / 1.25;
	c = r / 600;

	p_move_x     = P_MOVE_X / c;
	p_move_angle = P_MOVE_ANGLE / c;

	p_gen_offset    = P_GEN_OFFSET / c;
	p_generate_step = P_GENERATE_STEP * c;
	p_add_step      = P_ADD_STEP / c;
	p_z_dispersion  = P_Z_DISPERSION * c;
	p_min_x         = P_MIN_X * c;

	jets_p_move_x = JETS_MOVE_X * c;
	jets_move_z   = JETS_MOVE_Z * c;
	jets_move_a   = JETS_MOVE_A * c;
	jets_max_z    = JETS_MAX_Z * c;
	jets_start_x  = JETS_START_X * c;
	jets_start_z  = JETS_START_Z * c;

	black_hole_size = BLACK_HOLE_SIZE * c;
}

var generateModel = function()
{
  progress = 0;
  progress_element.style.display = "block";

  let radius = r;
	let stage = 10;

	particles = [];
	quantity_particles = 0;

	points = [];
	colors = [];
	length = 0;
	offset = 0;

	lockPanel(true);

	let gen = setInterval(function()
	{
		if(radius < p_min_x)
		{
			clearInterval(gen);

			progress_element.value = 100;
			lockPanel(false);

			gl.bindVertexArray(vao_particles);

			gl.bindBuffer(gl.ARRAY_BUFFER, vbo_particles);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
			gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0);
			gl.enableVertexAttribArray(0);

			gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 20, 16);
			gl.enableVertexAttribArray(1);

			gl.bindVertexArray(null);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			drawScene();
			progress_element.style.display = "none";
		}
		else
		{
			generateParticles(radius);
			radius -= p_generate_step;

			progress = (1 - radius / r) * 100;
			progress_element.value = progress;
		}
	}, 0);
}

// lock controll panel when model processing

var lockPanel = function(lock)
{
	let nodes = document.getElementById("panel").getElementsByTagName('*');

	for(let i = 0; i < nodes.length; i++)
	{
		if(lock)
		{
    	nodes[i].disabled = true;
		}
		else
		{
			nodes[i].disabled = false;
		}
	 }
}

//Draw image using GPU and data calculated by CPU

var drawScene = function()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(quantity_p_jet_minus || quantity_p_jet_plus)
	{
		gl.useProgram(particle_j_shader);

		gl.uniform1f(particle_j_u_light, light);
		gl.uniformMatrix4fv(particle_j_u_projection, false, projection);
		gl.uniformMatrix4fv(particle_j_u_rotation_x, false, rotate_x);
		gl.uniformMatrix4fv(particle_j_u_rotation_y, false, rotate_y);
		gl.uniformMatrix4fv(particle_j_u_rotation_z, false, rotate_z);
		gl.uniform1f(particle_j_u_distance, distance);
		gl.uniform1f(particle_j_u_max_h, jets_max_z);

		let points = [];
		let colors = [];
		let k = 0;
		let l = 0;

		for (let i = 0; i < quantity_p_jet_minus; i++)
		{
			points[l++] = jet_minus[i].x;
			points[l++] = jet_minus[i].z;
			points[l++] = jet_minus[i].size;
			points[l++] = jet_minus[i].angle;

			colors[k++] = jet_minus[i].color[0];
			colors[k++] = jet_minus[i].color[1];
			colors[k++] = jet_minus[i].color[2];
		}

		for (let i = 0; i < quantity_p_jet_plus; i++)
		{
			points[l++] = jet_plus[i].x;
			points[l++] = jet_plus[i].z;
			points[l++] = jet_plus[i].size;
			points[l++] = jet_plus[i].angle;

			colors[k++] = jet_plus[i].color[0];
			colors[k++] = jet_plus[i].color[1];
			colors[k++] = jet_plus[i].color[2];
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);

		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(1);

		gl.drawArrays(gl.POINTS, 0, quantity_p_jet_plus + quantity_p_jet_minus);
	}

	// draw particles
	gl.useProgram(particle_shader);

	gl.uniform1f(particle_u_light, light);
	gl.uniformMatrix4fv(particle_u_transform, false, transformation);
	gl.uniform1f(particle_u_distance, distance);
	gl.uniform1f(particle_u_radius, r);
	gl.uniform3fv(particle_u_color, color);

	gl.bindVertexArray(vao_particles);
	gl.drawArrays(gl.POINTS, 0, length);
	gl.bindVertexArray(null);

	// draw black_hole
	gl.useProgram(black_hole_shader);

	gl.uniform1f(black_hole_u_distance, distance);
	gl.uniform3fv(black_hole_u_color, color);

	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, black_hole_size]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(0);

	gl.drawArrays(gl.POINTS, 0, 1);
}

// generate functions for elements

var generateParticles = function(v)
{
	let angle = PI_MUL_TWO;
	let size;
	let d_color = [0, 0, 0];
	let alpha_offset = p_gen_offset * (r - v);
	let dg = 0;


	for(let k = 0; k < quantity_arms; k++)
	{
		for(let i = 0; i < step_quantity; i++)
		{
			let d_angle = random(-arm_angle_disp, arm_angle_disp);
			let z = random(-p_z_dispersion, p_z_dispersion);//Math.pow(-1, k) * random(-p_z_dispersion * 0.3, p_z_dispersion);
			//let disp = Math.abs(d_angle) / PI_DIV_TWO + Math.abs(Math.abs(z) - p_z_dispersion * 0.35) / p_z_dispersion / 0.35;
			let disp = Math.abs(d_angle) / PI * quantity_arms + Math.abs(z) / p_z_dispersion;

			size = MAX_SIZE - 5 * disp;

			//let color = vecMulValue(COLORS[k], 2.0 - disp);

			points[offset++] = v;
			points[offset++] = z;
			points[offset++] = size;
			points[offset++] = angle + alpha_offset + d_angle;

			points[offset++] = 2.0 - disp;

			length++;
		}

		angle -= arm_angle_step;
	}
}
