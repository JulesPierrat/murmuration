import type { Vector3 } from 'three';

export interface Boid {
  position: Vector3;
  velocity: Vector3;
  groupId: number;
}

export interface BoidWeights {
  alignment: number;
  cohesion: number;
  separation: number;
  speed: number;
}
