import { Vector3 } from 'three';
import type { Boid, BoidWeights } from './types';
import { UniformGrid } from './uniform-grid';
import type { WindField } from './wind-field';

export interface FlockOptions {
  count: number;
  /** Half-extent of the cubic bounding volume centered at the origin. */
  bounds: number;
  /** Half-extent of the cube boids are spawned in. Should be smaller than `bounds`. */
  spawnRadius: number;
  /** Number of topological nearest neighbors each boid follows. */
  topologicalK: number;
  /**
   * Side of one grid cell. The 3×3×3 cell neighborhood around a boid is
   * scanned for candidates; cellSize should be chosen so this typically
   * contains well above `topologicalK` boids in dense areas.
   */
  gridCellSize: number;
  /** Hard upper bound on speed (modulated at runtime by BoidWeights.speed). */
  maxSpeed: number;
  /** Lower bound on speed; keeps boids from stalling. */
  minSpeed: number;
  /** Strength of the soft turn-around force at the boundary. */
  boundaryStrength: number;
  /** Fraction of `bounds` past which the boundary force engages (0–1). */
  boundaryMargin: number;
}

const DEFAULT_OPTIONS: FlockOptions = {
  count: 500,
  bounds: 50,
  spawnRadius: 10,
  topologicalK: 7,
  gridCellSize: 8,
  maxSpeed: 12,
  minSpeed: 2,
  boundaryStrength: 4,
  boundaryMargin: 0.8,
};

export class Flock {
  readonly boids: Boid[] = [];
  readonly weights: BoidWeights;
  readonly options: FlockOptions;
  wind: WindField | null;
  private readonly grid: UniformGrid;

  // Top-k scratch buffers, sized once and reused across all boids.
  private readonly _topDistSq: number[];
  private readonly _topIdx: number[];

  // Reusable scratch vectors to avoid allocations inside the hot loop.
  private readonly _alignment = new Vector3();
  private readonly _cohesion = new Vector3();
  private readonly _separation = new Vector3();
  private readonly _diff = new Vector3();
  private readonly _steer = new Vector3();
  private readonly _wind = new Vector3();

  constructor(
    weights: BoidWeights,
    options: Partial<FlockOptions> = {},
    wind: WindField | null = null,
  ) {
    this.weights = weights;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.wind = wind;
    this.grid = new UniformGrid(this.options.gridCellSize);

    const k = this.options.topologicalK;
    this._topDistSq = new Array<number>(k).fill(Infinity);
    this._topIdx = new Array<number>(k).fill(-1);

    const { count, spawnRadius, maxSpeed } = this.options;
    for (let i = 0; i < count; i++) {
      this.boids.push({
        position: new Vector3(
          (Math.random() * 2 - 1) * spawnRadius,
          (Math.random() * 2 - 1) * spawnRadius,
          (Math.random() * 2 - 1) * spawnRadius,
        ),
        velocity: new Vector3(
          (Math.random() * 2 - 1) * maxSpeed,
          (Math.random() * 2 - 1) * maxSpeed,
          (Math.random() * 2 - 1) * maxSpeed,
        ),
        groupId: 0,
      });
    }
  }

  update(dt: number): void {
    const { topologicalK, maxSpeed, minSpeed, bounds, boundaryStrength, boundaryMargin } =
      this.options;
    const speedCap = maxSpeed * this.weights.speed;
    const margin = bounds * boundaryMargin;

    if (this.wind) this.wind.advance(dt);

    this.grid.clear();
    for (let i = 0; i < this.boids.length; i++) {
      const b = this.boids[i];
      if (b) this.grid.insert(i, b.position);
    }

    for (let i = 0; i < this.boids.length; i++) {
      const boid = this.boids[i];
      if (!boid) continue;

      // Reset top-k buffer.
      for (let s = 0; s < topologicalK; s++) {
        this._topDistSq[s] = Infinity;
        this._topIdx[s] = -1;
      }

      // Collect topologicalK nearest neighbors from the 3×3×3 grid neighborhood.
      this.grid.forEachNeighbor(boid.position, (j) => {
        if (i === j) return;
        const other = this.boids[j];
        if (!other) return;
        this._diff.copy(boid.position).sub(other.position);
        const distSq = this._diff.lengthSq();
        if (distSq <= 0) return;

        // Replace the worst slot if this candidate is closer.
        let worstAt = 0;
        let worstVal = this._topDistSq[0] ?? Infinity;
        for (let s = 1; s < topologicalK; s++) {
          const v = this._topDistSq[s] ?? Infinity;
          if (v > worstVal) {
            worstVal = v;
            worstAt = s;
          }
        }
        if (distSq < worstVal) {
          this._topDistSq[worstAt] = distSq;
          this._topIdx[worstAt] = j;
        }
      });

      this._alignment.set(0, 0, 0);
      this._cohesion.set(0, 0, 0);
      this._separation.set(0, 0, 0);
      let valid = 0;

      for (let s = 0; s < topologicalK; s++) {
        const j = this._topIdx[s] ?? -1;
        if (j < 0) continue;
        const other = this.boids[j];
        if (!other) continue;
        const distSq = this._topDistSq[s] ?? 0;
        this._alignment.add(other.velocity);
        this._cohesion.add(other.position);
        this._diff.copy(boid.position).sub(other.position);
        // Separation: closer neighbors push exponentially harder.
        if (distSq > 0) this._separation.addScaledVector(this._diff, 1 / distSq);
        valid++;
      }

      this._steer.set(0, 0, 0);

      if (valid > 0) {
        this._alignment.divideScalar(valid).setLength(speedCap).sub(boid.velocity);
        this._steer.addScaledVector(this._alignment, this.weights.alignment);

        this._cohesion
          .divideScalar(valid)
          .sub(boid.position)
          .setLength(speedCap)
          .sub(boid.velocity);
        this._steer.addScaledVector(this._cohesion, this.weights.cohesion);

        if (this._separation.lengthSq() > 0) {
          this._separation.setLength(speedCap).sub(boid.velocity);
          this._steer.addScaledVector(this._separation, this.weights.separation);
        }
      }

      // External wind: contributes to steering at the boid's current position.
      if (this.wind) {
        this.wind.sample(boid.position, this._wind);
        this._steer.add(this._wind);
      }

      // Soft turn-around at the boundary: a force that grows linearly past `margin`.
      this._steer.x -=
        Math.sign(boid.position.x) *
        Math.max(0, Math.abs(boid.position.x) - margin) *
        boundaryStrength;
      this._steer.y -=
        Math.sign(boid.position.y) *
        Math.max(0, Math.abs(boid.position.y) - margin) *
        boundaryStrength;
      this._steer.z -=
        Math.sign(boid.position.z) *
        Math.max(0, Math.abs(boid.position.z) - margin) *
        boundaryStrength;

      boid.velocity.addScaledVector(this._steer, dt);

      const sp = boid.velocity.length();
      if (sp > speedCap) boid.velocity.setLength(speedCap);
      else if (sp < minSpeed) boid.velocity.setLength(minSpeed);

      boid.position.addScaledVector(boid.velocity, dt);
    }
  }
}
