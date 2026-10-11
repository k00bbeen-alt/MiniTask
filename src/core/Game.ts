import { RULES } from '@/config/gameplayConstants';
import type { InputManager, DpadDirection } from '@/framework/input/InputManager';
import type { KeyValueStore } from '@/framework/storage/KeyValueStore';
export type State = 'start' | 'ready' | 'playing' | 'perfect' | 'good' | 'result' | 'paused';
export type Failure = 'early' | 'late' | 'missed';
export function durationFor(score: number): number {
  return Math.max(RULES.minSeconds, RULES.initialSeconds / RULES.speedMultiplier ** score);
}
export function judge(radius: number): 'perfect' | 'good' | 'early' | 'late' {
  const delta = radius - RULES.targetRadius;
  if (Math.abs(delta) <= RULES.perfectPx + RULES.boundaryEpsilon) return 'perfect';
  if (Math.abs(delta) <= RULES.goodPx + RULES.boundaryEpsilon) return 'good';
  return delta > 0 ? 'early' : 'late';
}
export class Game {
  state: State = 'start';
  score = 0;
  best = 0;
  elapsed = 0;
  radius = RULES.startRadius;
  menuIndex = 0;
  failure: Failure = 'missed';
  private savedState: State = 'playing';
  private suppressSelect = false;
  constructor(input: InputManager, private store: KeyValueStore) {
    const best = Number(store.get('best'));
    this.best = Number.isSafeInteger(best) && best >= 0 ? best : 0;
    input.on('pinchTap', () => this.select());
    input.on('dpadSwipe', d => this.navigate(d));
  }
  get timed(): boolean { return ['ready', 'playing', 'perfect', 'good'].includes(this.state); }
  get duration(): number { return durationFor(this.score); }
  private reset(): void {
    this.score = 0; this.elapsed = 0; this.radius = RULES.startRadius;
    this.state = 'ready'; this.menuIndex = 0;
  }
  navigate(direction: DpadDirection): void {
    if (this.state !== 'paused') return;
    if (direction === 'up' || direction === 'left') this.menuIndex = 0;
    if (direction === 'down' || direction === 'right') this.menuIndex = 1;
  }
  select(): void {
    if (this.suppressSelect) { this.suppressSelect = false; return; }
    if (this.state === 'start' || this.state === 'result') { this.reset(); return; }
    if (this.state === 'paused') {
      if (this.menuIndex === 1) this.reset(); else this.state = this.savedState;
      return;
    }
    if (this.state !== 'playing') return;
    const result = judge(this.radius);
    if (result === 'early' || result === 'late') { this.fail(result); return; }
    this.state = result; this.elapsed = 0; this.score += 1;
    if (this.score > this.best) { this.best = this.score; this.store.set('best', String(this.best)); }
  }
  pause(): void {
    if (!this.timed) return;
    this.savedState = this.state; this.state = 'paused'; this.menuIndex = 0;
  }
  advanceForSelect(dt: number): void {
    const previous = this.state;
    this.update(dt);
    if (previous !== this.state) {
      this.suppressSelect = true;
      if (previous === 'playing' && this.state === 'result') this.failure = 'late';
    }
  }
  private fail(reason: Failure): void { this.failure = reason; this.state = 'result'; this.menuIndex = 0; }
  update(dt: number): void {
    if (!this.timed || !Number.isFinite(dt) || dt < 0) return;
    this.elapsed += dt;
    if (this.state === 'ready' && this.elapsed + RULES.boundaryEpsilon >= RULES.readySeconds) {
      this.state = 'playing'; this.elapsed = 0; this.radius = RULES.startRadius; return;
    }
    if ((this.state === 'perfect' || this.state === 'good') && this.elapsed + RULES.boundaryEpsilon >= RULES.feedbackSeconds) {
      this.state = 'playing'; this.elapsed = 0; this.radius = RULES.startRadius; return;
    }
    if (this.state === 'playing') {
      this.radius = RULES.startRadius - (RULES.startRadius - RULES.endRadius) * this.elapsed / this.duration;
      if (this.radius < RULES.targetRadius - RULES.goodPx - RULES.boundaryEpsilon) this.fail('missed');
    }
  }
}
