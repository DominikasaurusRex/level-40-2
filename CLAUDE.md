# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

**Level 40 2** (read "Level 42") is the sequel to **Level 40**, a small, finite, automatic idle RPG
in the browser (Vue 3 + TypeScript + Pinia + Vite, Vitest for tests, no backend).

The sequel **starts from the original Level 40 system** and then replaces systems one at a time.
The replacements are improvements the author noticed while developing Level 40. Treat every system
as one of two kinds:

- **Original**: carried over from Level 40 unchanged. Described in the original docs.
- **New**: redesigned for Level 40 2. Its design comes from the author, not from the original docs.

Do not assume an original system is still "how it should work". Something carried over may be
next in line for replacement. Do not invent replacements either. The author decides what changes
and how; ask when the intended new design is unclear.

## Current state

- The repository has documentation only. The original source code has **not been imported yet**,
  so the `src/...` paths the docs mention do not exist here yet.
- No systems have been redesigned yet.

Update this section as code arrives and systems get replaced.

## Documentation

`.documentation/level40-system-documentation/` describes the **original** Level 40. Start at its
`README.md`:

| File | Covers |
| ---- | ------ |
| `01-architecture.md` | Stack, folder layout, stores, data flow, code rules |
| `02-combat.md` | Combat engine, effects, statuses, timing, Focus Pulse |
| `03-progression.md` | Levels, XP, HP, Power, badges, unlocking |
| `04-weapons.md` | Weapon formula, tiers |
| `05-skills.md` | Skill tree and formulas |
| `06-enemies.md` | All 40 enemies + tutorial dummy |
| `07-balancing.md` | Pacing targets, simulator, balance reports |
| `08-saving.md` | Save format, autosave, import/export |
| `09-ui-and-presentation.md` | Screens, tutorials, cutscenes, animations, sound |

Rules for these docs:

- They are the **baseline record of Level 40**. Do not rewrite them to describe Level 40 2.
- When a system is redesigned, document the new version separately and note in it which original
  doc it supersedes.
- If code and docs disagree, the code wins (as in the original). Point out the mismatch.

## Original architecture principles

These hold until a redesign explicitly replaces them (details in `01-architecture.md`):

1. Player and monsters share one combatant model. The basic attack is a normal skill.
2. Static definitions are separate from runtime state. Never mutate objects imported from `src/data/`.
3. One combat engine (`advanceFight`) serves both the live game and the balance simulator. Hooks
   only report events and never change outcomes.
4. Tuning lives in data (`src/data/`), not in logic.
5. Persisted state is minimal. Everything derivable is rebuilt on load.
6. The UI is a CSS-scaled console. Position math uses `offsetLeft`/`offsetTop`, never
   `getBoundingClientRect()`. No popovers or teleports; choices expand inline.

## Commands (once the code is in)

```sh
npm install
npm run dev            # Vite dev server
npm run build          # vue-tsc type-check + vite build
npm run type-check
npm test               # Vitest (rule tests + balance smoke tests)
npm run balance:<area> # balance report: field, forest, cave, wasteland, ruins, dungeon, hell, abyss
```

There is intentionally no lint/format tooling.

## Working conventions

- Keep rule tests strict and balance tests broad (relationships, not exact numbers).
- Visuals are checked by hand. There is no browser automation.
- The `.idea/` directory is committed on purpose.
