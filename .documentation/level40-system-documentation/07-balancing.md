# Balancing

How the game is tuned and how to validate it. All numbers live in `src/data/`; the tools live in
`src/combat/simulator.ts` and `src/balance/`.

## Goals

- **Pacing:** good build ≈ 2h to finish; normal build finishes around player level 26; poor build
  hits level 30 within ≈ 4h.
- **Every coherent build can progress.** Pure Attack, Guard, Heal, and hybrids must all be able to
  beat every enemy with *some* weapon, at most 2 levels over the benchmark.
- **Matchups over raw stats.** Within an area, the best farm target depends on build and weapon.
  No universal best target, no universal best weapon.
- **Bosses are walls.** Hard, but give only slightly more XP than normals.
- **Focus Pulse is excluded.** All tuning assumes passive combat; Focus is bonus leverage.

## Levers (what to edit)

| Lever | File |
| ----- | ---- |
| XP per player level | `data/player-xp-curve.ts` |
| Player max HP | `data/player-hp-curve.ts` |
| Power per level | `data/player-power-curve.ts` |
| Badge Power bonus (+2) | `BADGE_POWER_BONUS` in `stores/game.ts` **and** `balance/__tests__/helpers/player-power.ts` |
| Weapon formula, tiers | `data/weapons.ts` |
| Skill formulas, choice levels, tree | `data/skill-progression.ts` |
| Monster stats & XP | `data/monster/*.ts` |
| Focus Pulse duration | `data/focus.ts` |

## The XP math

- An area's 5 first kills pay `103 × multiplier`; its 3 player levels cost `600 × multiplier`
  → about **29 normal kills per area**. Farming is required; clearing once is not enough.
- One kill of all 40 enemies = 337,840 XP, only ~17% of the XP needed for level 25.
- The ×3 steps make old areas rapidly worthless to farm.
- Target fight length: roughly 20–30s average → ~80–120 min of combat for a full run.

Rule of thumb for the player: **farm the normal enemy in the newest unlocked area that best fits
your build.**

## Power assumptions

Balance assumes the player has every earlier boss badge: Power at a level =
`levelPower + 2 × (areaIndex)`. See the pacing table in [`03-progression.md`](./03-progression.md).
Badges are a big step (+2 ≈ six levels of base Power growth), so beating a boss is a real power
spike entering the next area.

## Simulator (`combat/simulator.ts`)

Fast-forwards the real `advanceFight()` in 100ms steps — no copied formulas.

- `simulateDuel(player, monster)` — one fresh fight, 5-minute timeout. Returns outcome, duration,
  final/minimum player HP, monster HP.
- `simulateFarm(player, monster, xp, durationMs)` — repeated fights. Kills keep player state;
  deaths reset both. Returns kills, deaths, average fight time, XP/minute.

It preserves every production rule: fresh fights start on cooldown, 370ms+ hit delays, player
acts before monster within a step, Invincible → AGI → DEF → HP, Bleed ignores DEF.

## Balance scenarios (`src/balance/<area>-scenarios.ts`)

Each area defines ~10 fixed builds (lists of owned skill ids that follow legal tree paths and
spend exactly the choices available at that level), crossed with all 3 weapons. A
`<area>PlayerDefinition(level, build, weapon)` helper builds the player at a given level with the
area's expected badge count (`EXPECTED_BADGES`: Field 0 … Abyss 7). Later areas add the
choices earned at higher levels (e.g. Abyss adds a level-25 and level-27 pick).

`scenario-builds.spec.ts` checks every build is a legal tree path at each level.

## Area reports (`npm run balance:<area>`)

Each prints (only in `--mode balance`):

1. **Farming matrix** — 5 simulated minutes for every build/weapon vs each of the 4 normals at
   the area's benchmark level. Cell: `91.2 XP/m | 10.8s/fight | 24K 3D`.
2. **Boss duels** at arrival and expected-clear levels. Cell: `WIN 27.4s / 11 HP`, `LOSS 26.4s`,
   or `TIMEOUT / 38 HP` (timeout = stalemate or broken scenario).

Benchmarks:

| Area | Farm level | Boss duel levels |
| ---- | --: | ---------------- |
| Field | 4 | 4, 5 |
| Forest | 7 | 7, 8 |
| Cave | 10 | 10, 11 |
| Wasteland | 13 | 13, 14 |
| Ruins | 16 | 16, 17 (+ checks around 19) |
| Dungeon | 19 | 19, 20 |
| Hell | 22 | Wall of Flesh 21/22, Angel 22/23 |
| Abyss | per-enemy | Guardian 23/24, Tentacle 24/25, Maw 25/26, Eye 26/27, God 27/28 |

The specs themselves only assert broad things (finite results, kills > 0, no timeouts) — exact
numbers are never snapshotted.

**Reading reports:** across a row = a build's best target; down a column = is one monster
over/under-tuned for everyone; across weapons = hard weapon counters. Don't retune a monster to
rescue one weak weapon — confirm a pattern across several enemies first.

## Mandatory progression contract (`mandatory-progression.spec.ts`)

For every area and every build: each enemy must be beaten by **some weapon** within the safety
window.

| Area | Normals: levels tried | Boss: levels tried |
| ---- | --: | --: |
| Field | 4–6 | 5–7 |
| Forest | 7–9 | 8–10 |
| Cave | 10–12 | 11–13 |
| Wasteland | 13–15 | 14–16 |
| Ruins | 16–18 | 17–19 |
| Dungeon | 19–21 | 20–22 |
| Hell | 22–24 (incl. Wall of Flesh) | Angel 23–25 |
| Abyss | 25–27 | 26–28 |

A zero-kill farming cell is not a failure by itself; failing this contract is.

## Deep-choice value (`capstone-value.spec.ts`)

Compares a build before/after one deep node in its intended matchup (Double Strike vs AGI,
Bleeding Strike vs durable target, Stunning Strike vs pressure, Offensive Care via overheal,
Cleanse vs Bleed/Curse) to make sure each pick is materially useful.

## Workflow

1. Edit numbers in `src/data/`.
2. `npm test` and `npm run type-check`.
3. `npm run balance:<area>` for each affected area; read the matrices.
4. Iterate. Keep assertions broad; put provisional numbers in reports, not tests.

## Common mistakes

- Testing a copied formula instead of the shared engine.
- Removing the icon-travel delays in simulation.
- Giving a test skill `startsReady` when the real one doesn't.
- Letting the player level up inside a fixed-power test.
- Using random skill sets instead of explicit, legal owned-id lists.
- Treating "zero deaths" or "highest XP/min" as automatically balanced — speed and safety are
  separate, and a single best target kills the matchup design.
- Snapshotting provisional report values.

## Current status

All eight areas are tuned and accepted. A few older per-area fixtures (Forest–Ruins baselines,
some arrival-level boss expectations, a Double Strike comparison) are known to be stale after
late weapon/skill number changes; they are not engine bugs.
