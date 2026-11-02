# Level 40-2 — Balance and Progression

Working design document. This file covers the player's permanent power progression, the skill board's structure, and eventually progression-related balancing goals. Numerical tuning is deferred to implementation and testing.

## Established progression rules

- Monsters award XP, retained after death.
- XP is spent at the Barracks to purchase permanent skill points; it does not convert automatically.
- Skill points purchase nodes on the permanent skill board. Buying nodes opens further connected nodes.
- There are no level-ups during runs. The board and other Town upgrades provide permanent character growth.
- Nodes can grant skills, weapon improvements, HP, and other character upgrades.
- Barracks upgrades unlock additional portions of the board.
- Respeccing is available between runs, at a modest Gold cost scaling with the total number of skill points. The cost should not discourage experimentation.
- Bosses and monster achievements may grant skill points directly.

## Skill board — visual structure

### Center and concentric growth

- The board starts at a single central node: **Power +1**.
- The initial set of connected nodes forms a circle/ring around that center.
- Further rings expand outward, providing additional paths and choices.
- The board is a connected network, not a list of linear skill trees.
- The exact node arrangement, number of rings, node costs, and prerequisites remain undecided.

### Barracks expansion walls

- At a certain distance from the center, a clearly visible **wall** blocks access to further parts of the board.
- Nodes and icons beyond the wall remain visible, but are greyed out, signaling future possibilities without allowing purchases.
- Upgrading the Barracks removes the corresponding wall and opens the next portion of the board.
- Further walls may divide later outward expansions; their number and placement remain open.
- The distinction is intentional: **rings describe outward character progression; walls describe facility-gated access.**

### Regions without rigid specialization

- The board is divided into a few broad thematic sections or regions.
- Regions may lean toward different playstyles, mechanics, or weapon-related bonuses, but must never be exclusive to one category.
- Going left, right, or in any other direction must not mean committing entirely to a single playstyle (for example, only magical or elemental skills).
- Mixed builds should be practical: players can follow a general direction while encountering useful nodes from several categories.
- Connections and region contents should allow meaningful flexibility rather than all-or-nothing specialization.
- Exact region themes and how much crossover is available are still open.

## Weapon damage and attack structure

- Weapons have a defined **number of attacks/hits** and **damage per hit**.
- Every hit has a **Physical damage component**, which may be **0**.
- A weapon may additionally have **one** elemental damage component: **Fire, Ice, or Thunder**. The elemental component may be absent.
- A weapon can deal Physical-only damage, Physical plus one element, or purely elemental damage (0 Physical plus one element).
- **A single weapon cannot combine two different elements** (for example, Fire and Thunder).
- **Weapons do not apply status effects.** Their attacks deal damage only; statuses come from other mechanics, such as skills or enemy abilities.
- Physical and elemental components belong to the **same hit**, not separate hits. Each component receives its own damage-type response, but flat DEF applies **once to the combined hit**, split evenly across damaging components with unused reduction overflowing to the other component (see below).

**Illustrative examples (not balance values):** A sword may hit once for 5 Physical + 10 Fire; a dagger may hit three times for 2 Physical + 4 Thunder **per hit**; a weapon may hit once for 0 Physical + 20 Ice. A weapon dealing 10 Fire + 5 Thunder is not permitted.

## Temporary combat statuses

- **Poison:** damage over time; replaces Bleed.
- **Stun:** freezes cooldown recovery temporarily.
- **Regeneration:** restores HP over time, capped at maximum HP.
- **DEF:** flat damage reduction **per hit** for a fixed duration; particularly effective against many small hits (e.g., Daggers). It is not an accumulating shield.
- **AGI:** evasion charges; each charge avoids one entire hit, especially useful against large single hits (e.g., Axes).
- **Shielded:** temporary resistance (×0.5) or immunity (×0) to a specified damage type (Physical, Fire, Ice, or Thunder). **Replaces Invincible.**
- **Absorb:** temporarily converts a specified damage type into healing.
- **Curse (delayed damage reflection):** lasts for a specified duration (e.g., 5 seconds) and records the actual damage the cursed character deals during that time, preserving each damage type and its amount. On expiry, the recorded damage is reflected back onto that character. Reflected damage interacts normally with DEF, AGI, Shielded, Absorb, and damage-type responses. The effect can remain dangerous even after the enemy that applied it dies. A powerful late-game healing/cleansing skill that removes Curse without triggering reflection is a **possibility**, not an initial mechanic or confirmed unlock.

Monsters' **innate damage-type responses are permanently active**. Temporary Shielded and Absorb effects **override**, rather than multiply with, the innate response for that damage type while active. After expiry, the innate response applies again. Reapplying a status **refreshes its duration**, without stacking separate copies. A **stronger** application replaces a weaker one (e.g., stronger Poison replaces weaker Poison). For simultaneous temporary elemental effects targeting the same damage type, **the strongest effect wins**; effects do not combine or multiply.

## Damage resolution, DEF, and absorption

- Each hit can contain Physical damage and at most one elemental component. Apply the target's effective damage-type response to each component **before DEF**.
- If an element is **absorbed**, remove that component from damaging damage entirely and treat its full value as a **separate healing event**. DEF never reduces this healing, even if DEF fully blocks the physical component.
- For a hit with both damaging components, divide the available flat DEF equally between Physical and Elemental. Any unused reduction on either side **overflows** to the other side. With only one damaging component, all DEF applies to it. DEF is applied once per hit, not once per component.
- Display damage and healing **separately** in combat; never collapse them into a single net number. Resolve damage first, then healing from the same hit, **before checking for death**. Healing cannot exceed maximum HP.

For Curse reflection, keep the recorded damage types separate so a player can deliberately deal Fire damage while cursed and activate Fire Shielded or Fire Absorb before expiry. Reflected damage and any resulting absorption healing are shown as separate combat events, using the same damage-first, healing-second resolution described above.

**Examples:** 100 Physical + 20 Fire against 80 DEF deals 40 damage at normal Fire response, 30 against Fire resistance, and 20 against Fire immunity. Against Fire Absorb, it displays **20 damage** and **20 healing** separately (subject to maximum HP). For the normal response, DEF initially allocates 40 to each component; Fire uses only 20, so the unused 20 reduces Physical damage further.


## Content dependencies and future design

The actual skill nodes should be designed in coordination with:

- The weapon roster and the distinct roles of weapon types.
- Weapon-specific empowerment/burst effects.
- The established status-effect roster and its interactions (documented below).
- Active skills, passive bonuses, defensive options, and elemental resistance.

Do not lock down a complete node roster before these connected systems are defined. The board structure can be established now without inventing individual skills.

## Balance and progression — later work

This document will also hold decisions about progression pacing and balance goals once the underlying content exists. Topics to revisit include:

- Skill point acquisition and XP spending progression.
- The relationship between board depth, Barracks upgrades, and run progress.
- How quickly players gain access to different build options.
- Respec cost scaling and progression-related Gold sinks.
- Relative value of node categories, avoiding dead ends or mandatory universal paths.
- Testing whether mixed builds remain viable and whether specialization offers worthwhile tradeoffs.

Exact values, formulas, costs, timings, and combat balance are **implementation/testing tasks**, not decisions required for this document now.

## Open questions (not blockers yet)

- How many concentric rings and Barracks-gated walls should there be?
- What are the broad thematic regions, and how should they overlap?
- How are nodes connected across neighboring regions and rings?
- How do weapon and status designs translate into specific nodes?
- Which nodes, if any, have multiple ranks or special purchase conditions?

These are deliberately left open rather than filled with speculative content.
