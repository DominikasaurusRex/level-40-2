# Level 40-2 — Current Design Decisions

Working design notes, 2026-11-01. This describes the **sequel**, not the original Level 40. Settled rules and explicitly open choices are distinguished below. **Numerical balancing belongs to implementation**: click counts, durations, strengths, costs, drop rates, and similar tuning do not need to be settled during this design discussion.

## Core loop and run rules

1. In **Town**, prepare a weapon loadout, active skills, and permanent upgrades.
2. **Manually start a run** at the first stage not permanently skipped.
3. Fight monsters automatically in stage order. The player can empower weapons and time active skills, but a run can in principle continue with little or no input.
4. Continue until death or completion. **There is no retreat to Town, no pausing, and no closing the game and resuming the same run.** The exact handling of an interrupted run remains an implementation detail; resumable runs are not supported.
5. Death returns the player to Town with collected resources and permanent progress retained. **There is no automatic restart and no reduced reward payout on death.** The intended incentive is to keep pushing forward.
6. Improve the character and equipment, then manually start another run.

## Stages and ending

- **40 main stages**, followed by **two additional superboss stages**.
- Stage **41** is a superboss whose identity is undecided.
- Stage **42** is **the developer**.
- After stage 40, an ending cutscene shows **“Fin?”**.
- Only after beating the superbosses does the game show **“Fin!”**.

## Combat continuity

- **All player combat state carries between fights**: current HP, shields/DEF, evasion charges/AGI, statuses, cooldowns, weapon charge, and ongoing empowerment.
- Winning does not reset or fully heal the player. A weak enemy can provide an opportunity to accumulate shields; damage from one encounter can cause defeat in the next.
- Statuses persist for their remaining duration. For example, poison continues ticking into the next fight until it expires.
- Additional or revised statuses may be needed; the final status roster remains open.

## Combat and weapons

- The player starts with **only the Sword**. Other weapons unlock during play.
- Unlocking a weapon adds it to the available arsenal. Only weapons equipped in the run loadout attack automatically.
- **Equipped weapons cannot be deactivated during a run.** They continue attacking even when an enemy absorbs their element and is healed by them. Players must account for this when preparing their loadout.
- Weapon types have multiple individual weapons with different damage values and elements; for example, several Daggers can offer different elemental and damage options.
- Buying a stronger version of a weapon **replaces its older version**. Unique weapons count by their name.
- Weapons should have distinct roles and matchups. A matchup may temporarily block progression while the player farms toward another weapon, such as the Dagger. Such progression gates are fair and intended.
- The player selects **three weapon slots per run** in Town, allowing different elements and attack options to be combined.
- **Equipment consists only of weapons**; there is no armor or accessory equipment system.
- The old game's combat numbers are a reference baseline, **not** values to preserve.

## Damage types and target responses

Keep the system light: **Physical damage plus three elements: Fire, Ice, and Thunder**.

| Target response to a damage type | Result |
| --- | --- |
| Absorb / healing | The damage heals the target instead. |
| Immune | No damage. |
| Resisted | Half damage (×0.5). |
| Normal | Normal damage (×1). |
| Vulnerable | Double damage (×2). |

Weapons have elemental options. Enemy attacks can also have elements, and enemies have elemental resistances and other responses from the table above. No additional elements or elemental combination/reaction system is planned. Individual weapon entries belong in separate content documents, rather than the structural design decisions here.

Player elemental resistance can come from **both passive skill-board nodes and active protection skills**.

## Active play during runs

Active play has two parts: building weapon empowerment through clicks, and timing a few active skills. Combat still proceeds automatically without input.

### Weapon Focus and bursts

- Repeatedly clicking a weapon fills its **empowerment bar**.
- When full, that weapon **automatically enters a temporary empowered burst**; no separate activation is required.
- Only **one weapon can be focused or empowered at a time**.
- Clicking another weapon switches Focus and resets the charge. Switching during a burst ends the previous weapon's empowerment; two weapons cannot be empowered together.
- **Charging is blocked during the burst**. Once it ends, the player can build the bar again.
- This creates periods of clicking followed by time to watch combat and use skills without constantly maintaining the bonus.
- Weapon-specific burst effects still need defining. Click counts, strengths, and durations will be tuned during implementation.

### Timed active skills

- Active skills are **bought through the skill board**.
- The player selects **four active skills per run, possibly five depending on the interface layout**. Together with three weapon slots, pre-run preparation fills **seven or eight loadout slots**.
- Skills should offer a broader range of distinct effects to cover support roles without consumables. Examples include **shielding, healing, damage element altering, elemental resistances and stunning**; the final skill roster remains open.
- Well-timed skills should be capable of **swinging a fight**.
- Exact effects, costs, and cooldowns will be worked out during implementation.

## Permanent progression and skill board

- **There are no level-ups during runs.** Permanent growth happens through the skill board and other between-run upgrades.
- Monsters award **XP**, retained after death. The player **spends XP at the Barracks to buy permanent skill points**. There is **no automatic conversion**.
- Skill points are never lost through death. Equipment and unlocked skills persist as well.
- The branching skill board is broadly reminiscent of *Final Fantasy X* or *Path of Exile*, but simpler overall: **buying nodes opens further nodes**.
- Nodes include actual skills, weapon improvements, HP, and other character upgrades. The board takes over the growth previously provided by level-ups.
- Bosses and monster challenges may award skill points directly.
- **Respeccing is available between runs**, including before each new run, without a restrictive limit. It costs a modest amount of **Gold, scaling with the player's total skill points**. This should remain a useful recurring Gold sink without becoming painful or discouraging experimentation.
- Skill-board branches, prerequisites, and individual nodes will be designed later in their own collection of Markdown files.
- Barracks upgrades unlock additional portions of the board.

## Monster achievements and stage skipping

- The working proposal gives **stages 1–20** multiple achievements per monster. Main stages **21–40** remain unskippable, preserving an endgame to fight through. The cutoff is not final.
- Achievements grant specific permanent rewards, such as skill points, equipment/skill unlocks, or other permanent improvements.
- Illustrative Slime challenges: repeated kills, a very fast kill, or a kill without active input. Specific challenges and rewards are not final.
- **Tracking begins only after the Quest board and relevant achievement options unlock.** Previous kills and feats do not count retroactively. A locked facility tracks nothing.
- Completing all achievements for a stage permanently skips it **only once every earlier stage is also skipped**. Skipping progresses sequentially.
- Skipped monsters are gone: they cannot be revisited or farmed manually.
- New runs begin at the first non-skipped stage and advance sequentially. There is **no manual farming-target selection**.

## Resources and rewards

The working economy has **two general currencies and three material types** (four materials at most):

| Resource | Intended role | Status |
| --- | --- | --- |
| XP | Spent at the Barracks for permanent skill points | Planned |
| Gold | Equipment purchases/upgrades and Town facilities/upgrades | Planned |
| Metal | Additional currency for purchases/upgrades | Candidate material |
| Leather | Additional currency for purchases/upgrades | Candidate material |
| Wood | Additional currency for purchases/upgrades | Candidate material |
| Silk | Possible fourth material, or replacement for another | Undecided |

- Different monsters drop different materials.
- **Stronger monsters should provide better farming rewards**; older monsters do not need to remain competitive farming targets.
- Runs provide useful resources as they progress, without manually targeting monsters.
- Equipment purchases, equipment upgrades, and Town facilities/upgrades cost **Gold and materials**. These are purchases paid with multiple currencies; **there is no separate crafting system**.
- The Bar unlocks **Gold ↔ XP exchange**, allowing resources to be redirected toward current needs.
- Material identities remain open. Drop rates, purchase costs, and exchange rates are implementation tuning.

## Town

Town is the between-run preparation hub. Its facilities **gate access to gameplay options**; upgrading them unlocks better or additional options.

- The player starts with **only the Inn**.
- Other facilities are **bought with Gold and materials**, and upgrades also cost Gold and materials.
- Intended introduction order: **Inn → Barracks/Smithy → Library → Quest board → Bar**. Whether Barracks or Smithy comes first is undecided.
- This is not necessarily a rigid purchase order: players can potentially buy facilities in another order. At least the Barracks and Smithy receive a tutorial introduction; the exact sequence remains open.

| Facility | Options provided |
| --- | --- |
| Inn | Mostly flavor; present from the start. |
| Barracks | Spend XP to buy skill points and access the skill board; upgrades unlock further board sections. |
| Shop / Smithy | Buy weapons and weapon upgrades; expanded selections unlock additional weapons. |
| Library | View the monster manual, including information useful for elemental matchups. |
| Quest board | Unlock monster-achievement options and begin tracking them; no retroactive credit. |
| Bar | Exchange Gold for XP and XP for Gold. |

- Select the three-weapon loadout and four or five active skills in Town before a run.
- **Consumables are excluded.** Support effects belong in the expanded active-skill selection.
- Facility costs, upgrade tiers, selections, and exchange rates will be worked out during implementation.

## Scope and follow-up documents

The core structural decisions are settled. **Four or five active-skill slots** remains an interface-layout choice.

Detailed skill-board branches and prerequisites will have their own collection of Markdown files. Stage-skipping details, including the final cutoff, achievements, and rewards, will have their own Markdown document. Individual weapons, skills, weapon bursts, statuses, monsters, and the stage-41 superboss belong in separate content documents. These are follow-up design work, not unresolved prerequisites for this overview.

Existing working proposals above are retained as context until their dedicated documents define the details. Facility introduction details, upgrade selections, and material identities can be resolved alongside that work.

Numerical balance is deliberately deferred to implementation, rather than treated as an outstanding prerequisite for starting work.

## Reference to the original game

The original Level 40 provides the starting vocabulary for balancing: HP, Power, weapon damage/hits/cooldowns, skills and statuses, enemy stats, XP, combat timing, and pacing. **Its old numerical curves, level-up schedule, and balance requirements are not binding on Level 40-2.**
