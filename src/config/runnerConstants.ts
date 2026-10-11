export const RUNNER = {
  step: 1 / 120, maxFrame: 0.25, speed: 230, maxSpeed: 390, acceleration: 3,
  gravity: 1450, jumpVelocity: 650, duckSeconds: 0.9,
  spawnSeconds: 2.1, minSpawnSeconds: 1.65, initialSpawn: 1.4,
  playerX: 68, playerWidth: 107, playerHeight: 97, duckHeight: 42,
  worldWidth: 1100, groundY: 320, scorePerSecond: 10,
  pixelsPerMetre: 25, runFrameSeconds: 0.12,
} as const;
