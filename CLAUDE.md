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

- The original Level 40 source code is imported **unchanged** in `src/` and `public/`. It still
  plays as Level 40: 8 areas (Field → Abyss), level-ups, Shield-style DEF, Bleed, and so on.
- The Level 40 2 redesign is **documented but not implemented** (see the Level 40 2 design docs
  below). No code has been changed for it yet.
- Until a system is implemented, the code follows the original docs, and the Level 40 2 docs
  describe the target.

Update this section as systems get replaced in code.

## Documentation

### Level 40 2 design (the target)

Working design docs in `.documentation/`. They describe the sequel, not the original:

| File | Covers |
| ---- | ------ |
| `level40-2-design-doc.md` | Overview: run loop, combat continuity, weapons, damage types, active play, skill board, stage skipping, resources, Town |
| `level40-2-story-progression.md` | Premise, areas and bosses for stages 1–42, monster reuse, elemental planning, endings |
| `level40-2-balance-progression.md` | Skill board structure, weapon damage structure, the status roster, damage resolution order |
| `town.md` | Town facility repairs, upgrades, Gate resource protection, and facility progression |

Rules for these docs:

- Where they overlap, the **story doc wins** on areas, bosses, and the story. The design doc is the
  overview; the other two hold the details.
- They separate settled decisions from open ones. Do not fill open questions with invented content.
- Numerical balancing is deliberately deferred to implementation. The original game's numbers are a
  reference, not values to keep.

### Original Level 40 (the baseline)

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

These hold until a redesign explicitly replaces them (details in `01-architecture.md`). The Level 40 2
design keeps the engine-level principles but replaces much of the gameplay they serve (for example,
no level-ups, combat state carries between fights):

1. Player and monsters share one combatant model. The basic attack is a normal skill.
2. Static definitions are separate from runtime state. Never mutate objects imported from `src/data/`.
3. One combat engine (`advanceFight`) serves both the live game and the balance simulator. Hooks
   only report events and never change outcomes.
4. Tuning lives in data (`src/data/`), not in logic.
5. Persisted state is minimal. Everything derivable is rebuilt on load.
6. The UI is a CSS-scaled console. Position math uses `offsetLeft`/`offsetTop`, never
   `getBoundingClientRect()`. No popovers or teleports; choices expand inline.

## Commands

```sh
npm install
npm run dev            # Vite dev server
npm run build          # vue-tsc type-check + vite build
npm run preview        # serve the built app
npm run type-check
npm test               # Vitest (rule tests + balance smoke tests)
npm run test:watch
npm run balance:<area> # balance report for an original area: field, forest, cave, wasteland, ruins, dungeon, hell, abyss
```

There is intentionally no lint/format tooling.

## Working conventions

- Keep rule tests strict and balance tests broad (relationships, not exact numbers).
- Visuals are checked by hand. There is no browser automation.
- The `.idea/` directory is committed on purpose.
- **Do not fix original Level 40 specs** that break because of Level 40 2 changes. They will be
  thrown away (see `.documentation/cleaning.md`). Report which ones break in one line and move on,
  even when the failure is a type error in a spec file.
- **Save fields are required.** New state in the save snapshot (`GameSnapshot` in
  `src/stores/game.ts`) is a required field. `restoreSnapshot` rejects saves that lack it or hold
  invalid values. No optional fields with fallbacks for older saves.
- **Use enums for fixed sets of ids** (places, resources, ...), validated with
  `Object.values(Enum).includes(x)`. No string-literal unions with hand-written `value is X` type
  guards, even though the original code uses that pattern.
- **Never disable or hide UI because a feature is not built yet.** The game is under active
  development. Leave the control usable (doing nothing for now) and gate only on real game rules,
  such as a place still being broken.
- **Edit files only with the editor tools**, never through shell commands (regex replace with
  `Set-Content`, .NET file writes, sed, and similar). The shell is for npm scripts and read-only
  checks.
- Never `cd` in shell commands, and never search outside the repository.

## Git

The author handles git. Never commit, push, create or switch branches, use worktrees, or stash, and
never offer to commit. Other writing git commands (such as `git add`) only when asked. Read-only
git is fine but keep it to a minimum.
