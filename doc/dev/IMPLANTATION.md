---
status: proposal
last-updated: 2026-05-05
---

# Implementation Plan

This document breaks the Murmuration project down into sequential phases, each with concrete tasks. The order reflects dependencies: every phase produces something runnable that the next phase builds on.

> **Note on the filename.** The accepted English spelling is "implementation"; the file is named `IMPLANTATION.md` to match the convention used elsewhere in the project.

## Milestones at a glance

| Phase                              | Goal                 | Outcome                                                |
| ---------------------------------- | -------------------- | ------------------------------------------------------ |
| [0](#phase-0--project-scaffolding) | Project scaffolding  | `npm run dev` opens an empty WebGL canvas.             |
| [1](#phase-1--boids-core)          | Boids core           | A flock of placeholder boids flies in 3D, no audio.    |
| [2](#phase-2--scene-system)        | Scene system         | Scenes load from JSON; switching between scenes works. |
| [3](#phase-3--sound-manager)       | Sound Manager        | Microphone and MIDI drive simulation parameters.       |
| [4](#phase-4--admin-interface)     | Admin interface      | Scene switching and event triggers from a UI.          |
| [5](#phase-5--polish--performance) | Polish & performance | GLB models, transitions, 60 fps at target boid count.  |
| [6](#phase-6--distribution)        | Distribution         | Public build, demo scenes, finalized docs.             |

---

## Phase 0 — Project scaffolding

**Objective.** Lay the technical foundation so subsequent work can focus on features.

**Tasks.**

- [ ] Decide the rendering framework. Default proposal: **Three.js** (mature, instanced rendering, good 3D ergonomics). Document the choice in a short ADR if a different framework is picked.
- [ ] Initialize the project: Vite + TypeScript.
- [ ] Add ESLint, Prettier, `tsconfig.json` strict mode.
- [ ] Set up the folder layout:
  - `src/` — application code
  - `src/render/` — Three.js scene, camera, instanced rendering
  - `src/boids/` — simulation logic
  - `src/scene/` — JSON loading, scene lifecycle
  - `src/sound/` — Sound Manager (audio + MIDI)
  - `src/admin/` — admin UI
  - `public/scenes/` — scene JSON files
  - `public/assets/` — models, textures
- [ ] Basic `index.html`, CSS reset, full-window canvas.
- [ ] Add `.gitignore`, `.editorconfig`.
- [ ] Add a `CONTRIBUTING.md` stub (commit style, branch naming).
- [ ] CI: lint + typecheck on PR (GitHub Actions).

**Definition of done.** `npm install && npm run dev` opens a black WebGL canvas with a debug FPS counter; CI is green.

---

## Phase 1 — Boids core

**Objective.** A standalone, hard-coded 3D flock that runs without any scene system or audio.

**Tasks.**

- [ ] Define the `Boid` data structure (position, velocity, group id).
- [ ] Implement the three Reynolds rules in 3D: alignment, cohesion, separation.
- [ ] Add boundary handling (soft turn-around at the edges of a configurable bounding box).
- [ ] Spatial index for neighbor queries — start with a uniform grid; revisit if too slow.
- [ ] Fixed-timestep simulation loop, decoupled from the render loop.
- [ ] Render boids as instanced meshes (cones or arrows) oriented along velocity.
- [ ] Add an `OrbitControls` debug camera so you can inspect the flock from any angle.
- [ ] Integrate `lil-gui` (or equivalent) for live tweaking of the three weights and `speed`.
- [ ] Smoke test: 500 boids at 60 fps.

**Definition of done.** A flock of ~500 boids exhibits visibly emergent behavior; weights can be tweaked live; no JSON, no audio.

---

## Phase 2 — Scene system

**Objective.** Move all hard-coded values into scene JSON files validated by [scene.schema.json](scene.schema.json).

**Tasks.**

- [ ] Add a JSON Schema validator (Ajv 2020).
- [ ] `SceneLoader`: fetch a scene file, validate, return a typed object.
- [ ] `SceneManager`: holds the active scene, exposes a `switchTo(scene)` method.
- [ ] Apply scene `background` (color and/or image plane / skybox).
- [ ] Build boid groups from the `boids` array (count, color, behavior weights).
- [ ] Build environment: instantiate `obstacles` (start with primitive geometry per `type`), apply `lights`.
- [ ] Wire `events` to scene-level handlers. For now, only `adminClick` triggers from a debug button.
- [ ] Implement scene transition (cross-fade or simple cut for v1).
- [ ] Author two demo scenes (`public/scenes/calm.json`, `public/scenes/storm.json`) to exercise the format.
- [ ] Validate scenes against the schema in CI.

**Definition of done.** The app boots into a default scene; switching to another scene at runtime rebuilds the flock and environment without reloading the page.

---

## Phase 3 — Sound Manager

**Objective.** Implement the Sound Manager as specified in [SOUND_MANAGER.md](SOUND_MANAGER.md), and connect it to the scene's `audioMapping`.

**Tasks.**

- [ ] **Input layer.** Acquire microphone via `getUserMedia`, manage `AudioContext` lifecycle, handle permission denial and tab suspension.
- [ ] **Analysis layer (audio).** Integrate Meyda. Extract: `rms`, `bassEnergy`, `midEnergy`, `highEnergy`, `spectralCentroid`, `onset`.
- [ ] **Analysis layer (MIDI).** Integrate WebMidi.js. Expose `midi.noteOn`, `midi.noteOff`, `midi.velocity`, `midi.cc.<id>`.
- [ ] **Smoothing layer.** Exponential moving average per feature, configurable `alpha`.
- [ ] **Mapping layer.** Read the active scene's `audioMapping`; translate features to simulation parameters and event triggers.
- [ ] **Fallback.** Deterministic noise generator when no input is available; on by default in dev.
- [ ] **Silence detection.** Boolean event when `rms` stays below threshold for N ms.
- [ ] Performance check: full pipeline < 50 ms input-to-render.
- [ ] Per-feature debug overlay (toggleable) showing raw + smoothed values.

**Definition of done.** Speaking into the microphone visibly affects the flock as defined by the active scene's `audioMapping`; a MIDI knob mapped to `boids.speed` works end-to-end.

---

## Phase 4 — Admin interface

**Objective.** Replace debug `lil-gui` panels with a proper admin UI for live operation.

**Tasks.**

- [ ] Pick a UI library (proposal: a small in-app React island, or keep vanilla — decide based on Phase 0 stack).
- [ ] Scene switcher: dropdown listing scenes from `public/scenes/`.
- [ ] Input controls: mic on/off, MIDI device picker, fallback toggle.
- [ ] Event panel: button per scene event, with `target` selector for events that take one.
- [ ] Live parameter inspector: read-only view of current boid behavior values per group.
- [ ] Mapping inspector: shows the current `audioMapping`, with live feature values next to each entry.
- [ ] Keyboard shortcuts for scene switching (1–9).
- [ ] Hide-by-default; toggle with a key (e.g. `~`) so it doesn't pollute the immersive view.

**Definition of done.** A non-developer operator can run a session — pick scenes, route inputs, trigger events — without touching the code or the URL.

---

## Phase 5 — Polish & performance

**Objective.** Make Murmuration look and feel like a finished installation.

**Tasks.**

- [ ] Replace placeholder geometry with GLB bird models. Confirm instanced rendering still works (likely needs `InstancedMesh` per material/geometry).
- [ ] Smooth scene transitions: cross-fade boid populations (spawn new, retire old over a few seconds).
- [ ] Camera presets per scene (position, target, FOV); optional slow auto-orbit.
- [ ] Post-processing pass (bloom, vignette) where it serves the scene.
- [ ] Profiling: identify the bottleneck (CPU simulation vs draw calls vs GC). Target: **2,000 boids @ 60 fps** on a recent laptop.
- [ ] If CPU-bound at target count, move boid update to a Web Worker. If still bound, evaluate GPU compute (transform feedback or WebGPU compute) — own ADR before doing this.
- [ ] Memory check: scene switching must not leak Three.js resources (geometries, materials, textures).
- [ ] Audio robustness: handle device change mid-session (mic unplugged, MIDI controller swapped).

**Definition of done.** Two-thousand boids at 60 fps with full audio reactivity, three or more polished scenes, no leaks across an hour of scene switching.

---

## Phase 6 — Distribution

**Objective.** Make the project usable by someone other than the author.

**Tasks.**

- [ ] Production build pipeline (`npm run build`), output verified.
- [ ] Static hosting target: GitHub Pages or Netlify; document the deploy.
- [ ] Author 4–6 demo scenes that span the feature surface.
- [ ] User-facing tutorial: how to write a new scene.
- [ ] Update [README.md](../../README.md): remove the "early stage" banner, add screenshots / GIF, update the "Getting started" section now that the scaffolding is real.
- [ ] Mark all `proposal` documents as `accepted` once they match the implementation.
- [ ] Add a `CHANGELOG.md`.
- [ ] Tag `v0.1.0`.

**Definition of done.** The project is publicly accessible, a stranger can read the docs and write a working scene, and there is a tagged release.

---

## Cross-cutting concerns

These aren't phases of their own — they apply throughout.

- **Tests.** Unit tests on the boids math (Phase 1), scene validation (Phase 2), feature smoothing (Phase 3). Integration tests are likely overkill for a creative tool; rely on visual demos in CI instead.
- **Performance budget.** Reassess after every phase; don't wait for Phase 5 to discover a regression.
- **Documentation.** Every phase updates the relevant doc in `doc/dev/`. A phase isn't done until the docs reflect what was built.
- **ADRs.** Use a lightweight ADR (`doc/dev/adr/NNNN-title.md`) for any decision that's expensive to reverse: rendering framework, GPU boids, UI framework, deploy target.

## Open questions

- Is there a target installation environment (kiosk, browser version, screen resolution) that should constrain the budget?
- Do we need recording / replay (capture a session as video or as a feature timeline) before Phase 6?
- Should scenes support timed sequences ("after 30 s, transition to scene B") or stay strictly input-driven?
