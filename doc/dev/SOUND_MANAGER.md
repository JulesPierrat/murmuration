---
status: proposal
last-updated: 2026-05-05
---

# Sound Manager

The Sound Manager is the subsystem that turns live audio and MIDI input into normalized, smoothed signals that the boids and the scene can react to. It is the bridge between the physical input (microphone, MIDI controller) and the simulation parameters (speed, cohesion, separation, scene events).

This document specifies the intended architecture. It is a proposal: no implementation exists yet.

## Goals

- Capture microphone input and analyze it in real time.
- Capture MIDI input (notes, velocity, control change).
- Expose a small set of normalized features (0–1) that the rest of the application can consume without knowing anything about audio.
- Allow each scene to declare its own mapping from features to simulation parameters.
- Stay within a < 50 ms input-to-render latency budget on a recent laptop.

## Stack

| Layer                    | Choice                                                                       | Rationale                                                                          |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Audio capture & graph    | Web Audio API (`AudioContext`, `MediaStreamAudioSourceNode`, `AnalyserNode`) | Native, low latency, no dependency.                                                |
| Audio feature extraction | [Meyda](https://meyda.js.org/)                                               | 30+ features ready to use, plugs directly into Web Audio.                          |
| MIDI capture             | Web MIDI API + [WebMidi.js](https://webmidijs.org/)                          | Web MIDI API is verbose; WebMidi.js wraps device handling and event normalization. |

Tone.js is **not** used in v1. It is only relevant if we generate sound, which is out of scope.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Microphone  │────▶│ Web Audio    │────▶│ Meyda        │────▶│          │
└─────────────┘     │ AnalyserNode │     │ feature      │     │ Mapping  │     ┌──────────┐
                    └──────────────┘     │ extraction   │     │ Layer    │────▶│ Boids /  │
                                         └──────────────┘     │          │     │ Scene    │
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     │          │     └──────────┘
│ MIDI device │────▶│ WebMidi.js   │────▶│ Note / CC    │────▶│          │
└─────────────┘     └──────────────┘     │ normalizer   │     └──────────┘
                                         └──────────────┘
```

Four layers, kept strictly separate:

1. **Input layer** — opens devices, owns the `AudioContext`, recovers from disconnect.
2. **Analysis layer** — runs Meyda and the MIDI normalizer; emits raw features.
3. **Smoothing layer** — applies an exponential moving average per feature to remove jitter.
4. **Mapping layer** — translates smoothed features into simulation parameters according to the active scene's `audioMapping` block.

The boids and the renderer never call the audio API. They subscribe to the mapping layer's output.

## Features extracted (v1)

A short, opinionated list — adding more later is cheap, but starting wide makes the mapping layer unusable.

| Feature            | Source                                | Range         | Notes                |
| ------------------ | ------------------------------------- | ------------- | -------------------- |
| `rms`              | Meyda `rms`                           | 0–1           | Perceived volume.    |
| `bassEnergy`       | Meyda `loudness` band 0–2             | 0–1           | ~20–250 Hz.          |
| `midEnergy`        | Meyda `loudness` band 3–18            | 0–1           | ~250–4000 Hz.        |
| `highEnergy`       | Meyda `loudness` band 19–23           | 0–1           | ~4 kHz+.             |
| `spectralCentroid` | Meyda `spectralCentroid`              | 0–1           | Brightness.          |
| `onset`            | Meyda `energy` derivative + threshold | boolean event | Beat / transient.    |
| `silence`          | `rms` low for N ms                    | boolean event | Triggers dispersion. |

MIDI features are exposed flat: `midi.noteOn`, `midi.noteOff`, `midi.velocity`, `midi.cc.<id>`.

## Smoothing

Continuous features are smoothed with an exponential moving average:

```
smoothed = alpha * raw + (1 - alpha) * previous
```

`alpha` is configurable per feature; default 0.2. Event features (`onset`, `silence`, MIDI notes) are not smoothed.

## Mapping layer

Mappings live in the scene JSON, in an `audioMapping` block. This keeps them versioned with the scene and editable without code changes.

```json
{
  "audioMapping": {
    "bassEnergy": { "target": "boids.speed", "min": 1.0, "max": 4.0 },
    "midEnergy": { "target": "boids.cohesion", "min": 0.5, "max": 1.5 },
    "highEnergy": { "target": "boids.separation", "min": 0.8, "max": 2.0 },
    "midi.cc1": { "target": "camera.zoom", "min": 0.5, "max": 2.0 },
    "onset": { "target": "events.scatter" }
  }
}
```

`min` / `max` define the output range; the feature value (already 0–1) is linearly interpolated into it. Events do not use ranges — they trigger a scene event by name.

See [SCENE_STRUCTURE.md](SCENE_STRUCTURE.md) for the full scene schema.

## Latency budget

| Stage                     | Target                        |
| ------------------------- | ----------------------------- |
| AnalyserNode FFT          | ~5 ms (fftSize 1024 @ 48 kHz) |
| Meyda feature extraction  | < 10 ms                       |
| Smoothing + mapping       | < 1 ms                        |
| Render frame              | ~16 ms (60 fps)               |
| **Total input-to-render** | **< 50 ms**                   |

If the budget is exceeded, drop `fftSize` to 512 before reducing the feature list.

## Fallback

If the user denies microphone access, or no MIDI device is connected, the Sound Manager emits a deterministic noise signal so the scene still animates. This mode is also useful for offline demos and CI screenshots. It is on by default in development.

## Open questions

- Should `audioMapping` be inlined in each scene, or referenced from a shared library (`mappings/storm.json`) to allow reuse across scenes?
- How are MIDI control changes assigned to a specific device — by device name, by channel, or via a one-time pairing UI in the admin interface?
- Beat detection on speech vs. music: do we need a dedicated onset algorithm (e.g. spectral flux) or is the simple energy-derivative threshold enough?
