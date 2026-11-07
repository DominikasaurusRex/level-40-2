# Level 40 2 — Battle

How a fight works from the player's side: what the player brings, what the timeline shows, when the
player can act, and how monsters react. This supersedes the battle parts of the original
`level40-system-documentation/02-combat.md` and `09-ui-and-presentation.md`.

Related documents:

- `level40-2-design-doc.md`: run loop, combat continuity, Focus rules for empowerment.
- `weapons-and-empowerment.md`: the four weapon families, their cadence and empowerment.
- `level40-2-balance-progression.md`: statuses, skill effects, monster conditions, damage resolution.
- `enemies.md`: what a monster brings.

## Loadout

The player prepares the loadout in Town before a run. There is no way back to Town during a run, so
the loadout holds for the whole run. It has **six slots**:

| Slots | What | Notes |
| --- | --- | --- |
| 3 weapons | From the unlocked arsenal | Each weapon attacks automatically (its **default attack**) and can be empowered. Every hit has a Physical part (may be 0) plus at most one element. Equipped weapons cannot be deactivated, even when the enemy absorbs their element. |
| 3 active skills | Bought through the skill board | Used manually. A skill is a list of effects and may also cleanse; one skill may combine several effects. |

Passive skill-board nodes are not slots: everything bought on the board applies all the time.

Equipment consists only of weapons; there is no armor or accessory.

A monster has its own, fixed set instead: **one basic attack** (its default attack) and **up to three
skills**.

## Attack timeline

- **Default attacks** (the player's three weapon attacks and the monster's basic attack) are shown on
  a **timeline** of when they will trigger, for both the monster and the player.
- Their timing follows from cooldowns, so it can be predicted. The timeline shows the projection for
  the current state and updates when something changes it: Haste/Slow, Stun, Demon Dance, a new
  monster.
- **Skills are not on the timeline.** Monster skills fire on conditions, the player's skills are
  used manually.
- Layout and look are not decided yet.

## Player actions

Besides the automatic default attacks, the player can act **at any time**:

- **Use an active skill** whenever it is ready (its cooldown is over).
- **Empower a weapon** (charge, switch Focus, burst) following the Focus rules in
  `level40-2-design-doc.md`.

The only thing that stops this is **Stun**: while stunned, no attack or skill can be used, not even a
ready one, and the empowerment bar does not charge.

A fight still runs without any input.

## Monster reactions

Monsters do not act manually, but their skills **react** to what happens in the fight. A monster
skill with a **condition** stays ready after its cooldown and fires the moment its condition holds
(see "Skill timing and conditions" in `level40-2-balance-progression.md`). The conditions look at the
current state of the fight, so a player's action can trigger them right away:

- A **Cleanse** waits for a negative status on the monster, for example the player's Poison, Stun, or
  Slow.
- A **forced cleanse** waits for a positive effect on the player, for example a Barrier or Shield the
  player just cast. This can be baited on purpose.
- A **heal** or **Regeneration** waits until the monster has lost enough HP.

Monster skills without a condition fire as soon as their cooldown is over.
