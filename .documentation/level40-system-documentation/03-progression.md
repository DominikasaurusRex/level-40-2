# Progression

## Areas and enemy levels

`src/data/areas.ts`: 8 areas × 5 levels. The 5th level of each area is its **boss**.

| Area | Levels | | Area | Levels |
| ---- | -----: |-| ---- | -----: |
| Field | 1–5 | | Ruins | 21–25 |
| Forest | 6–10 | | Dungeon | 26–30 |
| Cave | 11–15 | | Hell | 31–35 |
| Wasteland | 16–20 | | Abyss | 36–40 |

Level 0 is the tutorial (training dummy), outside all areas.

### Unlocking

- `highestUnlockedLevel` is the frontier (starts at 1, max 40).
- Killing the enemy **at** the frontier unlocks the next level. Farming older levels never unlocks.
- An area is visible once its first level is unlocked. Selecting an area jumps to its highest
  unlocked level. Any unlocked level can be selected at any time; switching always starts a fresh
  fight.
- The game is "complete" after beating Level 40; play continues normally afterward.

## Player level

Max level **30**. Each kill gives the enemy's `xp`. **At most one level-up per kill** — extra XP
stays in the bar and is used by later kills. At level 30 XP just accumulates.

### XP to next level (`data/player-xp-curve.ts`)

Eight plateaus, each ×3 the previous.

| Player levels | XP per level | Cumulative at end |
| ------------: | -----------: | ----------------: |
| 1–3 | 200 | 600 |
| 4–6 | 600 | 2,400 |
| 7–9 | 1,800 | 7,800 |
| 10–12 | 5,400 | 24,000 |
| 13–15 | 16,200 | 72,600 |
| 16–18 | 48,600 | 218,400 |
| 19–21 | 145,800 | 655,800 |
| 22–29 | 437,400 | 4,155,000 (level 30) |

### Max HP (`data/player-hp-curve.ts`)

Starts at 20; each level adds `newLevel × 2 + 4`.

| Lv | HP | Lv | HP | Lv | HP |
| -: | -: | -: | -: | -: | -: |
| 1 | 20 | 11 | 190 | 21 | 560 |
| 2 | 28 | 12 | 218 | 22 | 608 |
| 3 | 38 | 13 | 248 | 23 | 658 |
| 4 | 50 | 14 | 280 | 24 | 710 |
| 5 | 64 | 15 | 314 | 25 | 764 |
| 6 | 80 | 16 | 350 | 26 | 820 |
| 7 | 98 | 17 | 388 | 27 | 878 |
| 8 | 118 | 18 | 428 | 28 | 938 |
| 9 | 140 | 19 | 470 | 29 | 1,000 |
| 10 | 164 | 20 | 514 | 30 | 1,064 |

A level-up adds only the HP gained to current HP (no full heal mid-fight).

## Power

**Power** is the one shared offense/support stat. Weapon damage and every skill scale from it.

```text
Power = powerForPlayerLevel(level) + 2 × earnedBadges
```

Level Power (`data/player-power-curve.ts`) steps +1 every three levels:

| Levels | 1–3 | 4–6 | 7–9 | 10–12 | 13–15 | 16–18 | 19–21 | 22–24 | 25–27 | 28–30 |
| ------ | --: | --: | --: | ----: | ----: | ----: | ----: | ----: | ----: | ----: |
| Power  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |

## Boss badges

The **first** win against each area's boss awards that area's badge: **+2 Power**, permanently
and immediately (weapons and skills are rebuilt). Repeat wins give nothing. Eight badges = +16
Power. Badges are stored as explicit area names in the save. The game is balanced assuming every
earlier boss is beaten (0 badges entering Field … 7 entering Abyss).

A first boss win also shows the "Area Reclaimed" banner, and for Field, Dungeon, and Abyss a story
cutscene (see [`09-ui-and-presentation.md`](./09-ui-and-presentation.md)).

## What a level-up does

1. `level += 1`, set new max HP, add the HP difference.
2. Recompute Power. If Power changed or this level is a weapon-tier level, rebuild weapons and
   skills (re-equips the current weapon).
3. Queue a level-up dialog showing HP/Power change, any new weapons, and — on skill-choice levels —
   the skill tree.

Level-up dialogs are a **FIFO queue**: one shows at a time, the next appears after `accept`. A
skill-choice dialog cannot be accepted without a valid, available tree node.

**Skill choice levels:** 2, 3, 5, 8, 11, 16, 21, 25, 27, 30 (10 choices out of 18 nodes).
**Weapon tier levels:** 6, 13, 19, 24, 28.

## Expected pacing

| Area | Normal-farming benchmark level | Expected boss clear level | Badges on entry | Power at boss target |
| ---- | --: | --: | --: | --: |
| Field | 4 | 5 | 0 | 2 |
| Forest | 7 | 8 | 1 | 5 |
| Cave | 10 | 11 | 2 | 8 |
| Wasteland | 13 | 14 | 3 | 11 |
| Ruins | 16 | 17 | 4 | 14 |
| Dungeon | 19 | 20 | 5 | 17 |
| Hell (Wall of Flesh, Lv 34) | 22 | 22 | 6 | 20 |
| Hell (Angel, Lv 35) | 22 | 23 | 6 | 20 |
| Abyss | 25 | 26 | 7 | 23 |

Target: a good build finishes in ~2h, a normal build around player level 26, a poor build
reaches level 30 within ~4h. Levels 27–30 are an overleveling safety net.

## Tutorial (Level 0)

A new game starts at Level 0 against the Training Dummy (20 HP, never attacks, 0 XP). Only
level 1 is unlocked. `completeTutorial()` moves to Field Level 1 once. Tutorial wins never
change progression. A second, separate "level-up tutorial" runs at the first skill choice
(level 2) — details in [`09-ui-and-presentation.md`](./09-ui-and-presentation.md).
