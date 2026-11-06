# Level 40 2 — Enemies

The monster for each stage. Areas, bosses, and the story come from
`level40-2-story-progression.md`, which takes precedence. This document supersedes the original
roster in `level40-system-documentation/06-enemies.md`.

Only the stage order is decided so far. Stats, elements, damage-type and status responses, DEF/AGI
weaknesses, material drops, and skills are still to be designed. The original Level 40 values are
a reference only.

## Monster definition rules

Settled:

- **Weak to DEF / weak to AGI** is handwritten per monster. It is not derived from the attacks.
- **Skill descriptions** are handwritten per skill (for example "High damage Thunder attack"). They
  are not generated from the skill's effects.
- **Rewards:**
  - **XP** is a fixed amount per monster.
  - **Gold** is a range (minimum to maximum) per kill.
  - **Materials** each drop with a chance. The Library shows only which materials a monster *can*
    drop, never the chance.

- **Skills** use the effects, cleansing actions, and conditions defined in
  `level40-2-balance-progression.md`. A skill can wait in a ready state until its condition holds
  instead of firing exactly on cooldown.

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

### Skill changes decided so far

The other monsters' skills are not reworked yet.

| Monster | Skill | Level 40 2 version |
| --- | --- | --- |
| Sporecap | Spore Cloud | Applies **Poison** (was the old healing-reduction Curse). |
| Stone Tortoise | Stone Shell | **Physical Barrier with full immunity** (was a DEF pool). |
| Ankylosaur | Spiked Tail | Damage plus **Poison** (was Bleed). |
| Ankylosaur | Harden | **Resisting Barrier** (×0.5) against **Fire, Ice, and Thunder** (was a DEF pool). Covering all three elements may prove too strong this early; revisit in balancing. |

Values, durations, and cooldowns are balancing work.

### Stages 11–42

Not decided yet. See `level40-2-story-progression.md` for the area direction of each stage range.
