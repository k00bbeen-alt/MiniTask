import { describe, expect, it } from 'vitest';
import { Game, durationFor, judge } from './Game';
import { RULES } from '@/config/gameplayConstants';
import { FakeInput } from '@/framework/testing/fakes';
import { PointerKeyboardInput } from '@/framework/input/PointerKeyboardInput';
import { MemoryKeyValueStore } from '@/framework/storage/KeyValueStore';
function setup(store=new MemoryKeyValueStore()) {
 const input=new FakeInput(); const game=new Game(input,store);
 const tap=()=>input.fire('pinchTap',undefined);
 const play=()=>{tap();game.update(RULES.readySeconds);};
 const at=(radius:number)=>game.update((RULES.startRadius-radius)/(RULES.startRadius-RULES.endRadius)*game.duration-game.elapsed);
 return {game,input,tap,play,at,store};
}
describe('Still Point rules',()=>{
 it('start input only enters ready, ready ignores selection',()=>{const {game,tap}=setup();tap();tap();expect(game.state).toBe('ready');expect(game.score).toBe(0);});
 it('ready transitions to full-radius play',()=>{const {game,play}=setup();play();expect(game.state).toBe('playing');expect(game.radius).toBe(160);});
 it.each([[96,'perfect'],[101,'perfect'],[91,'perfect'],[108,'good'],[84,'good'],[102,'good'],[90,'good'],[109,'early'],[83,'late']] as const)('judges radius %s as %s',(r,result)=>expect(judge(r)).toBe(result));
 it('awards one point, locks feedback and increases speed',()=>{const {game,play,at,tap}=setup();play();at(96);tap();tap();expect(game.state).toBe('perfect');expect(game.score).toBe(1);expect(game.duration).toBeCloseTo(2.2/1.04);game.update(.45);expect(game.state).toBe('playing');});
 it('Good gives the same point',()=>{const {game,play,at,tap}=setup();play();at(105);tap();expect(game.state).toBe('good');expect(game.score).toBe(1);});
 it('early press ends run',()=>{const {game,play,tap}=setup();play();tap();expect(game.state).toBe('result');expect(game.failure).toBe('early');});
 it('late event does not also restart',()=>{const {game,play,tap}=setup();play();game.advanceForSelect(2);tap();expect(game.state).toBe('result');expect(game.failure).toBe('late');tap();expect(game.state).toBe('ready');});
 it('no input fails as soon as the window passes',()=>{const {game,play,at}=setup();play();at(83.9);expect(game.state).toBe('result');expect(game.failure).toBe('missed');});
 it('all frame rates give equivalent radius',()=>{const a=setup(),b=setup();a.play();b.play();a.game.update(1);for(let i=0;i<30;i++)b.game.update(1/30);expect(a.game.radius).toBeCloseTo(b.game.radius);});
 it('difficulty never drops below .85 seconds',()=>{expect(durationFor(0)).toBe(2.2);expect(durationFor(100)).toBe(.85);expect(durationFor(10000)).toBe(.85);});
 it('persists and restores best without decreasing it',()=>{const a=setup();a.play();a.at(96);a.tap();const b=setup(a.store);expect(b.game.best).toBe(1);b.play();b.tap();expect(b.game.best).toBe(1);});
 it('ignores malformed stored scores',()=>{const store=new MemoryKeyValueStore();store.set('best','NaN');expect(setup(store).game.best).toBe(0);});
 it('pauses elapsed time and resumes without judging',()=>{const {game,play,tap}=setup();play();game.update(.5);const r=game.radius;game.pause();game.update(100);expect(game.radius).toBe(r);tap();expect(game.state).toBe('playing');expect(game.score).toBe(0);expect(game.radius).toBe(r);});
 it('preserves ready and success feedback through pause',()=>{const {game,tap,at}=setup();tap();game.update(.4);game.pause();tap();game.update(.4);at(96);tap();game.update(.2);game.pause();tap();game.update(.25);expect(game.state).toBe('playing');expect(game.score).toBe(1);});
 it('pause arrows move between resume and restart',()=>{const {game,input,play,tap}=setup();play();game.pause();input.fire('dpadSwipe','down');expect(game.menuIndex).toBe(1);input.fire('dpadSwipe','left');expect(game.menuIndex).toBe(0);input.fire('dpadSwipe','right');tap();expect(game.state).toBe('ready');expect(game.score).toBe(0);});
 it('actual input adapter ignores held Enter repeat across ready',()=>{const input=new PointerKeyboardInput();const game=new Game(input,new MemoryKeyValueStore());const press=(repeat:boolean)=>input.handleKeyDown({key:'Enter',code:'Enter',repeat,preventDefault(){}});press(false);game.update(.8);press(true);expect(game.state).toBe('playing');press(false);expect(game.failure).toBe('early');});
});
