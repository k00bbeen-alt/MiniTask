import '@/i18n';
import { t } from '@/i18n';
import { Game } from '@/core/Game';
import { RingScene } from '@/core/RingScene';
import { LOOP } from '@/config/gameplayConstants';
import { GameLoop } from '@/framework/core/GameLoop';
import { PointerKeyboardInput } from '@/framework/input/PointerKeyboardInput';
import { ThreeRenderer } from '@/framework/render/ThreeRenderer';
import { BrowserKeyValueStore } from '@/framework/storage/KeyValueStore';
import { applyStaticTranslations } from '@/framework/i18n/i18n';
import { installDriveHarness, driveModeRequested } from '@/framework/debug/DriveHarness';
import { captureGlobalErrors, consoleSink } from '@/framework/debug/Logger';
import { registerGameServiceWorker } from '@/framework/sw/register';
import { Hud } from '@/hud/Hud';
import { MODELS } from '@/models';
import { log } from '@/log';
import { RunnerGame } from '@/core/RunnerGame';
import { RunnerInput } from '@/core/RunnerInput';
import { RunnerScene } from '@/core/RunnerScene';
import { RunnerHud } from '@/hud/RunnerHud';
import { RUNNER_MODELS } from '@/models';
import './runner.css';
applyStaticTranslations();
log.addSink(consoleSink()); captureGlobalErrors(log);
try {
 if (new URLSearchParams(location.search).get('game') !== 'still-point') {
   bootRunner();
 } else {
 const root = document.getElementById('game-root')!;
 const renderer = new ThreeRenderer(document.querySelector<HTMLCanvasElement>('#game-canvas')!, MODELS, {projection:'orthographic',viewSize:300});
 const scene = new RingScene(renderer);
 const input = new PointerKeyboardInput();
 const driven = driveModeRequested(location.search);
 let last = performance.now();
 let renderElapsed = 0;
 let frames = 0;
 let game: Game;
 // Synchronize to the input instant, rather than judging the previous rendered frame.
 const sync = () => { const now=performance.now(); if (!driven) game.update((now-last)/1000); last=now; };
 input.on('pinchTap',()=>{const now=performance.now();if(!driven) game.advanceForSelect((now-last)/1000);last=now;});
 input.on('dpadSwipe',sync);
 const storage = new BrowserKeyValueStore({namespace:'still-point'});
 game = new Game(input,storage);
 const hud = new Hud(game,storage.isPersistent());
 const draw = () => {scene.render(game); hud.update(); frames++;};
 const loop = new GameLoop({update(dt) {
   if(driven) game.update(dt); else sync();
   renderElapsed += dt;
 }, render() {
   if(driven || renderElapsed >= 1/LOOP.fps || !game.timed) {
     draw(); renderElapsed %= 1/LOOP.fps;
   }
   if(!game.timed) loop.stop();
 }},LOOP);
 const reconcile = () => { draw(); if (!driven && game.timed && !document.hidden) {last=performance.now();loop.start();} else loop.stop(); };
 input.on('pinchTap',reconcile); input.on('dpadSwipe',reconcile);
 input.attach(window);
 const resize = () => {renderer.resize(root.clientWidth,root.clientHeight);draw();};
 new ResizeObserver(resize).observe(root);
 renderer.resize(root.clientWidth,root.clientHeight);
 const suspend = () => {game.pause();loop.stop();input.detach();draw();};
 document.addEventListener('visibilitychange',()=>{
   if(document.hidden) suspend();
   else {last=performance.now();input.attach(window);draw();}
 });
 window.addEventListener('pagehide',suspend);
 window.addEventListener('pageshow',()=>{last=performance.now();input.attach(window);draw();});
 if(driven) installDriveHarness(loop);
 if(import.meta.env.DEV) Object.assign(window,{__game:game,__stillPoint:{pause:suspend, get frames(){return frames;},get running(){return loop.isRunning();},stats:()=>renderer.getStats()}});
 void registerGameServiceWorker({search:location.search});
 draw();
 }
} catch(error) {
 log.error('Still Point startup failed',{error:String(error)});
 document.getElementById('boot-error')!.hidden=false;
}

function bootRunner():void {
  const root=document.getElementById('game-root')!;
  const canvas=document.querySelector<HTMLCanvasElement>('#game-canvas')!;
  canvas.tabIndex=-1;
  const renderer=new ThreeRenderer(canvas,RUNNER_MODELS,{projection:'orthographic',viewSize:300});
  const scene=new RunnerScene(renderer);
  const game=new RunnerGame(new BrowserKeyValueStore({namespace:'dino-run'}));
  const hud=new RunnerHud(game);
  applyStaticTranslations(); document.title=t('runner.brand');
  const driven=driveModeRequested(location.search);
  let frames=0; let renderTime=0;
  const draw=()=>{scene.render(game);hud.update();frames++;};
  const loop=new GameLoop({update:dt=>{game.update(dt);renderTime+=dt;},render:()=>{if(driven || renderTime>=1/30 || game.state!=='playing'){draw();renderTime%=1/30;}if(game.state!=='playing')loop.stop();}},LOOP);
  const input=new RunnerInput(action=>{game.action(action);draw();if(!driven && game.state==='playing' && !document.hidden)loop.start();else loop.stop();});
  const resize=()=>{renderer.resize(root.clientWidth,root.clientHeight);draw();};
  const observer=new ResizeObserver(resize);observer.observe(root);
  const suspend=()=>{game.pause();loop.stop();input.detach();draw();};
  const restore=()=>{if(!document.hidden){input.attach(window);draw();}};
  const visibility=()=>document.hidden?suspend():restore();
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('pagehide',suspend);window.addEventListener('pageshow',restore);
  input.attach(window);resize();
  if(driven)installDriveHarness(loop);
  if(import.meta.env.DEV)Object.assign(window,{__game:game,__runner:{get frames(){return frames;},get running(){return loop.isRunning();},stats:()=>renderer.getStats()}});
  import.meta.hot?.dispose(()=>{loop.stop();input.detach();observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',suspend);window.removeEventListener('pageshow',restore);scene.dispose();});
  void registerGameServiceWorker({search:location.search});
}
