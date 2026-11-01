# Level 40-2 — Current Design Decisions

Working design notes, 2026-11-01. This describes the **sequel**, not the original Level 40. Numbers and undecided mechanics are intentionally left open.

## Core loop

1. In **Town**, prepare equipment, skills, items, and upgrades.
2. **Manually start a run**. Combat proceeds through monsters in stage order, starting at the first stage not permanently skipped.
3. Combat is automatic at its core, but the player is expected to be **considerably more active** than in Level 40. A run can, in principle, continue with little or no input.
4. The run continues **until the character dies**. Death returns the player to Town; there is no automatic restart.
5. Keep permanent unlocks and collected resources, improve the character and equipment, then start another run.

## Combat and weapons

- **All equipped weapons attack automatically**, rather than choosing one weapon to attack with. This avoids a single weapon matchup completely blocking progress (for example, a slow heavy weapon against high evasion).
- The player should have regular opportunities to influence combat. One proposed interaction is **clicking weapon buttons to empower a chosen weapon**.
- The precise empowerment mechanic, frequency of input, and any minigame are **not decided**.
- The old game's combat numbers are only a reference baseline; they are **not** to be preserved.

## Permanent progression and skill board

- **No level-ups during runs** is the current preference, **not yet final**.
- Monsters award **XP**, retained after death. XP is intended to fund **permanent skill points**.
- Skill points are **never lost** and are spent on a branching **skill board**, broadly reminiscent of *Final Fantasy X* or *Path of Exile*, but simpler overall.
- Bosses and monster challenges may award skill points directly.
- Equipment and unlocked skills persist across deaths.
- The exact XP-to-skill-point mechanism, board rules, and whether respecs are possible are **open**.

## Monster achievements and stage skipping

- The current plan is for **stages 1–20** to have multiple achievements per monster. Stages **21–40** would remain unskippable, so even a highly progressed run has an endgame to fight through. The cutoff is a **working proposal**.
- Achievements give **specific permanent rewards**, such as skill points, equipment/skill unlocks, or other permanent improvements.
- Illustrative Slime challenges: defeat it repeatedly (e.g. 10 times), defeat it very quickly (e.g. under 1 second), or defeat it without active input. Example rewards include an extra skill point. These exact challenges and rewards are **not final**.
- When **all achievements** for a stage are completed, that stage becomes **permanently skipped**, but **only if all earlier stages are already skipped**. Skipping must progress sequentially: stage 3 cannot be skipped before stages 1 and 2.
- Skipped monsters are **gone**. They cannot be manually revisited or farmed.
- A new run starts at the **first non-skipped stage**, then advances sequentially until death. There is no manual farming-target selection.

## Resources and rewards

The working economy has **two general currencies and three material types** (four materials at most):

| Resource | Intended role | Status |
| --- | --- | --- |
| XP | Permanent character growth / skill points | Planned |
| Gold | Equipment and Town upgrades | Planned |
| Metal | Equipment crafting/upgrades | Candidate material |
| Leather | Equipment crafting/upgrades | Candidate material |
| Wood | Equipment crafting/upgrades | Candidate material |
| Silk | Possible fourth material, or replacement for another | Undecided |

- Different monsters drop **different materials**.
- **Stronger monsters should provide better farming rewards.** There is no requirement to keep older monsters competitive as farming targets.
- Runs should provide useful resources as they progress; the player need not target particular monsters manually.
- Later in the game, a Town feature such as a **trainer or quest board** may allow **Gold ↔ XP conversion**, letting players redirect resources toward what they need. Unlock conditions and conversion rates are open.
- The exact crafting recipes, material identities, drop rates, and upgrade costs are **not decided**.

## Town

- Town is the between-run preparation hub for **equipment, skills, items, and permanent upgrades**.
- Specific facilities, item systems, and equipment upgrade mechanics remain open.

## Key open design questions

- What exactly does clicking/empowering a weapon do, and how much attention should optimal play require?
- Will in-run leveling be removed completely?
- How does XP become skill points, and how are points allocated or reset?
- Which achievements and permanent rewards belong to each monster?
- Are the first 20 stages the final achievement/skip cutoff?
- Which three materials should be used, and is a fourth necessary?
- How does Gold/XP conversion work?

## Reference to the original game

The original Level 40 provides the starting vocabulary for balancing: HP, Power, weapon damage/hits/cooldowns, skills and status effects, enemy stats, XP, combat timing, and progression pacing. **Its old numerical curves, level-up schedule, and balance requirements are not binding on Level 40-2.**
