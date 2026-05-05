# Scene JSON Structure

This document describes the structure of a scene JSON file used in the Murmuration project. Each scene defines the environment, the bird groups (boids), and possible events or triggers.

## Example

```json
{
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
    "lights": [
      { "type": "directional", "direction": [1, -1, 0], "intensity": 0.8 }
    ]
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
- `name` (string): Scene name.
- `background` (object):
  - `color` (string, optional): Background color (hex or CSS).
  - `image` (string, optional): Path to background image.
- `boids` (array): List of bird groups.
- `environment` (object):
  - `obstacles` (array): List of obstacles (trees, rocks, etc.).
  - `lights` (array): Lighting setup for the scene.
- `events` (array): List of events or triggers for the scene.

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

### Events
- `name` (string): Event name.
- `trigger` (string): How the event is triggered (e.g., `adminClick`, `soundPeak`).
- `action` (string): Action to perform (e.g., `boidsScatter`, `changeBackground`).
- `target` (string, optional): Target group or environment element.

---

Adapt and extend this structure as needed for your project requirements.