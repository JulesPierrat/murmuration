---
status: proposal
last-updated: 2026-05-05
---

# Scene JSON Structure

This document describes the structure of a scene JSON file used in the Murmuration project. Each scene defines the environment, the bird groups (boids), the audio-to-parameter mapping, and possible events or triggers.

> **Status: proposal.** No implementation consumes this format yet. Field names and types may change as the renderer and Sound Manager land. The machine-readable counterpart of this document is [scene.schema.json](scene.schema.json).

## Example

```json
{
  "version": 1,
  "name": "Evening Flock",
  "background": {
    "color": "#223344",
    "image": "backgrounds/sunset.jpg"
  },
  "boids": [
    {
      "groupName": "mainFlock",
      "count": 120,
      "model": "bird1.glb",
      "color": "#ffffff",
      "behavior": {
        "alignment": 1.0,
        "cohesion": 0.8,
        "separation": 1.2,
        "speed": 2.5
      },
      "soundReactive": true
    }
  ],
  "environment": {
    "obstacles": [
      { "type": "tree", "position": [10, 0, -5], "size": 2 },
      { "type": "rock", "position": [-3, 0, 7], "size": 1 }
    ],
    "lights": [{ "type": "directional", "direction": [1, -1, 0], "intensity": 0.8 }]
  },
  "audioMapping": {
    "bassEnergy": { "target": "boids.speed", "min": 1.0, "max": 4.0 },
    "onset": { "target": "events.scatter" }
  },
  "events": [
    {
      "name": "scatter",
      "trigger": "adminClick",
      "action": "boidsScatter",
      "target": "mainFlock"
    }
  ]
}
```

## Structure Details

### Root Object

- `version` (integer, required): Schema version. Currently `1`.
- `name` (string, required): Scene name.
- `background` (object):
  - `color` (string, optional): Background color (hex or CSS).
  - `image` (string, optional): Path to background image.
- `boids` (array, required): List of bird groups.
- `environment` (object): Obstacles and lights.
- `audioMapping` (object, optional): Maps Sound Manager features to simulation parameters. See [SOUND_MANAGER.md](SOUND_MANAGER.md).
- `events` (array, optional): List of events or triggers for the scene.

### Boids (Bird Groups)

- `groupName` (string): Identifier for the group.
- `count` (integer): Number of birds in the group.
- `model` (string): Path to the 3D model used for birds.
- `color` (string): Color of the birds.
- `behavior` (object):
  - `alignment` (float): Alignment force.
  - `cohesion` (float): Cohesion force.
  - `separation` (float): Separation force.
  - `speed` (float): Base speed.
- `soundReactive` (boolean): If true, group reacts to sound input.

### Environment

- `obstacles` (array):
  - `type` (string): Type of obstacle (e.g., tree, rock).
  - `position` (array): `[x, y, z]` coordinates.
  - `size` (float): Size or scale of the obstacle.
- `lights` (array):
  - `type` (string): Light type (e.g., directional, point).
  - `direction` (array, optional): `[x, y, z]` direction for directional lights.
  - `intensity` (float): Light intensity.

### Audio Mapping

Each entry maps a feature name (from the Sound Manager) to a simulation parameter.

- Key: feature name (e.g. `bassEnergy`, `midi.cc1`, `onset`).
- `target` (string, required): Dotted path of the simulation parameter (e.g. `boids.speed`, `camera.zoom`) or scene event (e.g. `events.scatter`).
- `min`, `max` (number, optional): Output range for continuous features. The 0–1 feature value is linearly interpolated into `[min, max]`. Omitted for event features.

### Events

- `name` (string, required): Event name.
- `trigger` (string, required): How the event is triggered (e.g. `adminClick`, `soundPeak`).
- `action` (string, required): Action to perform (e.g. `boidsScatter`, `changeBackground`).
- `target` (string, optional): Target group or environment element.

## Open questions

- Coordinate system: 2D screen-space or full 3D? `position` is currently 3D — confirm once the renderer is chosen.
- `model` per group: feasible only with instanced rendering at the boid counts we expect. To revisit if we hit performance limits.
- Whether `groupName` should be renamed to `id` for consistency with `name` (scene-level) and standard JSON conventions.
