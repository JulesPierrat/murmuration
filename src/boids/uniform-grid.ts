import type { Vector3 } from 'three';

/**
 * 3D uniform grid that maps cell coordinates to lists of object indices.
 * Cell size should be set to the largest neighbor radius the simulation queries.
 */
export class UniformGrid {
  private readonly cellSize: number;
  private readonly cells = new Map<string, number[]>();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  clear(): void {
    this.cells.clear();
  }

  insert(index: number, position: Vector3): void {
    const key = this.keyFor(position.x, position.y, position.z);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push(index);
  }

  forEachNeighbor(position: Vector3, fn: (index: number) => void): void {
    const cx = Math.floor(position.x / this.cellSize);
    const cy = Math.floor(position.y / this.cellSize);
    const cz = Math.floor(position.z / this.cellSize);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = this.cells.get(`${cx + dx},${cy + dy},${cz + dz}`);
          if (!bucket) continue;
          for (const i of bucket) fn(i);
        }
      }
    }
  }

  private keyFor(x: number, y: number, z: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)},${Math.floor(z / this.cellSize)}`;
  }
}
