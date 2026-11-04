# Level 40 2 — Town Progression

This document defines how Town facilities are repaired and upgraded. It supplements
`level40-2-design-doc.md` and supersedes its overview wherever the two discuss facility upgrade
structure. Exact costs, unlock stages, and numerical bonuses remain implementation-balancing work
unless explicitly stated here.

## Shared rules

- The **Inn** and **Gate** begin repaired. Every other facility begins broken.
- Repairing and upgrading facilities costs **Gold and materials**.
- A repair unlocks a facility's main function. Later upgrades improve that function; they are not
  separate crafting systems.
- Facilities should become available across the journey rather than all at once. The Smithy and
  Barracks are recurring progression tracks, while the Monument is deliberately saved for last.
- Permanent purchases, skill points, equipment, facility progress, and materials are never lost
  when starting a run. The Gate's protection rule applies only to **unspent XP and Gold**.

## Upgrade summary

| Facility | Starting state | Progression |
| --- | --- | --- |
| Inn | Repaired | Two upgrades that grant increasingly large starting Shield bonuses. |
| Gate | Repaired | Six wall upgrades that progressively protect unspent XP and Gold. |
| Barracks | Broken | Repair, then roughly five upgrades tied to skill-board walls. |
| Smithy | Broken | Repair, then roughly five upgrades unlocking higher-level weapons. |
| Library | Broken | Repair unlocks useful monster records; one upgrade reveals combat abilities. |
| Quest board | Broken | Repaired once; no further upgrades. |
| Bar | Broken | Repair at 20% exchange efficiency, then three upgrades: 40%, 60%, and 80%. |
| Monument | Broken | The final repair and an endgame resource sink; possible bonus remains open. |

The Smithy and Barracks counts are structural targets, not a commitment to exactly five upgrades.
Their final counts should match the weapon tiers, skill-board walls, and journey pacing.

## Inn

The Inn starts repaired and remains the place for preparing the run loadout.

It can be upgraded twice. Each upgrade grants a larger amount of temporary **Shield** when a run
starts, representing the adventurer being well rested. This is starting protection, not permanent
maximum HP. It is granted fresh for each run and cannot be accumulated by repeatedly entering and
leaving Town.

The two Shield amounts are balancing values to determine during implementation.

## Gate and town raids

The Gate starts repaired and is the Town's most important upgrade track. It can be upgraded six
times as the surrounding wall is restored.

When the player starts a run, monsters raid the Town. Mechanically, the loss is applied when the
player confirms the run:

- Only the player's currently unspent **XP and Gold** are affected.
- Materials, permanent progress, bought skill points, weapons, and facility progress are safe.
- Resources collected during a run still return to Town in full on death or completion. They are
  at risk only when the next run begins, giving the player a chance to spend them first.
- The final Gate upgrade protects 90% of unspent XP and Gold. The remaining 10% is always lost.

A simple initial retention curve is shown below. The intermediate percentages are tuning values;
the seven progression states and final 90% retention are the settled structure.

| Gate state | XP and Gold retained when starting a run |
| --- | ---: |
| Repaired Gate | 0% |
| Wall upgrade 1 | 15% |
| Wall upgrade 2 | 30% |
| Wall upgrade 3 | 45% |
| Wall upgrade 4 | 60% |
| Wall upgrade 5 | 75% |
| Wall upgrade 6 | 90% |

The embark confirmation should clearly show how much XP and Gold will be retained and lost before
the player commits to the run.

## Barracks

Repairing the Barracks unlocks spending XP on skill points and access to the initial skill-board
section.

The Barracks is upgraded roughly five times across the journey. Its upgrades remove the visible
walls that block outer skill-board sections. As defined in `level40-2-balance-progression.md`, a
wall opens only when both conditions are met:

1. The corresponding Barracks upgrade has been bought.
2. The required number of skill points is currently invested inside the enclosed section.

Exact wall count, upgrade timing, costs, and invested-point thresholds will be designed with the
final skill board.

## Smithy

Repairing the Smithy unlocks buying and improving weapons.

The Smithy is upgraded roughly five times across the journey. Each upgrade opens a higher level of
weapon selection or weapon improvement. The final number of Smithy upgrades should be coordinated
with the weapon roster so every upgrade provides a meaningful new purchase tier.

## Library

Repairing the Library unlocks the monster manual for monsters the player has encountered. The
initial useful record shows:

- Name and zone.
- Maximum HP.
- Responses to Physical, Fire, Ice, and Thunder damage: absorb, immune, resisted, normal, or
  vulnerable.

Name, zone, and HP alone do not provide enough information for the Library's core purpose of
planning weapon loadouts, so damage-type responses are included in the repair rather than withheld
as a separate upgrade.

The Library can then be upgraded once to add detailed combat information for known monsters,
including their attacks, skills, elements, and applied statuses. Exact rules for when a monster or
ability becomes "known" remain content and implementation work.

## Quest board

The Quest board is repaired once and has no later upgrades. It is a binary unlock: monster quests
and achievement tracking are either available or unavailable.

Tracking begins only after the repair. Earlier kills and feats do not count retroactively, as
defined in `level40-2-design-doc.md`.

## Bar

Repairing the Bar unlocks exchange in both directions between Gold and XP. The exchange always
loses value, preventing conversion loops from creating resources.

| Bar state | Conversion efficiency |
| --- | ---: |
| Repaired Bar | 20% |
| Upgrade 1 | 40% |
| Upgrade 2 | 60% |
| Upgrade 3 | 80% |

At 20% efficiency, exchanging 100 of either currency gives 20 of the other. The exact interface
and allowed transaction sizes remain implementation details.

## Monument

The Monument is the final Town repair. It is primarily an endgame sink for Gold and materials after
the functional facilities have been restored.

It may grant a small bonus so the repair feels rewarding, but that bonus is not yet decided. It
should not gate a required core system or undermine the Monument's role as the final restoration
goal.
