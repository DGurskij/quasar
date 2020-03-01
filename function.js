//Basic client function for play
var particles;
var quantity_particles;
var offset;

var vao_particles;
var vbo_particles;

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

var arm_colors =
[
	[1.0, 1.0, 1.0],
	[1.0, 1.0, 1.0]
];

//Get Window params and Deploy Field
var launch = function()
{
	if(!initShaders())
	{
		return 0;
	}

	projection = getProjectionMatrix(width, height, depth);

	rotate_x = getRotationX(INIT_ANGLE_X);
	rotate_y = getRotationY(INIT_ANGLE_Y);
	rotate_z = getRotationZ(INIT_ANGLE_Z);

	setTransformation();

	let rotate_controllers = document.getElementsByName('control_rotate');

	rotate_controllers[0].value = INIT_ANGLE_X * RAD_TO_DEGR;
	rotate_controllers[1].value = INIT_ANGLE_Y * RAD_TO_DEGR;
	rotate_controllers[2].value = INIT_ANGLE_Z * RAD_TO_DEGR;

	distance = 1;

	console.log("Engine start");
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

	let radius = r;
	offset = 0;

	while (radius > p_min_x)
	{
		generateParticles(radius, false);
		radius -= p_generate_step;
	}

	vao_particles = gl.createVertexArray();
	vbo_particles = gl.createBuffer();

	gl.bindVertexArray(vao_particles);

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_particles);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles), gl.STATIC_DRAW);

	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 28, 0);
	gl.enableVertexAttribArray(0);

	gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 28, 16);
	gl.enableVertexAttribArray(1);

	gl.bindVertexArray(null);

	engine = setInterval(animationEngine, 15);
}

//Do stars's lifecycle, gravity.
function animationEngine()
{
	let flag = 0;
	let deleted_start = -1;

	for (let i = 0; i < quantity_particles; i++)
	{
		if(particles[7 * i] < p_min_x)
		{
			if(!flag)
			{
				deleted_start = 7 * i;
				flag = 1;
			}
		}
		else
		{
			particles[7 * i]     -= p_move_x;
			particles[7 * i + 3] += p_move_angle;
		}
	}

	if(deleted_start != -1)
	{
		//particles.slice(deleted_start, 210);
		//quantity_particles -= 30;
		generateParticles(r, true, deleted_start);
	}

	for(let i = 0; i < quantity_p_jet_minus; i++)
	{
		jet_minus[i].z -= jets_move_z;
		jet_minus[i].x += jets_p_move_x;
		jet_minus[i].angle += jets_move_a;

		if(jet_minus[i].z < -jets_max_z)
		{
			jet_minus.splice(i--, 1);
			quantity_p_jet_minus--;
		}
	}

	for(let i = 0; i < quantity_p_jet_plus; i++)
	{
		jet_plus[i].z += jets_move_z;
		jet_plus[i].x += jets_p_move_x;
		jet_plus[i].angle -= jets_move_a;

		if(jet_plus[i].z > jets_max_z)
		{
			jet_plus.splice(i--, 1);
			quantity_p_jet_plus--;
		}
	}

	if(jets_time > 0)
	{
		generateJetP();
		jets_time--;
	}

	drawScene();
}


//Draw image using GPU and data calculated by CPU
var drawScene = function(replace)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(quantity_p_jet_minus || quantity_p_jet_plus)
	{
		gl.useProgram(particle_j_shader);

		gl.uniform1f(particle_j_u_light, light);
		gl.uniformMatrix4fv(particle_j_u_transform, false, transformation);
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

	if(quantity_particles != 0)
	{
		gl.useProgram(particle_shader);

		gl.uniform1f(particle_u_light, light);
		gl.uniformMatrix4fv(particle_u_transform, false, transformation);
		gl.uniform1f(particle_u_distance, distance);
		gl.uniform1f(particle_u_radius, r);

		gl.bindVertexArray(vao_particles);

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo_particles);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(particles), 0);

		gl.drawArrays(gl.POINTS, 0, quantity_particles);
		gl.bindVertexArray(null);
	}

	gl.useProgram(black_hole_shader);

	gl.uniform1f(black_hole_u_distance, distance);

	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, black_hole_size]), gl.STATIC_DRAW);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(0);

	gl.drawArrays(gl.POINTS, 0, 1);
}

var generateParticles = function(v, is_new, start_pos)
{
	let angle = PI_MUL_TWO;
	let size;
	let d_color = [0, 0, 0];
	let start = start_pos;

	let alpha_offset = p_gen_offset * (r - v);

	for(let k = 0; k < QUANTITY_ARM; k++)
	{
		for(let i = 0; i < QUANTITY_EL_GENERATE; i++)
		{
			let d_angle = random(-PI_DIV_TWO, PI_DIV_TWO);
			let z = random(-p_z_dispersion, p_z_dispersion);
			let disp = Math.abs(d_angle) / PI * 3 + Math.abs(z) / p_z_dispersion;

			size = MAX_SIZE - MIN_SIZE_MUL * disp;

			d_color[0] = disp;

			let color = vecMulValue(vecSumVec(COLORS[k], d_color), 2.0 - disp);

			if(!is_new)
			{
				particles[offset++] = v;
				particles[offset++] = z;
				particles[offset++] = size;
				particles[offset++] = angle + alpha_offset + d_angle;

				particles[offset++] = color[0];
				particles[offset++] = color[1];
				particles[offset++] = color[2];

				quantity_particles++;
			}
			else
			{
				particles[start++] = v;
				particles[start++] = z;
				particles[start++] = size;
				particles[start++] = angle + alpha_offset + d_angle;

				particles[start++] = color[0];
				particles[start++] = color[1];
				particles[start++] = color[2];
			}
		}

		angle -= P_D_ALPHA;
	}
}

var generateJetP = function()
{
	let angle;
	let size;
	let x;
	let z;
	let color;

	for(let i = 0; i < 24; i++)
	{
		x = random(jets_start_x - 10, jets_start_x + 10);
		angle = random(0, PI_MUL_TWO);
		size = random(2, 4);
		z = -jets_start_z + random(0, 3);

		jet_minus[quantity_p_jet_minus++] = new Particle(x, z, size, angle, [1.9 - angle / PI_MUL_TWO, 0.97, 0.8]);

		x = random(jets_start_x - 10, jets_start_x + 10);
		angle = random(0, PI_MUL_TWO);
		size = random(2, 4);
		z = jets_start_z + random(0, 3);

		jet_plus[quantity_p_jet_plus++] = new Particle(x, z, size, angle, [1.9 - angle / PI_MUL_TWO, 0.97, 0.8]);
	}
}
