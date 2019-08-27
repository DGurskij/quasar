class Particle
{
  constructor(x, z, size, angle, color)
  {
    this.angle = angle;
    this.x = x;
    this.z = z;
    this.size = size;
    this.color = color;
  }

  changePosition(dA, dx)
  {
    this.angle += dA;
    this.x -= dx;
  }
}
