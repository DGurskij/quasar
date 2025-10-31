export interface IQuasarMetrices {
  quantityParticles: number;
  quantityValues: number;
}

export interface IQuasarGenerativeParameters {
  quasarRadius: number;
  blackHoleSize: number;
  particleMoveX: number;
  particleMoveAngle: number;
  particleGenerateStep: number;
}

export interface IQuasarJetParameters {
  jetsMoveZ: number;
  jetsMoveX: number;
  jetsMoveAngle: number;
}
