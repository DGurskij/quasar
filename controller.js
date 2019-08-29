var pause = function(el)
{
  el.value = "Resume";
  el.onclick = () => resume(el);

  state = 0;
  if(engine != 0)
  {
    clearInterval(engine);
    engine = 0;
  }
}

var resume = function(el)
{
  el.value = "Pause";
  el.onclick = () => pause(el);

  state = 1;
  engine = setInterval(animationEngine, 16);
}

var rotate = function(value, index)
{
	let v = value * DEGR_TO_RAD;

	if(index == 2)
	{
		rotate_z = getRotationZ(v);
	}
	else if (index)
	{
		rotate_y = getRotationY(v);
	}
	else
	{
		rotate_x = getRotationX(v);
	}
}
