# Architecture

## Stack

Vue 3 (`<script setup>`, TypeScript) + Pinia + Vite. Vitest for tests. No router, no backend,
no game engine. The `@` import alias points to `src/`.

## Folder layout

```text
src/
  main.ts, App.vue          App bootstrap; App.vue scales the whole console to the viewport
  types/                    Shared shapes: combatant, effects, skill, weapon, player, monster
  combat/engine.ts          The combat rules. advanceFight() = one deterministic step
  combat/simulator.ts       Headless fast-forward (duels, farming) using the same engine
  stores/game.ts            Game state: player, progression, the one live fight, tick loop
  stores/save.ts            Persistence: localStorage, autosave, .sav import/export
  data/                     ALL tunable numbers (curves, weapons, skills, monsters, areas...)
  data/monster/             One file per area (+ tutorial dummy)
  balance/                  Fixed player builds per area for balance reports
  balance/__tests__/        Balance reports and progression contract tests
  components/               Vue UI
  audio/sounds.ts           Preloaded sound pool + persisted volume
  utils/skill-description.ts  Human-readable text generated from skill effects
public/                     Images, sprites, icons, audio (served as /path)
```

## Core principles

1. **Player and monsters use the same model.** Both are a `CombatantDefinition`
   (`name`, `maxHp`, `weapon`, `skills`). The basic attack is not special — it is a normal `Skill`
   derived from the weapon by `basicAttackSkill()` (id `basic-attack`). `Player` and `Monster`
   are thin wrappers that add progression data (level/xp/power) or presentation data (sprite, XP).

2. **Definitions vs. runtime state.** `CombatantDefinition` is static. `CombatantState` is the
   live copy: `hp`, `def`, `agiCharges`, `statuses[]`, pending hit queues, and `skills[]` each
   with its own `remaining` cooldown. `createCombatantState()` always makes fresh copies.
   **Never mutate anything imported from `src/data/`** — the same monster/skill object backs
   every encounter that uses it.

3. **One engine for game and simulation.** `advanceFight(player, foe, dt, hooks)` is the only
   place combat rules live. The live store and the balance simulator both call it. Hooks only
   *report* events to the UI; they never change outcomes.

4. **Data, not formulas, for tuning.** XP, HP, and Power curves are literal per-level tables.
   Monster stats are literals. Weapons and skills use small formulas whose coefficients live in
   `src/data/`. Rebalancing = editing numbers, not logic.

5. **Derived state is rebuilt, never hand-edited.** The player's persisted progression is tiny
   (level, xp, owned skill ids, badges, weapon slot). Power, max HP, weapons, and skills are
   recomputed from it (`skillsForPlayer()`, `resolveWeaponsForLevel()`). To add a skill effect, add
   a node id and teach the builder about it.

## Game store (`stores/game.ts`)

Owns everything: the `player`, active area/level, unlock frontier, badges, tutorial flags, Focus
state, the single live fight (`playerState`, `monster`, `monsterState`), battle phase, and UI
event queues.

- **One fight only.** Inactive areas do not simulate. Changing area/level abandons the current
  fight.
- **Tick loop:** `start()` runs `tick(100)` on a `setInterval`. Each tick: advance the
  "area reclaimed" banner timer → if in an intermission phase, count it down → if combat is held for
  a cutscene, stop → charge Focus → `advanceFight()` → handle win/loss.
- **`startFight(monster)`** resets *both* combatants (used on area/level change, tutorial exit,
  after cutscenes). **`respawnMonster()`** replaces only the monster (used after a win — player HP,
  DEF, AGI, statuses, and cooldowns carry over).
- **Battle phases:** `fighting` → `victory` (700ms) → `spawning` (300ms) → `fighting`, or
  `fighting` → `defeat` (900ms, then full reset) → `spawning` (300ms). Nothing ticks during
  intermissions (cooldowns and Focus freeze).
- **UI event queues** (`pendingPlayerAttacks`, `pendingPlayerBuffs`, `pendingPlayerAgiBuffs`,
  `pendingPlayerHeals`, `pendingBleedAttacks`, `pendingHotHeals`, `xpGainEvent`) are arrays/refs
  the UI drains to spawn flying-icon animations. They are queues because several skills can fire
  in the same tick.

## Save store (`stores/save.ts`)

Depends one-way on the game store: it pulls `createSnapshot()` and pushes into
`restoreSnapshot()`. The game store never touches storage. See [`08-saving.md`](./08-saving.md).

## UI composition

`App.vue` → `GameWindow.vue` (the orchestrator) which composes:

- `ConsoleShell` / `ConsoleScreen` — the handheld-console frame, volume buttons, menu, Home link.
- `StartScreen`, `CutsceneScreen`, `EndingScreen`, `MenuModal`, `CreditsModal`.
- `AreaTabs` — area/level selectors and the `BattleCard` (the fight scene). AreaTabs watches
  `activeArea`/`activeLevel` and calls `game.startFight(monster)` for the matching enemy.
- `PlayerTab` — XP bar, skill list (`SkillRow`), weapon picker (expands inline in the Basic
  Attack row), Focus clicks.
- `BadgeShelf` — earned boss badges.
- `LevelUpModal` → `SkillTreeModal` (+ `SkillTreeHelpModal`).
- `TutorialOverlay` — spotlight + dialogue for both tutorials.
- Animation layers: `XpOrbLayer`, and `FlyingIconLayer` ×4 (attack, DEF, AGI, heal).

Child components expose DOM refs via `defineExpose`; `GameWindow` watches the store's event queues
and flies icons between those refs.

**Scaling rule:** the whole console is CSS `transform: scale()`d to fit the viewport. Any position
math for animations must walk `offsetLeft`/`offsetTop`/`offsetParent`, never
`getBoundingClientRect()` (which returns post-transform pixels). Popovers/teleports are avoided
because the console is scaled and clipped — choices expand inline instead.

## Tests

- `src/combat/__tests__/engine.spec.ts` — stable combat rules.
- `src/data/__tests__/` — skill tree graph and formulas, weapon tier rules.
- `src/stores/__tests__/` — unlocking, intermissions, Focus, saves, skill choices.
- `src/balance/__tests__/` — balance reports and the progression contract
  (see [`07-balancing.md`](./07-balancing.md)).

Keep rule tests strict and balance tests broad (relationships, not exact numbers).
