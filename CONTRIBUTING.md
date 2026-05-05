# Contributing

Thanks for considering a contribution to Murmuration. This project is in its early scaffolding phase, so the workflow below will tighten as the codebase grows.

## Development setup

Requirements: Node 18 LTS or later.

```sh
npm install
npm run dev
```

Useful scripts:

| Command                | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Vite dev server with HMR.                   |
| `npm run build`        | Type-check then produce a production build. |
| `npm run typecheck`    | Run `tsc` in no-emit mode.                  |
| `npm run lint`         | Run ESLint over the project.                |
| `npm run format`       | Apply Prettier.                             |
| `npm run format:check` | Check Prettier formatting (used in CI).     |

## Branch and commit conventions

- Branch from `main` using a short kebab-case name: `phase-1-boids`, `fix-resize-glitch`.
- Keep commits focused; prefer several small commits over one large one.
- Write commit subjects in the imperative mood, present tense: _"add boid neighbor query"_, not _"added"_ or _"adds"_.
- Reference the relevant phase from [doc/dev/IMPLANTATION.md](doc/dev/IMPLANTATION.md) when applicable.

## Pull requests

- Make sure `npm run lint`, `npm run typecheck`, and `npm run format:check` all pass locally.
- Update the relevant document under [doc/dev/](doc/dev/) when you change behavior described there.
- New scenes (`public/scenes/*.json`) must validate against [doc/dev/scene.schema.json](doc/dev/scene.schema.json).

## Code style

- TypeScript strict mode is on; do not loosen `tsconfig.json` to silence errors.
- Prefer `import type` for type-only imports (enforced by ESLint).
- Avoid premature abstractions; the project is small enough that direct code is easier to read than layers.
