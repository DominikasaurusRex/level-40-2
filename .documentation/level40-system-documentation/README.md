# Level 40 — System Documentation

This folder describes how **Level 40** works today: the game rules, the code architecture, and
the balancing system. It is written to be the starting point for **Level 40 2**.

All numbers here are the literal values the game uses (`src/data/*`). If code and these docs
disagree, the code wins.

## The game in one paragraph

A small, finite, automatic idle RPG in the browser. One hero fights one enemy at a time.
Combat runs by itself on a 100ms tick: every ability fires when its cooldown reaches zero. The
player's decisions are **which weapon to use**, **which skill to learn at level-ups**, **which
enemy to farm**, and optionally **Focus Pulse** clicks to speed up one ability. There are
**40 enemy levels** in **8 areas** of 5 enemies each; the 5th enemy of every area is its boss.
Beat Level 40 (the Abyssal God) and the game is complete. The player caps at level 30.

**Core loop:** Fight → gain XP → level up → occasionally choose a skill → get stronger →
unlock the next enemy → beat Level 40.

## Design rules (deliberately absent)

No prestige, no endless progression, no inventory, no loot or rarity, no crafting, no armor,
no mana/resources, no manual attacks, no currencies, no backend. Dying costs nothing — the fight
just restarts.

## Documents

| File | Covers |
| ---- | ------ |
| [`01-architecture.md`](./01-architecture.md) | Tech stack, folder layout, stores, data flow, code rules |
| [`02-combat.md`](./02-combat.md) | Combat engine: effects, statuses, damage order, timing, Focus Pulse |
| [`03-progression.md`](./03-progression.md) | Levels, XP, HP, Power, badges, unlocking, level-up flow |
| [`04-weapons.md`](./04-weapons.md) | Weapon formula, tiers, roles |
| [`05-skills.md`](./05-skills.md) | Skill tree, every node, skill formulas |
| [`06-enemies.md`](./06-enemies.md) | All 40 enemies + tutorial dummy, area design patterns |
| [`07-balancing.md`](./07-balancing.md) | Pacing targets, simulator, balance reports, progression contract |
| [`08-saving.md`](./08-saving.md) | Save format, autosave, import/export |
| [`09-ui-and-presentation.md`](./09-ui-and-presentation.md) | Screen flow, tutorials, cutscenes, animations, sound, assets |

## Commands

```sh
npm install
npm run dev            # Vite dev server
npm run build          # vue-tsc type-check + vite build
npm run type-check
npm test               # Vitest (rule tests + balance smoke tests)
npm run balance:field  # print balance report for an area
# also: balance:forest | cave | wasteland | ruins | dungeon | hell | abyss
```

There is intentionally no lint/format tooling.
