//Basic client function for play
var particles;
var quantity_particles;

var flashes;
var quantity_flashes;

var state = 0;

var d_angle;
var dx;
var add_particle;

var light;
var light_up;

var engine = 0;

var r;

//Get Window params and Deploy Field
var launch = function()
{
	projection = getProjectionMatrix(gl.drawingBufferWidth, gl.drawingBufferHeight, 1500);
	rotate_x   = getRotationX();
	rotate_y   = getRotationY();
	rotate_z   = getRotationZ();

	console.log("Engine start");
	state = 1;

	particles = [];
	flashes = [];
	quantity_particles = particles.length;
	quantity_flashes = flashes.length;

	d_angle = 0.00026;
	dx = 0.02;
	add_Particles = 1.0;

	r_generate = 10.0;

	light = 2.0;
	light_up = 0.0;

	r = gl.drawingBufferHeight / 1.2;

	while (r_generate < r + 1)
	{
		fastGenerate(r_generate);
		r_generate += 0.6;
	}

	console.log(quantity_particles);

	engine = setInterval(animationEngine, 15);
}

//Do stars's lifecycle, gravity.
function animationEngine()
{
	if(add_particle < 1)
	{
		add_particle += 0.055;
	}
	else
	{
		let angle = PI_MUL_TWO;
		let dalpha = Math.PI;
		let size = 2.0;
		let d_color = [0, 0, 0];

		for (let k = 0; k < 2; k++)
		{
			for(let i = 0; i < 5; i++)
			{
				let z = random(-1, 1);
				let d_angle = random(-PI_DIV_TWO, PI_DIV_TWO);
				let d_size = 5 - 6 * Math.abs(d_angle) / PI_DIV_TWO;
				let buff = 1.3 * Math.abs(d_angle) / PI_DIV_TWO;

				d_color[0] = buff;
				d_color[1] = buff;
				d_color[2] = buff;

				particles[quantity_particles++] = new Particle(r, z, size + d_size, angle + d_angle, vecSum(COLORS[k], d_color));
			}

			angle -= dalpha;
		}

		add_particle = 0.0;
	}

	for (let i = 0; i < quantity_particles; i++)
	{
		if(particles[i].x < 2.0)
		{
			particles.splice(i--, 1);
			quantity_particles--;
		}
		else
		{
			particles[i].changePosition(d_angle, dx);
		}
	}

	for (let i = 0; i < quantity_flashes; i++)
	{
		if(!flashes[i].changePosition(0.0, dx))
		{
			flashes.splice(i--, 1);
			quantity_flashes--;
			light_up = -0.04;
		}
	}

	if(light_up != 0.0)
	{
		light += light_up;
		if(light < 2.0)
		{
			light_up = 0.0;
			light = 2.0;
		}

		if(light > 10.0)
		{
			light_up = 0.0;
			light = 10.0;
		}
	}

	for (let i = 0; i < 4; i++)
	{
		if(flash_info[i] == 0)
		{
			continue;
		}
		if(Math.abs(flash_matrix[i * 4 + 2] - flash_info[i][0]) > Math.abs(flash_info[i][2]))
		{
			flash_matrix[i * 4 + 2] += flash_info[i][2];
			flash_matrix[i * 4 + 3] += flash_info[i][4];
		}
		else if (flash_info[i][0] != 0.0)
		{
			flash_info[i][0] = 0.0;
			flash_info[i][2] = flash_info[i][3];
			flash_info[i][4] = flash_info[i][5];
		}
		else
		{
			flash_info[i] = 0.0;

			flash_matrix[i * 4 + 0] = 0;
			flash_matrix[i * 4 + 1] = 0;
			flash_matrix[i * 4 + 2] = 0;
			flash_matrix[i * 4 + 3] = 0;
		}
	}

	if(random(0.0, 1.0) > 0.95)
	{
		for (let i = 0; i < 4; i++)
		{
			if(flash_info[i] != 0) continue;
			else
			{
				flash_info[i] = generateFlash();
				flash_matrix[i * 4] = random(30.0, r * 0.9);
				flash_matrix[i * 4 + 1] = random(0.0, Math.PI * 2);
				flash_matrix[i * 4 + 2] = 0.0;
				flash_matrix[i * 4 + 3] = 0.0;
				break;
			}
		}
		if(random(0.0, 1.0) > 0.9)
		{
			//doFlash();
		}
	}

	drawScene();
}


//Draw image using GPU and data calculated by CPU
var drawScene = function(replace)
{
	/*--------Draw particles-------*/

	if(quantity_particles != 0)
	{
		gl.useProgram(particle_shader);

		gl.uniform1f(particle_u_light, light);
		gl.uniformMatrix4fv(particle_u_projection, false, projection);
		gl.uniformMatrix4fv(particle_u_rotation_x, false, rotate_x);
		gl.uniformMatrix4fv(particle_u_rotation_y, false, rotate_y);
		gl.uniformMatrix4fv(particle_u_rotation_z, false, rotate_z);
		gl.uniform1f(particle_u_radius, r);

		if(light == 2.0)
		{
			gl.uniformMatrix4fv(particle_u_flash, false, flash_matrix);
		}
		else
		{
			gl.uniformMatrix4fv(particle_u_flash, false, flash_matrix_null);
		}

		let points = [];
		let colors = [];

		for (let i = 0, k = 0, l = 0; i < quantity_particles; i++)
		{
			points[l++] = particles[i].x;
			points[l++] = particles[i].z;
			points[l++] = particles[i].size;
			points[l++] = particles[i].angle;

			colors[k++] = particles[i].color[0];
			colors[k++] = particles[i].color[1];
			colors[k++] = particles[i].color[2];
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
		gl.vertexAttribPointer(particle_a_pos, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(particle_a_pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		gl.vertexAttribPointer(particle_a_color, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(particle_a_color);

		gl.drawArrays(gl.POINTS, 0, quantity_particles);
	}

	/*--------Draw flashes-------*/

	if(quantity_flashes == 0)
	{
		return;
	}

	gl.useProgram(flash_shader);

	gl.uniform1f(flash_u_color, 10.0);
	gl.uniformMatrix4fv(flash_u_projection, false, projection);
	gl.uniform3fv(flash_u_rotate, rotation);

	let positionAttribute = gl.getAttribLocation(flash_shader, "a_position");
	gl.enableVertexAttribArray(positionAttribute);

	/*-----------Draw flash-----------*/

	points = [];

	for (let i = 0, k = 0, l = 0; i < quantity_flashes; i++)
	{
		points[l++] = flashes[i].x;
		points[l++] = flashes[i].z;
		points[l++] = flashes[i].color;
		points[l++] = flashes[i].angle;

		points[l++] = flashes[i].x;
		points[l++] = flashes[i].z + flashes[i].long;
		points[l++] = flashes[i].color;
		points[l++] = flashes[i].angle;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(positionAttribute, 4, gl.FLOAT, false, 0, 0);

	gl.lineWidth(5.0);
	gl.drawArrays(gl.LINES, 0, 2 * quantity_flashes);
}

var setLight = function()
{
	light += 0.1;
}

var generateFlash = function()
{
	let res = [];
	let time = random(0.3, 2.5);
	let maxLight = random(3.1, 6.0);
	let maxRadius = random(20.0, 100.0);

	res[0] = maxLight;
	res[1] = maxRadius;

	let iterations = time * 60.0;

	res[2] = maxLight / (iterations / 5);
	res[3] = -maxLight / (4 * iterations / 5);

	res[4] = maxRadius / (iterations / 5);
	res[5] = -maxRadius / (4 * iterations / 5);

	return res;
}

var fastGenerate = function(v)
{
	let angle = PI_MUL_TWO;
	let dalpha = Math.PI;
	let size = 2;
	let d_color = [0, 0, 0];

	let alpha_offset = 0.013 * (r - v);

	for(let k = 0; k < 2; k++)
	{
		for(let i = 0; i < 5; i++)
		{
			let z = random(-1, 1);
			let d_angle = random(-PI_DIV_TWO, PI_DIV_TWO);
			let d_size = 5 - 6 * Math.abs(d_angle) / PI_DIV_TWO;
			let buff = 1.3 * Math.abs(d_angle) / PI_DIV_TWO;

			d_color[0] = buff;
			d_color[1] = buff;
			d_color[2] = buff;

			particles[quantity_particles++] = new Particle(v, z, size + d_size, angle + alpha_offset + d_angle, vecSum(COLORS[k], d_color));
		}

		angle -= dalpha;
	}
}

var doFlash = function()
{
	if(light != 2.0)
	{
		return;
	}

	let alpha = 0.0;
	let dAlpha = Math.PI / 15;

	for (let i = 0; i < 30; i++)
	{
		flashes[quantity_flashes++] = new Flash(0.0, -6.0, alpha, random(2.00, 2.05));
		flashes[quantity_flashes++] = new Flash(0.0, 6.0, alpha, random(2.00, 2.05));
		alpha += dAlpha;
	}
	light_up = 0.07;
}
