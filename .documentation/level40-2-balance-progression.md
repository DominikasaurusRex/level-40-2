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
- **Each wall also requires a minimum number of skill points currently invested within the section enclosed by that wall** before it can open, even after respeccing. Points spent in the past but subsequently refunded do not count toward the requirement. This is intended to discourage rushing straight down one narrow path and encourage some breadth of investment.
- Both the Barracks upgrade and the section-specific skill-point spending requirement must be met to open a wall. Exact thresholds remain undecided.
- The distinction is intentional: **rings describe outward character progression; walls describe facility-gated access.**

### Regions without rigid specialization

- The board is divided into a few broad thematic sections or regions.
- Regions may lean toward different playstyles, mechanics, or weapon-related bonuses, but must never be exclusive to one category.
- Going left, right, or in any other direction must not mean committing entirely to a single playstyle (for example, only magical or elemental skills).
- Mixed builds should be practical: players can follow a general direction while encountering useful nodes from several categories.
- Connections and region contents should allow meaningful flexibility rather than all-or-nothing specialization.
- Exact region themes and how much crossover is available are still open.

## Skill-board node and skill ideas — preliminary

These are **categories and illustrative ideas**, not a fixed node list, node placement, or balanced values.

- Include both **general passive nodes** (such as **Power +1**, HP increases) and **weapon-specific passive nodes** (such as **+2 Physical damage to Hammers**). Neither category is inherently better; their relative value depends on the build and later balancing.
- **Power** retains its established meaning as the player's damage stat from the original Level 40. Do not redefine it as a new per-hit weapon modifier.
- Potential early options: general Power/HP increases; weapon-specific damage; active healing, Regeneration, or DEF skills.
- Potential middle options: elemental bonuses, further weapon specialization; active AGI, Stun, Poison, and elemental resistance via Barrier.
- Potential late options: stronger specialized bonuses; elemental immunity, Curse, and Absorb skills. **Absorb belongs far out on the skill board**, not among the initial active skills.
- General extra-hit upgrades remain a possible rare, high-end concept. Dual Blades may also receive
  family-specific Demon Dance upgrades that add hits.
- Whether active skills have dedicated upgrade nodes (e.g., improved effect or cooldown) is **not yet decided**.

These examples should remain mixed across board regions rather than segregated into exclusive weapon or elemental branches.

## Weapon damage and attack structure

- Weapons have a defined **number of attacks/hits** and **damage per hit**.
- Weapon damage **scales with the player's Power**. The exact formula is implementation balancing.
- Every hit has a **Physical damage component**, which may be **0**.
- A weapon may additionally have **one** elemental damage component: **Fire, Ice, or Thunder**. The elemental component may be absent.
- A weapon can deal Physical-only damage, Physical plus one element, or purely elemental damage (0 Physical plus one element).
- **A single weapon cannot combine two different elements** (for example, Fire and Thunder).
- **Normal weapon attacks do not apply status effects.** Empowered weapon techniques may apply
  statuses as defined in **weapons-and-empowerment.md**.
- Physical and elemental components belong to the **same hit**, not separate hits. Each component receives its own damage-type response, but flat DEF applies **once to the combined hit**, split evenly across damaging components with unused reduction overflowing to the other component (see below).

**Illustrative examples (not balance values):** A sword may hit once for 5 Physical + 10 Fire; a dagger may hit three times for 2 Physical + 4 Thunder **per hit**; a weapon may hit once for 0 Physical + 20 Ice. A weapon dealing 10 Fire + 5 Thunder is not permitted.

## Temporary combat statuses

- **Poison:** damage over time; replaces Bleed. Bypasses AGI, DEF, and Shield. Reapplying Poison
  merges it with the active one: the higher **damage per tick** is kept and the durations **add
  up**. Example: a 2-damage, 10-second Poison combined with a 15-damage, 5-second Poison becomes a
  15-damage, 15-second Poison. The merged Poison ticks at the stronger Poison's tick interval.
- **Stun:** while stunned, a combatant cannot use **any** attack or skill, not even one that is
  already ready. For the player this includes manually used active skills, and the empowerment bar
  does not charge. **Cooldowns are independent of everything, Stun included**: they keep running,
  and whatever becomes ready during the Stun waits until it ends.
- **Haste / Slow** (working names): speed up or slow down a combatant's **default attacks** for a
  duration. Haste is a positive status (usually cast on yourself, so you attack more often), Slow a
  negative one (usually cast on the opponent, so it attacks less often). They affect **only default
  attacks**: the player's weapon attacks and a monster's basic attack. **Skills are never affected.**
  This is the one exception to "cooldowns are independent of everything".
  - The speed change is a **multiplier** on how fast the attack timer fills (for example ×1.5 for
    Haste, ×0.5 for Slow), so fast and slow weapons gain or lose the same proportion. It also
    applies to a timer that is already running.
  - Haste and Slow are **one speed status**: whatever was applied **most recently wins** and
    replaces the other, so the player and the enemy can override each other's speed effect (the
    same rule as temporary damage responses).
  - They do **not** change the empowerment bar; the player controls it.
- **Regeneration:** restores HP over time, capped at maximum HP.
- **Shield:** a pool of temporary HP, carried over from the original Level 40 (where DEF was displayed as "Shield"). It absorbs damage point-for-point before HP is lost and is used up as it does. It stacks and does not expire, so it can be built up against weak enemies and carried into later fights. Not to be confused with Barrier.
- **DEF:** flat damage reduction **per hit** for a fixed duration; particularly effective against many small hits (e.g., Dual Blades). It is not an accumulating pool; that role belongs to Shield.
- **AGI:** evasion charges; each charge avoids one entire hit, especially useful against large single hits (e.g., Hammers). Charges **stack**. AGI stops
  **only hits**. It never prevents Poison ticks, Curse reflection, or other statuses and effects, even
  ones from the same skill as a dodged hit.
- **Barrier:** temporary resistance (×0.5) or immunity (×0) to one or more specified damage types (Physical, Fire, Ice, Thunder), for example all three elements at once. **Replaces Invincible.**
- **Absorb:** temporarily converts a specified damage type into healing.
- **Vulnerability:** temporarily makes the **target** vulnerable (×2) to one or more specified damage types (Physical, Fire, Ice, Thunder). It is a negative status, so a cleanse on self removes it. Both the player and monsters can have skills that apply it.
- **Curse (delayed damage reflection):** lasts for a specified duration (e.g., 5 seconds) and records the actual damage the cursed character deals during that time, preserving each damage type and its amount. "Actual" means what got through **after damage responses, DEF, and Shield**; damage from **Poison** the cursed character applied counts too. On expiry, the recorded damage is reflected back onto that character. Reflected damage interacts normally with Shield, DEF, Barrier, Absorb, and damage-type responses, but **AGI cannot avoid it**. The effect can remain dangerous even after the enemy that applied it dies. **Cleansing a Curse triggers its reflection immediately** (any cleanse, however weak). There is no cleanse that removes Curse without reflecting; cleansing it is a timing decision.

The **player's innate responses are all Normal** (every damage type, Poison, and Stun), and no
skill-board node is planned to change them. The player changes responses only through temporary
effects such as Barrier, Absorb, or Guard stance.

Monsters' **innate damage-type responses are permanently active**. Temporary damage responses (Barrier, Absorb, and Vulnerability) **override**, rather than multiply with, the innate response for that damage type while active, including innate immunity or absorption (Fire Vulnerability makes a Fire-immune monster take double Fire damage). After expiry, the innate response applies again.

When temporary damage responses meet on the **same damage type**, **whatever was cast last counts**,
regardless of strength or whether it is positive or negative. The new response replaces the old
one for that damage type; when it expires, the innate response applies again.

- Example: a monster casts Physical immunity, the player applies Physical Vulnerability, and the
  monster is vulnerable. If the monster then casts Physical immunity again, it is immune.
- This means the player can weaken their own protection by accident (for example, a weaker
  resistance cast over an active immunity). That is intended. Reapplying a status **refreshes its duration**, without stacking separate copies. A **stronger** application replaces a weaker one. Exceptions: **Shield and AGI stack**, and **Poison merges** (higher damage per tick, durations add up; see Poison above). Temporary damage responses on the same damage type never combine or multiply; the rules above decide which one applies.

## Skill effects

A skill (player or monster) is a list of effects. Every effect states its **target** (the caster
itself or the opponent), even when the usual choice is obvious (helpful effects on yourself,
harmful ones on the opponent). Cleansing uses the same target: on yourself it removes negative
statuses, on the opponent it removes positive effects. Each effect also needs these values:

| Effect | Values | Replaces (original Level 40) |
| --- | --- | --- |
| Damage | Physical amount, optional element and its amount, hit count | Untyped damage |
| Poison | Damage per tick, tick interval, duration | Bleed |
| Stun | Duration | — |
| Haste / Slow | Speed multiplier for default attacks, duration | — (new) |
| Regeneration | HP per tick, duration | Heal over time |
| Heal | Amount (instant) | — |
| Shield | Amount (stacks, never expires) | The old DEF pool |
| DEF | Flat reduction per hit, duration | — (new) |
| AGI | Charges | — |
| Damage response (Barrier, Absorb, Vulnerability) | Damage types, response (absorb, immune, resisted, or vulnerable), duration | Invincible |

**Barrier, Absorb, and Vulnerability are one effect:** a temporary damage response for one or more
damage types. Barrier is the resisted or immune version, Absorb the absorbing one, Vulnerability
the vulnerable one. Like every effect, it states its target; usually Barrier and Absorb go on the
caster and Vulnerability on the opponent. Several can be active at once, for different damage
types.
| Curse | Duration; reflects the damage dealt when it expires | Old Curse (healing reduction) |

### Cleansing

Cleansing is **not an effect** like the ones above; it is an action that removes statuses. It is
still part of the game, for both the player and monsters, in two directions:

- **Cleanse:** removes negative statuses from the caster (such as Poison, Stun, Curse).
- **Forced cleanse:** removes **every positive effect** from the target, **including Shield**
  (also Regeneration, DEF, AGI, Barrier, Absorb). The name is not decided yet.

**Empowered weapon states can never be cleansed**, neither by a forced cleanse nor by a cleanse on
self. This gives the defensive empowered states (such as Guard stance) a reliably useful role.

**Cleansing a Curse triggers its reflection immediately.** The recorded damage is reflected the
moment the Curse is removed, so cleansing Curse is a timing decision rather than a safe escape.

## Skill timing and conditions

Conditions are the **monster AI**. A monster skill does not always fire the moment its cooldown runs
out: it can have a **condition**, so once its cooldown is over it stays **ready** and waits until
the condition holds, then fires.

The player's active skills have **no conditions**: the player decides when to use them. Both sides
can have the same kinds of skills (for example cleanses and heals); only the monster's timing is
automated by conditions.

Settled conditions (monsters):

- A **Cleanse** waits until the caster has **any** negative status.
- A **forced cleanse** waits until the target has **any** positive effect. This is deliberately
  exploitable: the player can bait it with a cheap positive effect and then apply the important
  ones after it has fired.
- A **heal** waits until at least **60% of its heal amount** would actually restore HP, i.e. the
  caster's missing HP is at least 60% of the heal. Example: a skill healing 30 HP waits until at
  least 18 HP is missing. The threshold therefore scales with each combatant's own heal amount.
- A **Regeneration** waits until the caster's missing HP is at least **30% of its total healing**
  over its full duration. The lower threshold suits healing that arrives gradually.

A skill that does several of these things (for example, heal and cleanse) fires as soon as **any**
of its conditions holds.

Every other monster skill has no condition and fires as soon as its cooldown is over, as before.

Every skill also has an **initial cooldown**: how long it waits at the start of a fight before its
first use. After that, its normal cooldown applies.

## Damage resolution, DEF, and absorption

- Each hit can contain Physical damage and at most one elemental component. Apply the target's effective damage-type response to each component **before DEF**.
- If an element is **absorbed**, remove that component from damaging damage entirely and treat its full value as a **separate healing event**. DEF never reduces this healing, even if DEF fully blocks the physical component.
- For a hit with both damaging components, divide the available flat DEF equally between Physical and Elemental. Any unused reduction on either side **overflows** to the other side. With only one damaging component, all DEF applies to it. DEF is applied once per hit, not once per component.
- **Shield comes after DEF.** Whatever damage remains after DEF is absorbed by Shield first; only the rest reduces HP. Shield does not affect absorption healing.
- **Poison bypasses AGI, DEF, and Shield.** Curse reflection goes through damage responses, DEF, and Shield like any other damage, but AGI
  cannot avoid it.
- Display damage and healing **separately** in combat; never collapse them into a single net number. Resolve damage first, then healing from the same hit, **before checking for death**. Healing cannot exceed maximum HP.

Hits still on their way when a monster dies are **lost**; they do not carry over to the next
monster. The original Level 40 impact delay (370 ms plus stagger) is not a settled rule; combat
timing will be reworked.

For Curse reflection, keep the recorded damage types separate so a player can deliberately deal Fire damage while cursed and activate a Fire Barrier or Fire Absorb before expiry. Reflected damage and any resulting absorption healing are shown as separate combat events, using the same damage-first, healing-second resolution described above.

**Examples:** 100 Physical + 20 Fire against 80 DEF deals 40 damage at normal Fire response, 30 against Fire resistance, and 20 against Fire immunity. Against Fire Absorb, it displays **20 damage** and **20 healing** separately (subject to maximum HP). For the normal response, DEF initially allocates 40 to each component; Fire uses only 20, so the unused 20 reduces Physical damage further.


## Content dependencies and future design

The actual skill nodes should be designed in coordination with:

- The weapon roster and the distinct roles of weapon types.
- Weapon-specific empowerment/burst effects.
- The established status-effect roster and its interactions (documented above).
- Active skills, passive bonuses, defensive options, and elemental resistance.

Do not lock down a complete node roster before these connected systems are defined. The board structure can be established now without inventing individual skills.

## Endgame board-completion target

- **Stage 42 (final superboss)** should be balanced around a **nearly complete skill board**, with **more than 90% of nodes active** as the current rough target. The exact percentage is deferred to balancing.
- Stage 42 also requires the **fully upgraded Monument** (+100% player damage, see `town.md`). A complete board and fully upgraded Barracks without the Monument's bonus should not be enough to beat it.
- Stage 40 main-game completion should not require an almost-complete board; Stage 41 serves as further superboss progression toward the final challenge.
- Consequently, the board should allow players to eventually obtain almost everything rather than enforcing permanently exclusive specializations. Build choices still matter through weapon loadouts, equipped active skills, and encounter strategy.

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
- What minimum invested-point threshold should each wall require?
- Which nodes, if any, have multiple ranks or special purchase conditions?

These are deliberately left open rather than filled with speculative content.
