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
    this.angle += p_move_angle;
    this.x -= p_move_x;
  }
}
