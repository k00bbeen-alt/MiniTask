import { t } from '@/i18n';
import type { RunnerGame } from '@/core/RunnerGame';
export class RunnerHud {
  private previous='';
  constructor(private game:RunnerGame){
    document.body.classList.add('runner');
    document.getElementById('hud')!.innerHTML=`
      <header class="runner-brand"><i></i><b data-i18n="runner.brand"></b><span data-i18n="runner.platform"></span></header>
      <section id="runner-play" hidden><div class="runner-score"><span data-i18n="runner.score"></span><strong id="runner-score"></strong><span id="runner-best"></span></div><footer><span data-i18n="runner.controls"></span><button id="runner-pause" data-i18n="runner.pause"></button></footer></section>
      <section class="runner-card" id="runner-menu" role="status"><p class="runner-label" id="runner-label"></p><h1 id="runner-title"></h1><p id="runner-intro"></p><p id="runner-controls" data-i18n="runner.controls"></p><div id="runner-results"><div><span data-i18n="runner.score"></span><strong id="runner-final"></strong></div><div><span data-i18n="runner.distance"></span><b id="runner-distance"></b><span id="runner-record"></span></div></div><button id="runner-confirm"></button><p class="runner-note" id="runner-note"></p></section>`;
  }
  update():void {
    const g=this.game;
    const text=(id:string,value:string)=>{document.getElementById(id)!.textContent=value;};
    const show=(id:string,value:boolean)=>{document.getElementById(id)!.hidden=!value;};
    const playing=g.state==='playing';
    show('runner-play',playing);show('runner-menu',!playing);show('runner-controls',g.state==='start');show('runner-results',g.state==='over');
    text('runner-score',String(g.score).padStart(6,'0'));text('runner-best',t('runner.best',{score:g.best}));
    text('runner-final',String(g.score).padStart(6,'0'));text('runner-distance',t('runner.metres',{distance:Math.floor(g.distance)}));text('runner-record',t('runner.best',{score:g.best}));
    if(!playing){for(const name of ['label','title','intro','note','confirm'])text('runner-'+name,t('runner.'+g.state+'.'+name));}
    const focus=playing?(g.pauseFocused?'runner-pause':'game-canvas'):'runner-confirm';
    document.getElementById('runner-pause')!.classList.toggle('focused',g.pauseFocused);
    if(focus!==this.previous){document.getElementById(focus)!.focus({preventScroll:true});this.previous=focus;}
    document.getElementById('game-root')!.dataset.state=g.state;
  }
}
