# Enemies

Source: `src/data/monster/<area>-monsters.ts` — one array of 5 per area, in level order. The
last entry is the boss. `AreaTabs.vue` maps `(area, level)` to `monsters[level - firstLevel]`.

## Monster definition

```ts
{
  xp,                         // reward per kill
  image,                      // sprite path under public/enemies/<area>/
  spriteScale?, spriteGroundOffset?, spriteWallOffset?,  // sprite placement
  spriteOverflow?,            // may draw outside the battle card (Abyss + Angel only)
  xpOrbOffset?, xpOrbRadius?, // where XP orbs spawn
  combatant: { name, maxHp, weapon: { name, damage, hits?, cooldown }, skills: [...] }
}
```

Monsters use exactly the same combat rules and skill format as the player
([`02-combat.md`](./02-combat.md)). Effect order inside a skill matters (stagger timing).

## Enemy XP

Per area: four normals and a boss. Field's pattern is `18, 19, 20, 21, 25`; every next area is ×3.

| Area | N1 | N2 | N3 | N4 | Boss | Area ×multiplier |
| ---- | -: | -: | -: | -: | ---: | ---: |
| Field | 18 | 19 | 20 | 21 | 25 | ×1 |
| Forest | 54 | 57 | 60 | 63 | 75 | ×3 |
| Cave | 162 | 171 | 180 | 189 | 225 | ×9 |
| Wasteland | 486 | 513 | 540 | 567 | 675 | ×27 |
| Ruins | 1,458 | 1,539 | 1,620 | 1,701 | 2,025 | ×81 |
| Dungeon | 4,374 | 4,617 | 4,860 | 5,103 | 6,075 | ×243 |
| Hell | 13,122 | 13,851 | 14,580 | 15,309 | 18,225 | ×729 |
| Abyss | 39,366 | 41,553 | 43,740 | 45,927 | 54,675 | ×2187 |

Why: normals differ by only ~5%, so the best farming target is the one that best fits the
player's build, not simply the highest level. Bosses give ~19% more than Normal 4 but are much
harder — they are walls, not farms. The next area's normals pay >2× the previous boss, so moving
forward is always worth it.

## Area design

Each area is a set of mechanical puzzles. Normals 1–4 each lean on one mechanic (DEF, AGI, Curse,
Stun, multi-hit, Bleed, Invincible, heal) so different builds/weapons farm different enemies best.
The boss combines pressure.

Notation: `dmg / cd` = basic attack; `a×b` = hits × damage; **SR** = starts ready;
**ID** = initial delay.

### Field (1–5)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 1 | Slime | 18 | 21 | 2 / 3.0s | — |
| 2 | Giant Rat | 19 | 22 | 1 / 1.5s | Bite: 3 dmg, 7s |
| 3 | Wild Boar | 20 | 24 | 4 / 4.0s | Charge: 7 dmg, 10s |
| 4 | Goblin | 21 | 17 | 3 / 3.0s | Block: +4 DEF, 12s, SR |
| 5 | **Wolf** | 25 | 42 | 3 / 2.0s | Rend: Bleed 2/s ×4s, 9s |

### Forest (6–10)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 6 | Brambleling | 54 | 29 | 2 / 2.5s | Bark Shell: +3 DEF, 2s, SR |
| 7 | Sporecap | 57 | 41 | 2 / 2.2s | Spore Cloud: Curse 50% for 5s, 8s |
| 8 | Snapvine | 60 | 43 | 2 / 2.0s | Crush: Stun 1s + 16 dmg, 5s |
| 9 | Moss Boar | 63 | 72 | 5 / 3.0s | Trample: 10 dmg, 9s |
| 10 | **Thorn Dryad** | 75 | 102 | 8 / 2.0s | Entangling Roots: +2 AGI, Stun 1s, 14 dmg, 9s |

### Cave (11–15)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 11 | Cave Bat | 162 | 91 | 2 / 1.2s | Evasive Flight: +2 AGI, 8s |
| 12 | Stone Tortoise | 171 | 105 | 4 / 3.0s | Stone Shell: +8 DEF, 5s, SR |
| 13 | Cave Scorpion | 180 | 119 | 4 / 2.0s | Venomous Sting: 12 dmg + Curse 60% 6s, 8s |
| 14 | Cave Mantis | 189 | 133 | 2×2 / 1.8s | Flurry: 3×4 dmg, 6.5s |
| 15 | **Stone Golem** | 225 | 217 | 17 / 3.5s | Heavy Slam: Stun 1.8s + 38 dmg, 9s |

### Wasteland (16–20)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 16 | Frilled Lizard | 486 | 176 | 4 / 1.5s | Frilled Rush: +1 AGI + 8 dmg, 5s, SR |
| 17 | Raptor | 513 | 200 | 2×4 / 2.0s | Frenzy: 4×4 dmg, 7s |
| 18 | Ankylosaur | 540 | 232 | 8 / 3.0s | Harden: +14 DEF, 6s, SR · Spiked Tail: 16 dmg + Bleed 4/s 4s, 9s |
| 19 | Sauropod | 567 | 352 | 14 / 4.0s | Stomp: Stun 1.8s + 34 dmg, 10s |
| 20 | **Wyvern** | 675 | 448 | 11 / 2.5s | Take Flight: +2 AGI, 9s · Dive: 38 dmg, 10s · Fire Breath: Bleed 4/s 4s, 12s |

### Ruins (21–25)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 21 | Animated Armor | 1,458 | 306 | 10 / 2.5s | Reinforce: +18 DEF, 6s, SR |
| 22 | Gargoyle | 1,539 | 333 | 10 / 2.4s | Stone Swoop: +2 AGI + 24 dmg, 8s |
| 23 | Ancient Sentinel | 1,620 | 378 | 11 / 4.0s | Crushing Blow: Stun 1.8s + 46 dmg, 10s |
| 24 | Wraith | 1,701 | 315 | 9 / 2.2s | Ethereal Assault: Invincible 3s + Bleed 7/s 4s, 7s |
| 25 | **Ruined Colossus** | 2,025 | 774 | 27 / 4.0s | Stone Bulwark: +10 DEF, 9s, SR · Ruinous Slam: Stun 2s + 66 dmg, 12s |

### Dungeon (26–30)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 26 | Warrior | 4,374 | 460 | 15 / 2.8s | Shield Wall: +20 DEF, 7s, SR |
| 27 | Mage | 4,617 | 420 | 16 / 3.5s | Arcane Veil: Invincible 3.5s, 8s · Arcane Blast: 55 dmg, 9s |
| 28 | Barbarian | 4,860 | 640 | 22 / 4.0s | Skull Crusher: 70 dmg + Stun 2s, 10s |
| 29 | Rogue | 5,103 | 480 | 3×5 / 2.4s | Vanish: +2 AGI, 7s, SR · Eviscerate: 4×5 dmg + Bleed 5/s 4s, 10s |
| 30 | **Dragon** | 6,075 | 1,200 | 45 / 3.5s | Tail Swipe: 100 dmg, 10s · Fire Breath: Bleed 13/s 4s, 12s |

### Hell (31–35) — two bosses

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 31 | Leukocyte | 13,122 | 792 | 22 / 2.8s | Cellular Renewal: heal 44 over 4s, 12s |
| 32 | Abomination | 13,851 | 858 | 3×7 / 2.4s | Many-Armed Flurry: 6×7 dmg, 8s |
| 33 | Watcher | 14,580 | 792 | 20 / 2.8s | Unblinking Vigil: +2 AGI, 8s, SR · Phase Out: Invincible 2.5s, 13s |
| 34 | **Wall of Flesh** (mini-boss) | 15,309 | 1,870 | 35 / 2.5s | Flesh Barrage: 5×12 dmg, 8s · Festering Curse: Bleed 13/s 4s + Curse 75% 10s, 12s |
| 35 | **Angel** | 18,225 | 880 | 68 / 3.0s | Scripted 18s cycle (below) |

Angel uses `initialDelay` to sequence a combo, all on 18s cooldowns:
Sacred Halo (Invincible 5s) at 10s → Divine Restoration (heal 100) at 12s → Divine Judgment
(240 dmg + Stun 2s) at 15s, then every 18s.

### Abyss (36–40)

| Lv | Enemy | XP | HP | Attack | Skills |
| -: | ----- | -: | -: | ------ | ------ |
| 36 | Last Guardian | 39,366 | 1,200 | 31 / 2.8s | Bastion of the End: +40 DEF, 15s, SR · Final Sentence: 250 dmg, 15s, ID 4.5s |
| 37 | Tentacle | 41,553 | 1,248 | 30 / 3.8s | Constricting Grasp: 80 dmg + Stun 2s, 10s |
| 38 | Abyssal Maw | 43,740 | 1,344 | 3×14 / 2.6s | Constricting Grasp: 95 dmg + Stun 2s, 10s · Gnashing Teeth: 5×11, 8s · Ravenous Bite: 70 dmg + Bleed 10/s 4s, 11s |
| 39 | Abyssal Eye | 45,927 | 1,488 | 26 / 3.2s | Maw's three skills + Ruinous Gaze: 70 dmg, 14s · Phase Beyond: Invincible 3.5s, 15s |
| 40 | **Abyssal God** | 54,675 | 2,000 | 10 / 3.2s | Same five skills as the Eye, renamed (Grasp of the Abyss, Gnashing Eternity, Endless Hunger, Gaze of Extinction, Outside Reality) |

## Tutorial dummy (Level 0)

`tutorial-monster.ts`: Training Dummy, 20 HP, 0 damage, cooldown `Number.MAX_SAFE_INTEGER`
(never attacks), 0 XP.

## Adding an enemy/area

1. Add the monster to its area file (keep array order = level order, boss last).
2. Keep XP on the ×3 area curve.
3. Add sprites under `public/enemies/<area>/`.
4. Add/extend the area's balance scenario and spec (see [`07-balancing.md`](./07-balancing.md)).
5. A new area also needs: `areaNames` entry, `areaBackgrounds` entry, badge icon, monster list in
   `AreaTabs.vue`, and extended XP/HP/Power curves if the level cap moves.
