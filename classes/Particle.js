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

  changePosition()
  {
    this.angle += move_angle;
    this.x -= move_x;
  }
}
