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

- Most of the code is still the original Level 40 code: 8 areas (Field → Abyss), level-ups,
  Shield-style DEF, Bleed, and so on. Code with no future is parked in `src/legacy/` (see
  **Code layout**).
- Monster data holds only the ten monsters for stages 1–10 (`src/monsters/forest-monsters.ts`,
  `cave-monsters.ts`) in the Level 40 2 shape (`monsters/monster-definition.ts`,
  `combat/damage.ts`, `combat/skill-effect.ts`) with placeholder numbers. The original engine cannot
  run them.
- **Implemented for Level 40 2 so far:**
  - Console shell adjusted (wider screen, no SELECT, mobile mode; see `cleaning.md`).
  - Town: places as `PlaceId` (`src/town/town.ts`) with conditional backgrounds, `TownScreen.vue`,
    `PlaceScreen.vue`, NPC chats (`src/town/chats.ts`), and the Gate's `EmbarkConfirmation.vue`.
  - Resources: the six resources as `ResourceId` (`src/resources/resources.ts`) and
    `ResourceBar.vue`.
  - Save snapshot holds `rebuiltPlaces` and `resources`.
  - Screens: `GameWindow.vue` switches between Start, Town, and the new `battle/BattleScreen.vue`
    (a placeholder, reached by embarking at the Gate). The original battle view, tutorials,
    level-ups, and boss cutscenes are no longer wired in.
  - Enemy sprites for stages 1–10 in `public/enemies/forest/` and `public/enemies/cave/` (see
    `enemies.md`).
- Everything else follows the original docs until it is replaced; the Level 40 2 docs describe the
  target.

Update this section as systems get replaced in code.

## Code layout

`src/` is grouped **by domain**, not by file kind. A domain folder holds its components, data, and
types side by side, flat (file names tell them apart: `TownScreen.vue` next to `town.ts`). Tests sit
in a `__tests__` folder inside their domain. A domain that grows large gets subfolders per
feature (for example one per Town place modal), not per file kind.

| Folder | Holds |
| ------ | ----- |
| `src/` root | `main.ts`, `App.vue`, `GameWindow.vue` (entry and screen switching) |
| `console/` | Console shell: screen, D-pad, action buttons |
| `ui/` | Small shared UI pieces (`MenuButton`, `ModalCloseButton`) |
| `menu/` | Start screen, New Game, starting gift, in-game menu, credits |
| `town/` | Town screen, places, NPC chats, embark confirmation |
| `resources/` | Resource ids and the resource bar |
| `monsters/` | Monster definition type and the monster rosters |
| `battle/` | Battle view: battle card, player panel, combat animation layers |
| `story/` | Cutscenes, tutorials, ending |
| `combat/` | Engine, simulator, and the shared combat-core types (`damage.ts`, `skill-effect.ts`) |
| `audio/`, `balance/`, `stores/` | Sound, balance scenarios, global Pinia stores |
| `legacy/` | Original Level 40 code waiting to be deleted (see `cleaning.md`) |

Rules:

- New code goes into its domain folder. There are no `components/`, `data/`, `types/`, or `utils/`
  folders.
- Types live with the domain they describe; only types every domain shares go in `combat/`.
- Nothing new goes into `legacy/`, and new code should not depend on it. It shrinks until it can be
  deleted.
- Stores stay global in `stores/` for now. Whether a domain gets its own store is decided when one
  needs it.
- Future domains (weapons, skill board, ...) get their own folder.

## Parked for later

- **Rest of the architecture.** The folder layout above is settled. How the new types, engine,
  stores, and data fit together is still to be discussed once the combat and Town designs are done.
- **XP orb animation values** (`xpOrbOffset`, `xpOrbRadius` in the original monster data) were left
  out of the new monster shape. Decide whether and how they return when combat is reworked.

## Documentation

### Level 40 2 design (the target)

Working design docs in `.documentation/`. They describe the sequel, not the original:

| File | Covers |
| ---- | ------ |
| `level40-2-design-doc.md` | Overview: run loop, combat continuity, weapons, damage types, active play, skill board, stage skipping, resources, Town |
| `level40-2-story-progression.md` | Premise, areas and bosses for stages 1–42, monster reuse, elemental planning, endings |
| `level40-2-balance-progression.md` | Skill board structure, weapon damage structure, the status roster, damage resolution order |
| `weapons-and-empowerment.md` | Four weapon families, attack cadence, empowered states and techniques, status responses |
| `town.md` | Town facility repairs, upgrades, Gate resource protection, and facility progression |
| `town-repair-modal.md` | Inn's repair/upgrade modal: layout, cost display, Upgrade button |
| `library-modal.md` | Library monster manual: discovery rules, stats, responses, seen skills |
| `quest-board-modal.md` | Quest Board: stage list, four quests per monster, quest states |
| `bar-modal.md` | Bar Gold ↔ XP exchange interface |
| `enemies.md` | Monster per stage and its sprite (stages 1–10 decided so far) |
| `cleaning.md` | Plan for removing or reworking the original code |
| `credits.md` | Working credits and asset attribution list |

Terminology: **zone**, **stage**, and **level** are interchangeable and all mean one of the 42
fights (stage 1 = Slime). The player has no levels anymore, so "level" never refers to the player in
Level 40 2. **Area** is the group of stages (Field + Forest, Cave, ...).

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

1. ~~Player and monsters share one combatant model.~~ **Replaced in Level 40 2:** they share only a
   combat core (HP, Shield, DEF, AGI, statuses, damage and status responses, effects, damage
   resolution). How each one acts is separate: the player has three weapons with empowerment and
   three manually used active skills; a monster has one basic attack and up to three skills fired by
   cooldown and AI conditions (see `enemies.md`).
2. Static definitions are separate from runtime state. Never mutate imported static data (rosters,
   place lists, resource lists, ...).
3. One combat engine (`advanceFight`) serves both the live game and the balance simulator. Hooks
   only report events and never change outcomes.
4. Tuning lives in data files (in their domain folder since Level 40 2), not in logic.
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
