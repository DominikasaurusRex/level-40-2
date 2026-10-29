# Combat

Combat is fully automatic and identical for player and monsters. Source: `src/combat/engine.ts`,
types in `src/types/`.

## Combatant

| Stat | Meaning |
| ---- | ------- |
| **HP** | Health. 0 = dead. Healing cannot exceed max HP. HP may be fractional (split heals). |
| **DEF** (shown as "Shield") | Absorbs damage point-for-point and is consumed. Stacks additively, never expires. Starts at 0. |
| **AGI** (shown as "Evasion") | Dodge charges. Each charge makes one incoming hit miss entirely. Stacks additively, never expires. |
| **Statuses** | Time-limited: Bleed, Curse, Stun, Invincible, Heal-over-time. Max one of each type. |

There are no permanent attack/defense stats. Everything comes from weapon and skills.

## Skills

Every action is a `Skill`:

```ts
{ id, name, category: 'attack' | 'guard' | 'heal', cooldown, effects: Effect[],
  startsReady?, initialDelay?, traits? }
```

- `category` is presentation only (animation/icon), never affects combat.
- The basic attack is a skill built from the weapon: `hits` copies of `{ type: 'dmg', amount: damage }`.
- **Fresh fight cooldowns:** a skill starts at its full `cooldown`, unless `startsReady` (fires
  immediately) or `initialDelay` (first activation after that delay, then normal cooldown).

## Effects

| Effect | Lands on | Behavior |
| ------ | -------- | -------- |
| `dmg` | target | Direct damage, resolved through Invincible → AGI → DEF → HP |
| `def` | caster | +DEF |
| `agi` | caster | +AGI charges |
| `heal` | caster | Instant heal; with `duration` becomes a Heal-over-time status. Optional `overhealToDamage` |
| `bleed` | target | Status: `amountPerTick` every `tickInterval` for `duration`. Ignores DEF and AGI |
| `curse` | target | Status: reduces healing received by `healingReduction` (0–1) |
| `stun` | target | Status: pauses the target's cooldown recovery |
| `invincible` | caster | Status: blocks all `dmg` and Bleed |
| `cleanse` | caster | Removes the listed statuses (Bleed/Curse) |

**Re-applying a status refreshes it** (overwrites duration/values), it never stacks.

## Damage resolution (per hit)

1. Target **Invincible** → hit does nothing.
2. Target has **AGI** → consume 1 charge, hit does nothing (whole hit, regardless of size).
3. **DEF** absorbs `min(DEF, damage)`; remainder reduces HP.

A multi-hit attack resolves **each hit independently**. Against DEF, 1×8 and 4×2 are identical.
Against AGI they are not: 1 AGI dodges all 8 damage of a single hit, but only 2 of the 8 from
four small hits. Many hits = AGI counter; big single hits = DEF/HP breaker but AGI-vulnerable.

**Bleed ticks** skip AGI and DEF entirely and hit HP directly (Invincible still blocks them).

**Healing:** Curse reduces the amount first; then it's capped by missing HP. If the heal has
`overhealToDamage` (Offensive Care), the excess is dealt as normal `dmg` to the enemy.

## Guard traits (reactive)

Player Guard can carry traits that fire inside damage resolution, at the moment a hit reduces
DEF from >0 to exactly 0:

- **Counter:** deals the **full pre-absorption damage** of that hit back to the attacker.
- **Recovery:** heals a fixed amount (can overheal into damage with Offensive Care).

Both are queued with the normal travel delay (below).

## Timing

The engine steps in 100ms ticks. Within one `advanceFight()` step:

1. **Player statuses**, then **monster statuses**: land any queued Bleed/HoT ticks whose delay
   ran out; reduce status timers; generate new Bleed/HoT ticks (every 1000ms); drop expired statuses.
2. **Player skills:** land queued hits whose delay ran out; then reduce cooldowns (unless
   stunned); any skill at 0 fires and resets to its full cooldown.
3. **Monster skills** — only if the monster is still alive.
4. Result: monster at 0 HP → `monster-defeated` (checked first, so the player wins simultaneous
   kills); else player at 0 HP → `player-defeated`; else `ongoing`.

### Delayed impact

Effects do **not** land when a skill fires. They are queued so the UI's flying icon can arrive
first. Every effect waits `HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS = 90 + 100 + 180 = 370ms`,
plus a stagger by its index in the skill's effect list:

- `dmg` effects: +200ms per index (`HIT_STAGGER_MS`)
- everything else: +80ms per index (`BUFF_STAGGER_MS`)

Before queuing, effects are split for visuals:

- `def` of N becomes N separate `+1 DEF` units (a 20 DEF Guard lands over ~1.9s).
- Instant `heal` is split into `healIconCountFor(amount)` equal parts (thresholds in
  `data/heal-icon-thresholds.ts`: 1, 4, 8, 16, 32 … 1400).

**Effect order in data matters**: `[stun, dmg]` lands the stun first. Bleed/HoT ticks and
Guard trait reactions also wait 370ms.

These delays are real gameplay time — the simulator keeps them. Removing them would change who
dies first.

### Stun

Stun freezes cooldown recovery only. Already-queued hits still land, and a skill already at 0
still fires. Stun also pauses Focus Pulse charging.

### Kills mid-queue

Queued hits keep their original target. A win carries the player's state (HP, DEF, AGI,
statuses, cooldowns, queued effects) into the next enemy; a death resets both sides.

## Focus Pulse (the only active input)

- Exactly one player ability is Focused (default: Basic Attack).
- Its Pulse charges over **3000ms** (`data/focus.ts`) independently of the ability's cooldown and
  stays full until spent. Automatic activations do not consume it.
- Clicking the **focused** ability with a full Pulse removes up to 3000ms from its remaining
  cooldown. It never fires the ability directly — the normal tick does (so it works while
  stunned, if that brings remaining to 0).
- Clicking a **different** ability moves Focus there and resets the charge.
- Charge resets on fight reset, player death, and when skills are rebuilt (learning a skill,
  Power change). Swapping weapons keeps the charge.
- Charging pauses during Stun, intermissions, and cutscene holds.
- Balance simulations ignore Focus entirely: it's optional leverage, not part of tuning.

## Weapon swap

Equipping a weapon resets Basic Attack to its **full new cooldown** and drops its queued hits,
so fast/slow weapons can't be alternated for free. Note: a level-up that changes Power or weapon
tier (and earning a badge) re-applies the equipped weapon the same way, so it also resets Basic
Attack's cooldown.
