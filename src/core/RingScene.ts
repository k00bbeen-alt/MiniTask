import type { Game } from './Game';
import { RULES } from '@/config/gameplayConstants';
import type { Renderer } from '@/framework/render/Renderer';
import { Vector3 } from '@/framework/math/Vector3';
import type { ModelId } from '@/models';
export class RingScene {
  private handles;
  constructor(private renderer: Renderer<ModelId>) {
    this.handles = { target: renderer.addModel('target'), moving: renderer.addModel('moving'),
      merged: renderer.addModel('merged'), broken: renderer.addModel('broken') };
  }
  render(game: Game): void {
    for (const h of Object.values(this.handles)) this.renderer.setVisible(h, false);
    const show = (id: ModelId, radius: number, y = 0) => {
      const h = this.handles[id]; this.renderer.setVisible(h, true);
      this.renderer.setScale?.(h, radius); this.renderer.setTransform(h, new Vector3(0, y, 0));
    };
    switch (game.state) {
      case 'start': show('target', 88, -18); show('moving', 68, -18); break;
      case 'ready': show('target', RULES.targetRadius); break;
      case 'playing': show('target', RULES.targetRadius); show('moving', game.radius); break;
      case 'perfect': show('merged', RULES.targetRadius); break;
      case 'good': show('target', RULES.targetRadius); show('moving', game.radius); break;
      case 'result': show('broken', 54, 194); break;
    }
    this.renderer.render();
  }
}
