import { PointerKeyboardInput, type KeyEventLike } from '@/framework/input/PointerKeyboardInput';
import type { RunnerAction } from './RunnerGame';
/** Existing framework owns listener attachment. This adapter only translates events. */
export class RunnerInput extends PointerKeyboardInput {
  constructor(private send: (action: RunnerAction) => void) {
    super();
    this.on('pinchTap', () => send('confirm'));
    this.on('dpadSwipe', direction => send(direction === 'down' ? 'duckStart' : 'focusPause'));
  }
  override handleKeyDown(event: KeyEventLike): void {
    const key = event.key || event.code;
    if ([' ', 'Space', 'p', 'P', 'Escape'].includes(key)) {
      event.preventDefault();
      if (!event.repeat) this.send(key === ' ' || key === 'Space' ? 'jump' : 'pause');
      return;
    }
    super.handleKeyDown(event);
  }
}
