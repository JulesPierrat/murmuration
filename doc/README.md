# Documentation

Index of all documentation for the Murmuration project.

## Layout

| Folder                 | Purpose                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [dev/](dev/)           | Design and specification documents for the application itself. Authoritative for how the project is intended to work.          |
| [research/](research/) | External references and source material consulted while designing the project (papers, archived web pages). Not authoritative. |

## Documents

### dev/

| Document                                     | Description                                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| [IMPLANTATION.md](dev/IMPLANTATION.md)       | Phased implementation plan, from scaffolding to public release.                     |
| [SCENE_STRUCTURE.md](dev/SCENE_STRUCTURE.md) | Scene JSON file format — bird groups, environment, audio mapping, events.           |
| [scene.schema.json](dev/scene.schema.json)   | JSON Schema for scene files (machine-readable counterpart of `SCENE_STRUCTURE.md`). |
| [SOUND_MANAGER.md](dev/SOUND_MANAGER.md)     | Audio and MIDI input subsystem — capture, feature extraction, smoothing, mapping.   |

### research/

| Document               | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| [research/](research/) | See [research/README.md](research/README.md) for the list of external sources. |

## Document conventions

- Every design document carries a YAML front matter with `status` (`proposal`, `accepted`, `superseded`) and `last-updated` (ISO date).
- Documents in `dev/` describe intended behavior. Until a doc is marked `accepted`, the implementation is free to diverge from it.
- Cross-references between docs use relative Markdown links so they resolve in any browser or Markdown viewer.
