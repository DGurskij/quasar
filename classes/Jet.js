class Jet
{
  constructor(x, z, angle, color)
  {
    this.angle = angle;
    this.x = x;
    this.z = z;
    this.long = 0.0;
    this.stage = 0;
    this.color = color;
  }

  changePosition(dA)
  {
    this.angle += dA;

    if(this.stage == 0)
    {
      if(this.z > 0.0)
      {
        this.long += 0.5;
      }
      else
      {
        this.long -= 0.5;
      }

      if(this.x < 0.6)
      {
        this.x += 0.04;
      }

      if(Math.abs(this.long) > 300)
      {
        this.stage = 1;
      }

      return true;
    }
    else if(this.stage == 1)
    {
      if(this.z > 0.0)
      {
        this.long -= 5.0;
      }
      else
      {
        this.long += 5.0;
      }

      if(this.x > 0.0)
      {
        this.x -= 0.001;
      }

      if(Math.abs(this.long) < 6.0)
      {
        this.stage = 2;
      }

      return true;
    }
    else
    {
      return false;
    }
  }
}
