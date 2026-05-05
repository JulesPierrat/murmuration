# Murmuration

[![License: GPL v3](https://img.shields.io/badge/license-GPL%20v3-blue.svg)](LICENSE)

Murmuration is an interactive WebGL interface that simulates flocks of birds (boids) moving in dynamic environments. The simulation reacts in real time to live audio (microphone) or MIDI input, and supports scene-based composition.

> **Project status: early stage.** The repository currently contains design documents only. The application is not yet implemented.

## Features (planned)

- **Boids simulation** — birds follow Reynolds-style alignment, cohesion and separation rules.
- **Scene-based composition** — each scene is a JSON file describing bird groups, environment, and an audio-to-parameter mapping. See [doc/dev/SCENE_STRUCTURE.md](doc/dev/SCENE_STRUCTURE.md).
- **Audio reactivity** — microphone input is analyzed live (band energy, onset, spectral centroid) and mapped to simulation parameters. See [doc/dev/SOUND_MANAGER.md](doc/dev/SOUND_MANAGER.md).
- **MIDI control** — note, velocity, and CC messages can drive parameters and trigger scene events.
- **Admin interface** — switch scenes, control inputs, and trigger events on the fly.

## Stack

| Concern                  | Choice                                              |
| ------------------------ | --------------------------------------------------- |
| Rendering                | WebGL (rendering framework: TBD)                    |
| Audio capture & analysis | Web Audio API + [Meyda](https://meyda.js.org/)      |
| MIDI input               | Web MIDI API + [WebMidi.js](https://webmidijs.org/) |

## Requirements

- A modern Chromium-based browser (Chrome, Edge): Web MIDI is not yet supported in Firefox or Safari.
- Microphone access permission (for audio reactivity).
- A USB or virtual MIDI device (optional, for MIDI control).

## Getting started

The project is pre-scaffolding; the commands below describe the intended workflow once the build is in place.

```sh
npm install
npm run dev
```

Then open the local dev URL printed in the console and grant microphone access when prompted.

## Documentation

All documentation lives under [doc/](doc/). Start with [doc/README.md](doc/README.md) for the index.

## License

Released under the [GNU General Public License v3.0](LICENSE).

## Author

Jules Pierrat — [github.com/JulesPierrat](https://github.com/JulesPierrat)
