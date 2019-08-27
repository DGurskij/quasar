var random = function(v1, v2)
{
	if (v1 < v2)
	{
		return Math.random() * (v2-v1) + v1;
	}

	return Math.random() * (v1-v2) + v2;
}

var rotate = function(value, index)
{
	rotation[index] = value * Math.PI / 180;

	if(index == 2)
	{
		rotate_z = getRotationZ();
	}
	else if (index)
	{
		rotate_y = getRotationY();
	}
	else
	{
		rotate_x = getRotationX();
	}

}

var getProjectionMatrix = function(width, height, depth)
{
	return [
		2 / width, 0, 0, 0,
		0, 2 / height, 0, 0,
		0, 0, 2 / depth, 0,
		0, 0, 0, 1,
	];
}

var getRotationX = function()
{
	let s = Math.sin(rotation[0]);
	let c = Math.cos(rotation[0]);

	return [
		1, 0, 0, 0,
		0, c, s, 0,
		0, -s, c, 0,
		0, 0, 0, 1
	];
}

var getRotationY = function()
{
	let s = Math.sin(rotation[1]);
	let c = Math.cos(rotation[1]);

	return [
		c, 0, -s, 0,
		0, 1, 0, 0,
		s, 0, c, 0,
		0, 0, 0, 1
	];
}

var getRotationZ = function()
{
	let s = Math.sin(rotation[2]);
	let c = Math.cos(rotation[2]);

	return [
		c, s, 0, 0,
		-s, c, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
}

var vecSum = function(v1, v2)
{
	let l = v1.length;
	let res = [];
	let i = 0;

	while(i < l)
	{
		res[i] = v1[i] + v2[i];
		i++;
	}

	return res;
}

var flash_matrix =
[
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0
];

var flash_matrix_null =
[
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0
];

var flash_info =
[
	0, 0, 0, 0
];
