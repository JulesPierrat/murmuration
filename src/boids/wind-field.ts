import type { Vector3 } from 'three';
import { createNoise4D, type NoiseFunction4D } from 'simplex-noise';

export interface WindOptions {
  /** Output magnitude multiplier. */
  strength: number;
  /** Spatial frequency: higher = smaller wavelength, more turbulent. */
  scale: number;
  /** How fast the field reshapes over time. */
  drift: number;
}

/**
 * 3D vector field driven by three independent 4D Simplex noise functions
 * (one per output axis). The 4th dimension is time, so the field smoothly
 * morphs without seams or repetition.
 */
export class WindField {
  options: WindOptions;
  private readonly noiseX: NoiseFunction4D;
  private readonly noiseY: NoiseFunction4D;
  private readonly noiseZ: NoiseFunction4D;
  private time = 0;

  constructor(options: WindOptions) {
    this.options = options;
    this.noiseX = createNoise4D();
    this.noiseY = createNoise4D();
    this.noiseZ = createNoise4D();
  }

  advance(dt: number): void {
    this.time += dt;
  }

  sample(position: Vector3, out: Vector3): Vector3 {
    const { scale, drift, strength } = this.options;
    const x = position.x * scale;
    const y = position.y * scale;
    const z = position.z * scale;
    const t = this.time * drift;
    out.set(
      this.noiseX(x, y, z, t) * strength,
      this.noiseY(x, y, z, t) * strength,
      this.noiseZ(x, y, z, t) * strength,
    );
    return out;
  }
}
