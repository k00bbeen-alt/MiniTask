import type { Renderer, RenderHandle } from '@/framework/render/Renderer';
import { Vector3 } from '@/framework/math/Vector3';
import type { RunnerModelId } from '@/models';
import { RUNNER as C } from '@/config/runnerConstants';
import type { RunnerGame } from './RunnerGame';
export class RunnerScene {
  private player; private eye; private line; private dots; private obstacles = new Map<number,RenderHandle>();
  private readonly scale = 0.5;
  constructor(private renderer: Renderer<RunnerModelId>) {
    this.player=renderer.addModel('player'); this.eye=renderer.addModel('eye');
    this.line=renderer.addModel('pixel');
    this.dots=Array.from({length:26},()=>renderer.addModel('pixel'));
  }
  private place(handle:RenderHandle,x:number,y:number,sx=1,sy=sx):void {
    this.renderer.setTransform(handle,new Vector3((x-550)*this.scale, -110+y*this.scale, handle===this.eye ? 1:0));
    this.renderer.setScale?.(handle,new Vector3(sx*this.scale,sy*this.scale,1));
  }
  render(game:RunnerGame):void {
    const visible=game.state==='playing';
    for(const h of [this.player,this.eye,this.line,...this.dots,...this.obstacles.values()]) this.renderer.setVisible(h,visible);
    if(visible){
      const stride=game.height===0 && !game.ducking ? Math.floor(game.elapsed/C.runFrameSeconds)%2*2 : 0;
      const sy=game.ducking?C.duckHeight/C.playerHeight:1;
      this.place(this.player,C.playerX,game.height+stride,1,sy);
      this.place(this.eye,146,game.height+stride+74*sy);
      this.place(this.line,24,0,1052,3);
      this.dots.forEach((h,i)=>this.place(h,24+(i*41-game.distance*C.pixelsPerMetre%41+1052)%1052,-8-(i%4)*3,3+(i%2),3));
      const ids=new Set(game.obstacles.map(o=>o.id));
      for(const [id,h] of this.obstacles) if(!ids.has(id)){this.renderer.remove(h);this.obstacles.delete(id);}
      for(const o of game.obstacles){
        let h=this.obstacles.get(o.id);
        if(h===undefined){h=this.renderer.addModel(o.kind==='air'?'airObstacle':'groundObstacle');this.obstacles.set(o.id,h);}
        this.renderer.setVisible(h,true); this.place(h,o.x,0);
      }
    }
    this.renderer.render();
  }
  dispose():void {for(const h of [this.player,this.eye,this.line,...this.dots,...this.obstacles.values()])this.renderer.remove(h);this.obstacles.clear();}
}
