var hideBlock = function(btn, number)
{
  let el  = document.getElementsByName('hide-block')[number];
  let str = btn.textContent;
  str = str.substr(0, str.length - 1);

  if(el.style.display == "none")
  {
    el.style.display = "";
    btn.innerHTML = str + '&#9650;';
  }
  else
  {
    el.style.display = "none";
    btn.innerHTML = str + '&#9660;';
  }
}

var changeColor = function(value, i)
{
  color[i] = value;
  drawScene();
}

var changeQuantityArms = function(quantity)
{
  quantity_arms  = quantity;
  arm_angle_step = PI_MUL_TWO / quantity;
  arm_angle_disp = PI / quantity;
  step_quantity  = document.getElementsByName('pre-proc')[0].value / quantity;
}

var changeDensity = function(quantity)
{
  step_quantity = quantity / quantity_arms;
}
