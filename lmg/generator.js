//Basic client function for play
var particles;
var quantity_particles;

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

var busy = false;

//Get Window params and Deploy Field
var launch = function()
{
	if(!initShaders())
	{
		return 0;
	}

	vao_particles = gl.createVertexArray();
	vbo_particles = gl.createBuffer();

	projection = getProjectionMatrix(width, height, depth);

	let rotate_controllers = document.getElementsByName('control_rotate');
	let color_controllers  = document.getElementsByName('color');
	let pre_processing     = document.getElementsByName('pre-proc');

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

	distance = 1.8;

	state = 1;

	particles = [];
	quantity_particles = 0;

	add_particle = 0;

	calcGeneratorSettings();
}

var calcGeneratorSettings = function()
{
	let canvas = document.getElementById('area');

	width = canvas.width = document.body.clientWidth;
	height = canvas.height = document.body.clientHeight;
	depth = width + height;

	projection = getProjectionMatrix(width, height, depth);

	setTransformation();

	gl.viewport(0, 0, width, height);

	r = width / 2.5;
	c = r / 1920;

	p_move_x     = P_MOVE_X / c;
	p_move_angle = P_MOVE_ANGLE / c;

	p_gen_offset    = P_GEN_OFFSET / c;
	p_generate_step = P_GENERATE_STEP * c;
	p_add_step      = P_ADD_STEP / c;
	p_z_dispersion  = P_Z_DISPERSION * c;
	p_min_x         = P_MIN_X * c;

	black_hole_size = BLACK_HOLE_SIZE * c;
}

var generateModel = function()
{
	let t1 = performance.now();
	let t2;

	calcGeneratorSettings();

	particles = [];
	quantity_particles = 0;

	points = [];
	colors = [];
	length = 0;
	offset = 0;

	for(let i = 0; i < quantity_arms; i++)
	{
		generateParticles(i);
	}

	document.getElementById('q_elements').textContent = "Quantity elements: " + length;
	document.getElementById('q_values').textContent   = "Quantity values: " + points.length;

	gl.bindVertexArray(vao_particles);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_particles);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0);
	gl.enableVertexAttribArray(0);

	gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 20, 16);
	gl.enableVertexAttribArray(1);

	gl.bindVertexArray(null);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	t2 = ((performance.now() - t1) + "").substr(0, 5);

	document.getElementById('gen_time').textContent = "Generate time: " + t2 + "ms";

	drawScene();
}

//Draw image using GPU and data calculated by CPU

var drawScene = function()
{
	if(busy)
	{
		return;
	}

	busy = true;
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	let t1 = performance.now();
	let t2;

	// draw particles
	gl.useProgram(particle_shader);

	gl.uniformMatrix4fv(particle_u_transform, false, transformation);
	gl.uniform1f(particle_u_distance, distance);
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

	t2 = ((performance.now() - t1) + "").substr(0, 5);

	document.getElementById("draw_time").textContent = "Draw time: " + t2 + "ms";

	busy = false;
}

// generate functions for elements

var generateParticles = function(k)
{
	let polar_r = r;
	let angle = PI_MUL_TWO - arm_angle_step * k;
	let size;
	let d_color = [0, 0, 0];
	let alpha_offset = 0;//p_gen_offset * (r - polar_r);
	let dg = 0;

	let arm_height = 0.5 * p_z_dispersion;
	let h_step = Math.floor(random(50, 100));
	let h_dir  = random(-arm_height * 0.002, arm_height * 0.002);

	let arm_width  = 0.5 * arm_angle_disp;
	let w_step = Math.floor(random(50, 100));
	let w_dir  = random(-arm_angle_disp * 0.002, arm_angle_disp * 0.002);

	let quantity_step = 0;

	while(polar_r > p_min_x)
	{
		/*let limit = 1 - polar_r / r;

		// randomize arms width
		if(arm_width < arm_angle_disp * 0.3)
		{
			w_step = Math.floor(random(50, 100));
			w_dir = random(arm_angle_disp * 0.001, arm_angle_disp * 0.002);
		}
		else if (arm_width > arm_angle_disp * 0.8)
		{
			w_step = Math.floor(random(50, 100));
			w_dir = random(-arm_angle_disp * 0.001, -arm_angle_disp * 0.002);
		}
		else
		{
			arm_width += w_dir;
		}

		if(w_step-- < 0)
		{
			w_step = Math.floor(random(50, 100));

			if(arm_width < arm_angle_disp * 0.2)
			{
				w_dir = random(arm_angle_disp * 0.001, arm_angle_disp * 0.002);
			}
			else if (arm_width > arm_angle_disp * 0.8)
			{
				w_dir =random(-arm_angle_disp * 0.001, -arm_angle_disp * 0.002);
			}
			else
			{
				w_dir = random(-arm_angle_disp * 0.001, arm_angle_disp * 0.001);
			}
		}

		// randomize arms height
		if(arm_height < p_z_dispersion * 0.5)
		{
			h_step = Math.floor(random(50, 100));
			h_dir = random(p_z_dispersion * 0.001, p_z_dispersion * 0.002);
		}
		else if (arm_height > p_z_dispersion)
		{
			h_step = Math.floor(random(50, 100));
			h_dir = random(-p_z_dispersion * 0.001, -p_z_dispersion * 0.002);
		}
		else
		{
			arm_height += h_dir;
		}

		if(h_step-- < 0)
		{
			h_step = Math.floor(random(50, 100));

			if(arm_height < p_z_dispersion * 0.5)
			{
				h_dir = random(p_z_dispersion * 0.001, p_z_dispersion * 0.002);
			}
			else if (arm_height > p_z_dispersion)
			{
				h_dir = random(-p_z_dispersion * 0.001, -p_z_dispersion * 0.002);
			}
			else
			{
				h_dir = random(-p_z_dispersion * 0.001, p_z_dispersion * 0.001);
			}
		}

		let flag = 0;

		if(polar_r < 0.2 * r)
		{
			flag = 1;
		}*/

		let d_angle = -arm_angle_disp * 1.5;
		let z;
		let offset_angle = random(arm_angle_disp / step_quantity * 10, arm_angle_disp / step_quantity * 50);

		while(d_angle < arm_angle_disp * 1.5)
		{
			let abs_angle = Math.abs(d_angle);
			let abs_z = Math.abs(z);
			let disp = abs_angle / arm_angle_disp + abs_z / p_z_dispersion;

			/*if(abs_angle < arm_width)
			{
				if(abs_z < arm_height)
				{
					disp -= (arm_height - abs_z) / arm_height;
					disp -= (arm_width - abs_angle) / (arm_width);
				}
			}*/

			size = MAX_SIZE - MIN_SIZE_MUL * disp;

			z = random(0, p_z_dispersion * Math.pow(1 - Math.abs(d_angle) / arm_angle_disp, 0.5));

			points[offset++] = polar_r;
			points[offset++] = z * Math.pow(polar_r / r, 0.5);
			points[offset++] = size;
			points[offset++] = angle + alpha_offset + d_angle;

			points[offset++] = (2.0 - disp) * Math.pow(1 - polar_r / r, 0.8);

			length++;

			z = random(0, -p_z_dispersion * Math.pow(1 - Math.abs(d_angle) / arm_angle_disp, 0.5));

			points[offset++] = polar_r;
			points[offset++] = z * Math.pow(polar_r / r, 0.5);
			points[offset++] = size;
			points[offset++] = angle + alpha_offset + d_angle;

			points[offset++] = (2.0 - disp) * Math.pow(1 - polar_r / r, 0.8);

			length++;

			d_angle += offset_angle;
		}

		alpha_offset += p_gen_offset * p_generate_step;
		polar_r -= p_generate_step;
	}
}
