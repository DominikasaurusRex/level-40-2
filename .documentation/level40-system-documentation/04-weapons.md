# Weapons

Source: `src/data/weapons.ts`.

The player has one equipment slot (Weapon) and owns all three weapon types from the start:
**Dagger, Sword, Axe**. They can switch at any time (from the Basic Attack row). There is no
armor, loot, or crafting. The game starts with the Sword equipped.

A weapon defines the player's basic attack: damage per hit, number of hits, cooldown.

## Damage formula

```text
damage per hit = round((Power × powerMultiplier + flatBonus) × tierMultiplier)
```

| Weapon | powerMultiplier | flatBonus | Cooldown |
| ------ | --------------: | --------: | -------: |
| Dagger | 1.0 | 1 | 3000ms |
| Sword  | 2.5 | 2 | 3000ms |
| Axe    | 4.5 | 4 | 5000ms |

Damage is recomputed whenever Power or tier changes.

## Tiers

All three weapons upgrade together at fixed player levels. The new tier replaces the old one.

| Tier | Level | Dagger hits × mult | Sword hits × mult | Axe hits × mult |
| ---- | ----: | -----------------: | ----------------: | --------------: |
| Poor (start) | 1 | 2 × 1.00 | 1 × 1.00 | 1 × 1.00 |
| Improved | 6 | 3 × 0.80 | 1 × 1.15 | 1 × 1.25 |
| Good | 13 | 3 × 1.00 | 1 × 1.32 | 1 × 1.40 |
| Great | 19 | 4 × 1.52 | 2 × 1.52 | 1 × 3.04 |
| Masterwork | 24 | 4 × 1.75 | 2 × 1.75 | 1 × 3.50 |
| Legendary | 28 | 4 × 2.00 | 2 × 2.00 | 1 × 4.00 |

Each tier has its own name (`Improved Dagger`…) and icon (`/icons/weapons/<slot>1-6.png`).
Great is the big spike: Dagger gains a 4th hit, Sword a 2nd hit, Axe doubles its multiplier.

## Sample output (hits × damage, sustained DPS)

| Power | Tier | Dagger | Sword | Axe |
| ----: | ---- | ------ | ----- | --- |
| 5 | Poor | 2×6 (4.0/s) | 1×15 (5.0/s) | 1×27 (5.4/s) |
| 5 | Good | 3×6 (6.0/s) | 1×19 (6.3/s) | 1×37 (7.4/s) |
| 15 | Good | 3×16 (16.0/s) | 1×52 (17.3/s) | 1×100 (20.0/s) |
| 15 | Great | 4×24 (32.0/s) | 2×60 (40.0/s) | 1×217 (43.4/s) |
| 25 | Masterwork | 4×46 (61.3/s) | 2×113 (75.3/s) | 1×408 (81.6/s) |
| 25 | Legendary | 4×52 (69.3/s) | 2×129 (86.0/s) | 1×466 (93.2/s) |

**Invariant:** at every tier, raw sustained DPS is strictly **Dagger < Sword < Axe**, and every
new tier is stronger than the last at the same Power (both covered by `weapons.spec.ts`).

## Roles

- **Dagger — AGI clearer.** Many small hits; each AGI charge only dodges one of them. Lowest raw DPS.
- **Sword — generalist.** No strong counter either way.
- **Axe — DEF / high-HP breaker.** One huge slow hit punches through standing DEF and rewards long
  fights. Hard-countered by AGI (one charge dodges the whole hit, wasting 5s). Overkill wastes
  damage in short fights.

Role and mechanics differentiate weapons, not raw output. Enemies are designed so the best weapon
depends on the matchup (see [`06-enemies.md`](./06-enemies.md)).

## Switching

Switching resets Basic Attack to the new weapon's full cooldown and discards its queued hits.
This prevents alternating a fast weapon with a heavy one for free.
