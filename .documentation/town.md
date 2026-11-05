# Level 40 2 — Town Progression

This document defines how Town facilities are repaired and upgraded. It supplements
`level40-2-design-doc.md` and supersedes its overview wherever the two discuss facility upgrade
structure. Exact costs, unlock stages, and numerical bonuses remain implementation-balancing work
unless explicitly stated here.

## Shared rules

- The **Inn**, **Gate**, and **Monument** begin repaired. Every other facility begins broken.
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
| Inn | Repaired | Optional original Level 40 save import for the early bonus; no upgrades. |
| Gate | Repaired | Six wall upgrades that progressively protect unspent XP and Gold. |
| Barracks | Broken | Repair, then roughly five upgrades tied to skill-board walls. |
| Smithy | Broken | Repair, then roughly five upgrades unlocking higher-level weapons. |
| Library | Broken | Repair unlocks useful monster records; one upgrade reveals combat abilities. |
| Quest board | Broken | Repaired once; no further upgrades. |
| Bar | Broken | Repair at 20% exchange efficiency, then three upgrades: 40%, 60%, and 80%. |
| Monument | Repaired | Opens the Town repair modal; one upgrade that replaces its image. |

The Smithy and Barracks counts are structural targets, not a commitment to exactly five upgrades.
Their final counts should match the weapon tiers, skill-board walls, and journey pacing.

## Inn

The Inn starts repaired and has one purpose: optionally importing an original **Level 40** save for
the established early-game bonus.

- Importing a save is optional.
- A valid original save grants its early-game bonus only once.
- Importing another save cannot repeatedly grant the bonus.
- The Inn has no repairs or upgrades beyond being available from the start.
- The Inn does not grant a starting Shield or other rested bonus.

Weapon purchasing and weapon-loadout selection belong to the Smithy. Skill-board progression and
active-skill selection belong to the Barracks, so the Inn does not duplicate either function.

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

The Gate's embark confirmation must warn the player about the raid before the run begins. It must
show the **exact XP amount lost** and the **exact Gold amount lost** based on the current Gate level
and the player's current resources. A percentage alone is not sufficient.

The warning is shown before the player commits to the run, with separate **Embark** and **Cancel**
actions. Resource loss is applied only after the player confirms Embark.

## Barracks

Repairing the Barracks unlocks spending XP on skill points and access to the initial skill-board
section.

The Barracks action opens the skill board directly. It does not use a separate Barracks modal.
The skill board's layout, walls, purchase rules, and progression are defined in
**level40-2-balance-progression.md**.

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

The monster-manual interface and its discovery rules are defined in **library-modal.md**.

## Quest board

The Quest board is repaired once and has no later upgrades. It is a binary unlock: monster quests
and achievement tracking are either available or unavailable.

The Quest Board interface and quest-state presentation are defined in **quest-board-modal.md**.

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
is defined in **bar-modal.md**. Allowed transaction sizes remain an implementation detail.

## Monument

The Monument starts repaired. It opens the Town repair modal, where every Town place is repaired and
upgraded (see **town-repair-modal.md**).

The Monument has one upgrade. It only replaces the Monument's image with a restored version. It is
the final restoration goal and an endgame sink for Gold and materials after the functional
facilities have been restored.
