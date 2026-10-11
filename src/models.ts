import * as THREE from 'three';
import { COLORS } from '@/config/gameplayConstants';
import type { ModelCatalog, ModelSpec } from '@/framework/render/ThreeRenderer';
export type ModelId = 'target' | 'moving' | 'merged' | 'broken';
function ring(color: number, thickness: number, broken = false): ModelSpec {
  return { defaultColor: color, build(tint) {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: tint, side: THREE.DoubleSide });
    if (broken) {
      for (const offset of [0.25, Math.PI + 0.25]) {
        group.add(new THREE.Mesh(new THREE.RingGeometry(1 - thickness / 192, 1 + thickness / 192, 96, 1, offset, Math.PI - 0.5), material));
      }
    } else group.add(new THREE.Mesh(new THREE.RingGeometry(1 - thickness / 192, 1 + thickness / 192, 128), material));
    return group;
  }};
}
export const MODELS: ModelCatalog<ModelId> = {
  target: ring(COLORS.target, 2), moving: ring(COLORS.moving, 3),
  merged: ring(COLORS.moving, 4), broken: ring(COLORS.miss, 3, true),
};

// Exact polygon coordinates from the supplied Paper Page 2 SVG. Origin is ground-left.
function polygon(points: number[][], originX = 0, originY = 320): ModelSpec {
  return { defaultColor: 0xffffff, build(color) {
    const shape = new THREE.Shape();
    points.forEach(([x,y], i) => i ? shape.lineTo(x-originX, originY-y) : shape.moveTo(x-originX, originY-y));
    shape.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide}));
  }};
}
export const RUNNER_MODELS = {
  player: polygon([[160,268],[160,283],[137,283],[137,320],[122,320],[122,295],[104,295],[104,320],[89,320],[89,288],[82,288],[82,320],[68,320],[68,271],[80,271],[80,247],[98,247],[98,223],[141,223],[141,235],[158,235],[158,251],[175,251],[175,268]],68),
  groundObstacle: polygon([[420,320],[420,266],[430,266],[430,249],[443,249],[443,266],[455,266],[455,320],[443,320],[443,298],[433,298],[433,320]],420),
  airObstacle: polygon([[876,251],[894,251],[894,242],[912,242],[912,251],[930,251],[930,260],[912,260],[912,269],[894,269],[894,260],[876,260]],876),
  pixel: polygon([[0,0],[1,0],[1,1],[0,1]],0,0),
  eye: {defaultColor:0x00cfe8,build(color:number){return new THREE.Mesh(new THREE.CircleGeometry(3.5,12),new THREE.MeshBasicMaterial({color}));}},
};
export type RunnerModelId = keyof typeof RUNNER_MODELS;
