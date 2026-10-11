import type { Game } from '@/core/Game';
import { t } from '@/i18n';
export class Hud {
  private previous = '';
  constructor(private game: Game, private persistent: boolean) {}
  update(): void {
    const g = this.game;
    const signature = [g.state,g.score,g.best,g.failure,g.menuIndex].join(':');
    if (signature === this.previous) return;
    this.previous = signature;
    const el = (id: string) => document.getElementById(id)!;
    el('game-root').dataset.state = g.state;
    for (const [id,show] of Object.entries({ 'start-screen':g.state==='start', 'play-screen':['ready','playing','perfect','good'].includes(g.state), 'result-screen':g.state==='result', 'pause-screen':g.state==='paused' })) el(id).hidden = !show;
    el('score-hud').hidden = g.state==='ready';
    el('ready-brand').hidden = g.state!=='ready';
    el('score').textContent = String(g.score).padStart(2,'0');
    const feedback = ['ready','perfect','good'].includes(g.state);
    el('feedback-title').textContent = feedback ? t(g.state) : '';
    el('feedback-hint').textContent = feedback ? t(g.state+'Hint') : '';
    el('play-hint').hidden = g.state !== 'playing';
    el('reason').textContent = t(g.failure);
    el('reason-hint').textContent = t(g.failure+'Hint');
    el('final-score').textContent = String(g.score).padStart(2,'0');
    el('best-score').textContent = t('best',{score:g.best});
    el('result-footer').textContent = t(this.persistent ? 'retryHint' : 'storage');
    const active = g.state==='start'?'start':g.state==='result'?'restart':g.state==='paused'?(g.menuIndex===0?'resume':'pause-restart'):null;
    for (const button of document.querySelectorAll<HTMLButtonElement>('button')) {
      button.dataset.focused = String(button.id === active);
      button.tabIndex = button.id === active ? 0 : -1;
      if (button.id === active) button.focus({preventScroll:true});
      else if (document.activeElement === button) button.blur();
    }
  }
}
