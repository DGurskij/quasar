export class Game {
  /** Game ticker for engine */
  ticker: number | undefined;
  /** Game state: 0 - not started, 1 - started, 2 - paused */
  gameState: 0 | 1 | 2 = 0;

  transformation: mat4;
  projection: vec2;
  rotate_x: number;
  rotate_y: number;
  rotate_z: number;
  distance: number;
  width: number;
  height: number;
  depth: number;

  engineFunction: (...args: any[]) => void;
  drawFunction: (...args: any[]) => void;
  onGameEnd: (gameResult: IGameResult) => void | Promise<void>;
  onGameStopped: () => void | Promise<void>;
  onGamePlayPause: (state: 0 | 1) => void;

  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.engineFunction = () => {};
    this.drawFunction = () => {};
    this.onGameEnd = () => {};
    this.onGameStopped = () => {};
    this.onGamePlayPause = () => {};

    this.particles  = GAME_OBJECTS.particles;
    this.stars      = GAME_OBJECTS.stars;
    this.blackHoles = GAME_OBJECTS.blackHoles;
    this.blastWawes = GAME_OBJECTS.blastWawes;
  }

  startGame() {
    this.gameState = 1;
    this.scale = 1;

    this.particles  = GAME_OBJECTS.particles  = [];
    this.stars      = GAME_OBJECTS.stars      = [];
    this.blackHoles = GAME_OBJECTS.blackHoles = [];
    this.blastWawes = GAME_OBJECTS.blastWawes = [];

    STATS.sended = false;
    STATS.clear();

    this.blackHoleTimer = 10000;

    this.cameraX = 0;
		this.cameraY = 0;

		const width_ = this.halfW - STAR_MAX_SIZE;
		const height_ = this.halfH - STAR_MAX_SIZE;    

    let x = random(width_, STAR_MAX_SIZE);
    let y = random(height_, STAR_MAX_SIZE);
    
		this.stars.push(new Star(60, x, y, 0, 0));

		x = random(-STAR_MAX_SIZE, -width_);
		y = random(-STAR_MAX_SIZE, -height_);

		this.stars.push(new Star(60, x, y, 0, 0));

		this.ticker = setInterval(this.engineFunction, 16) as unknown as number;
  }

  stopGame() {
    if (!STATS.sended) {
      STATS.sended = true;

      if (STATS.data.score.score > 0) {
        this.onGameEnd(STATS.getGameResult());
      }
    }
    this.gameState = 0;
    STATS.clear();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = undefined;
    }

    this.onGameStopped();
  }

  pauseGame(send = false) {
    this.gameState = 2;

    if (typeof this.ticker !== 'undefined') {
      clearInterval(this.ticker);
      this.ticker = undefined;
    }

    this.drawFunction();

    if (send) {
      this.onGamePlayPause(0);
    }
  }

  resumeGame(send = false) {
    this.gameState = 1;
    this.ticker = setInterval(this.engineFunction, 16) as unknown as number;

    if (send) {
      this.onGamePlayPause(1);
    }
  }

  /**
   * Serach star in (x; y)
   */
  searchStarInLocation(x: number, y: number) {
    x = (x - this.halfW) / this.scale + this.cameraX;
    y = (this.halfH - y) / this.scale + this.cameraY;

    for (let i = 0; i < GAME_OBJECTS.stars.length; i++) {
      if (!this.stars[i].isSupernova) {
        if (this.stars[i].size > 15) {
          if (distanceSurfacePtoP(x, y, 0, this.stars[i].x, this.stars[i].y, this.stars[i].size * 0.8) <= 0) {
            this.stars[i].userHover();
          }
        }
      }
    }
  }

  /**
   * Move camera
   */
  locationChange(x: number, y: number) {
    this.cameraX += (this.mouseDownX - x) / this.scale;
    this.cameraY -= (this.mouseDownY - y) / this.scale;

    this.mouseDownX = x;
    this.mouseDownY = y;

    if(this.gameState == 2) {
      this.drawFunction();
    }
  }

  /* ELEMENTS NAVIGATORS */
  toBlackHole() {
    if (blackHoleFollow + 1 >= this.blackHoles.length) {
      blackHoleFollow = -1;
    }

    for (let i = blackHoleFollow + 1; i < this.blackHoles.length; i++) {
      this.cameraX = this.blackHoles[i].x;
      this.cameraY = this.blackHoles[i].y;

      blackHoleFollow = i;
      break;
    }

    this.drawFunction();
  }

  toStar() {
    if (starFollow + 1 >= this.stars.length) {
      starFollow = -1;
    }

    for (let i = starFollow + 1; i < this.stars.length; i++) {
      if (!this.stars[i].isSupernova && this.stars[i].size > STAR_MIN_SIZE) {
        this.cameraX = this.stars[i].x;
        this.cameraY = this.stars[i].y;

        starFollow = i;

        break;
      }
    }

    this.drawFunction();
  }
}
