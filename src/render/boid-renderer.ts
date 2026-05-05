import {
  ConeGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';
import type { Boid } from '../boids/types';

const UP = new Vector3(0, 1, 0);

export class BoidRenderer {
  readonly mesh: InstancedMesh;

  private readonly _matrix = new Matrix4();
  private readonly _quat = new Quaternion();
  private readonly _scale = new Vector3(0.15, 0.4, 0.15);
  private readonly _dir = new Vector3();

  constructor(count: number) {
    const geometry = new ConeGeometry(1, 1, 6);
    geometry.translate(0, 0.5, 0);
    const material = new MeshStandardMaterial({ color: 0xeeeeee, flatShading: true });
    this.mesh = new InstancedMesh(geometry, material, count);
    this.mesh.frustumCulled = false;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (Array.isArray(material)) {
      for (const m of material) m.dispose();
    } else {
      material.dispose();
    }
    this.mesh.dispose();
  }

  sync(boids: readonly Boid[]): void {
    const n = Math.min(boids.length, this.mesh.count);
    for (let i = 0; i < n; i++) {
      const b = boids[i];
      if (!b) continue;
      this._dir.copy(b.velocity);
      const len = this._dir.length();
      if (len > 0) this._dir.divideScalar(len);
      else this._dir.set(0, 1, 0);
      this._quat.setFromUnitVectors(UP, this._dir);
      this._matrix.compose(b.position, this._quat, this._scale);
      this.mesh.setMatrixAt(i, this._matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
