import type { KeyValueStore } from '@/framework/storage/KeyValueStore';
import { RUNNER as C } from '@/config/runnerConstants';
export type RunnerState = 'start' | 'playing' | 'paused' | 'over';
export type RunnerAction = 'jump' | 'duckStart' | 'duckEnd' | 'confirm' | 'pause' | 'focusPause';
export interface Obstacle { id: number; x: number; kind: 'ground' | 'air' }
export class RunnerGame {
  state: RunnerState = 'start';
  elapsed = 0; distance = 0; score = 0; best = 0;
  height = 0; velocity = 0; duckRemaining = 0; pauseFocused = false;
  obstacles: Obstacle[] = []; collisions = 0;
  private accumulator = 0; private spawn = C.initialSpawn as number; private nextId = 0;
  constructor(private store: KeyValueStore) {
    const best = Number(store.get('best'));
    this.best = Number.isFinite(best) && best > 0 ? Math.floor(best) : 0;
  }
  get speed(): number { return Math.min(C.maxSpeed, C.speed + this.elapsed * C.acceleration); }
  get ducking(): boolean { return this.duckRemaining > 0; }
  action(action: RunnerAction): void {
    if (action === 'confirm') {
      if (this.state === 'start' || this.state === 'over') this.start();
      else if (this.state === 'paused') { this.state = 'playing'; this.pauseFocused = false; }
      else if (this.pauseFocused) this.pause();
      else this.action('jump');
      return;
    }
    if (this.state !== 'playing') return;
    if (action === 'pause') this.pause();
    if (action === 'focusPause') this.pauseFocused = !this.pauseFocused;
    if (action === 'jump' && this.height === 0 && !this.ducking) this.velocity = C.jumpVelocity;
    if (action === 'duckStart' && this.height === 0 && this.velocity === 0 && !this.ducking) this.duckRemaining = C.duckSeconds;
    if (action === 'duckEnd') this.duckRemaining = 0;
  }
  start(): void {
    this.state = 'playing'; this.elapsed = this.distance = this.score = this.height = this.velocity = this.duckRemaining = this.accumulator = this.nextId = this.collisions = 0;
    this.spawn = C.initialSpawn; this.obstacles = []; this.pauseFocused = false;
  }
  pause(): void { if (this.state === 'playing') { this.state = 'paused'; this.pauseFocused = false; } }
  update(dt: number): void {
    if (this.state !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    this.accumulator += Math.min(dt, C.maxFrame);
    while (this.accumulator + 1e-10 >= C.step && this.state === 'playing') {
      this.accumulator -= C.step; this.tick(C.step);
    }
  }
  private tick(dt: number): void {
    this.elapsed += dt; this.distance += this.speed * dt / C.pixelsPerMetre;
    this.score = Math.floor(this.elapsed * C.scorePerSecond + 1e-8);
    if (this.score > this.best) { this.best = this.score; this.store.set('best', String(this.best)); }
    if (this.velocity !== 0 || this.height > 0) {
      this.height += this.velocity * dt - C.gravity * dt * dt / 2;
      this.velocity -= C.gravity * dt;
      if (this.height <= 0) { this.height = 0; this.velocity = 0; }
    }
    this.duckRemaining = Math.max(0, this.duckRemaining - dt);
    this.spawn -= dt;
    if (this.spawn <= 0) {
      const id = this.nextId++;
      this.obstacles.push({ id, x: C.worldWidth, kind: id % 3 === 2 ? 'air' : 'ground' });
      this.spawn += Math.max(C.minSpawnSeconds, C.spawnSeconds - this.elapsed / 180);
    }
    for (const obstacle of this.obstacles) {
      obstacle.x -= this.speed * dt;
      const width = obstacle.kind === 'air' ? 54 : 35;
      const bottom = obstacle.kind === 'air' ? 51 : 0;
      const top = obstacle.kind === 'air' ? 78 : 71;
      const playerTop = this.height + (this.ducking ? C.duckHeight : C.playerHeight);
      if (C.playerX + 10 < obstacle.x + width && C.playerX + C.playerWidth - 10 > obstacle.x && this.height + 3 < top && playerTop - 3 > bottom) {
        this.collisions++; this.state = 'over'; return;
      }
    }
    this.obstacles = this.obstacles.filter(o => o.x > -60);
  }
}
