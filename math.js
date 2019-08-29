var random = function(v1, v2)
{
	if (v1 < v2)
	{
		return Math.random() * (v2 - v1) + v1;
	}

	return Math.random() * (v1 - v2) + v2;
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

var getRotationX = function(a)
{
	let s = Math.sin(a);
	let c = Math.cos(a);

	return [
		1, 0, 0, 0,
		0, c, s, 0,
		0, -s, c, 0,
		0, 0, 0, 1
	];
}

var getRotationY = function(a)
{
	let s = Math.sin(a);
	let c = Math.cos(a);

	return [
		c, 0, -s, 0,
		0, 1, 0, 0,
		s, 0, c, 0,
		0, 0, 0, 1
	];
}

var getRotationZ = function(a)
{
	let s = Math.sin(a);
	let c = Math.cos(a);

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

var vecMul = function(v, mul)
{
	let l = v.length;
	let res = [];

	for(let i = 0; i < l; i++)
	{
		res[i] = v[i] * mul;
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
