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
- **Monster skills without a condition** fire as soon as their cooldown is over, so they are
  predictable too and **are shown on the timeline**. The player can see them coming and prepare.
- **Not on the timeline:** monster skills with a condition (they fire whenever the condition holds)
  and the player's skills (used manually).

## Screen layout

`mockup-battle.png` is a rough mockup put together from other games. Settled from it:

- The battle screen is **landscape**. A portrait layout is not being considered for now.
- The **monster** is the focal point in the middle, with its statuses next to it.
- The **monster has an HP bar** (it needs one for the red damage drain, and the player has to read
  it during a run).
- The **timeline** runs **vertically** along the side, the player's attacks in one column and the
  monster's in the other.
- The **player's HP bar** sits above the loadout, positive statuses on one side and negative ones on
  the other.
- The **loadout** is two rows of three at the bottom: weapons (name, Physical and element damage)
  above, skills below.

Not taken from the mockup: the "Exit Combat" and flee buttons (there is no retreat from a run). Not
decided yet: a combat log, how Shield/DEF/AGI values are shown, how the empowerment bar and Focus
are shown, how skill readiness is shown, the resource bar, and the stage display.

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

## Skill presentation

Using a skill is a highlighted moment, for the player and monsters alike:

1. **The game slows down.**
2. A **banner** shows who used which skill, for example "Player – Fireball".
3. The skill's **animation** plays on its target, for example a fireball hitting the monster.
4. The target's **HP bar** shows the damage: the lost part first turns into a red-ish section, then
   the bar slowly drains down to the new value, so the player can see how much the skill did.

The **end of a fight** (either side dies) gets the same treatment: the game slows down for the
final blow.

- **Default attacks** get **no banner and no slowdown**, but their damage shows on the HP bar with
  the same red drain.
- **Healing** shows on the bar **right away**, without a drain.
- The player **can act during the slowdown** (use ready skills, empower), so they can counter a
  monster's skill while it plays out.
- How strong and how long the slowdown is gets decided during testing.
