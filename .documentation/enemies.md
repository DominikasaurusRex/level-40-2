# Level 40 2 — Enemies

The monster for each stage. Areas, bosses, and the story come from
`level40-2-story-progression.md`, which takes precedence. This document supersedes the original
roster in `level40-system-documentation/06-enemies.md`.

Only the stage order is decided so far. Stats, elements, damage-type and status responses, DEF/AGI
weaknesses, material drops, and skills are still to be designed. The original Level 40 values are
a reference only.

## Stage order

Sprites live in `public/enemies/<area>/`. Monster data lives in `src/data/monster/<area>-monsters.ts`
(`forest-monsters.ts` for stages 1–5, `cave-monsters.ts` for stages 6–10), still with the original
Level 40 stats.

### Stages 1–5: Field + Forest

| Stage | Monster | Sprite | Original Level 40 source |
| ---: | --- | --- | --- |
| 1 | Slime | `forest/slime.webp` | Field, level 1 |
| 2 | Wild Boar | `forest/wild-boar.webp` | Field, level 3 |
| 3 | Moss Boar | `forest/moss-boar.webp` | Forest, level 9 |
| 4 | Sporecap | `forest/sporecap.webp` | Forest, level 7 |
| 5 | Thorn Dryad | `forest/thorn-dryad.webp` | Forest, level 10 (boss) |

### Stages 6–10: Cave

| Stage | Monster | Sprite | Original Level 40 source |
| ---: | --- | --- | --- |
| 6 | Cave Bat | `cave/cave-bat.webp` | Cave, level 11 |
| 7 | Stone Tortoise | `cave/stone-tortoise.webp` | Cave, level 12 |
| 8 | Ankylosaur | `cave/ankylosaur.webp` | Wasteland, level 18 |
| 9 | Cave Mantis | `cave/cave-mantis.webp` | Cave, level 14 |
| 10 | Sauropod | `cave/sauropod.webp` | Wasteland, level 19 |

### Stages 11–42

Not decided yet. See `level40-2-story-progression.md` for the area direction of each stage range.
