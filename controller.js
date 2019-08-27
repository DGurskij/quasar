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
