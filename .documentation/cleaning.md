# Cleaning up the original code

Plan for turning the imported Level 40 code into a clean starting point for Level 40 2. The
original code stays available in git history (commit `d2873c1`, "added the original level-40
code"), so nothing removed here is lost.

## Reusable

### Keep as is (or nearly)

| Part | Files | Notes |
| ---- | ----- | ----- |
| Console shell | `App.vue`, `ConsoleShell.vue`, `ConsoleScreen.vue`, `ConsoleDPad.vue`, `ConsoleActionButtons.vue`, `console-control-well.css` | Already adjusted for Level 40 2: wider screen, reshaped outline, no SELECT, bigger HOME/START/volume, mobile mode. |
| Start screen | `StartScreen.vue`, `NewGameConfirmation.vue`, `StartingGiftPrompt.vue` | Continue disabled without a save; New Game flow with the original-save import. Title text still says "Level 40". |
| Credits dialog | `CreditsModal.vue` | Contents will change as assets change (see `credits.md`). Still has the "Inc.." typo. |
| In-game menu | `MenuModal.vue` | Opened by START. Download/import save, New Game, Credits, save age stay. Its "Player Status" (old skill tree) goes. |
| Save and load | `stores/save.ts` | localStorage, autosave, `pagehide` save, base64 export/import, `hasStoredGame()`, `parseOriginalSave()`. Only the snapshot contents (from `game.ts`) change. |
| Shared UI pieces | `MenuButton.vue`, `ModalCloseButton.vue` | |
| Sound | `audio/sounds.ts` | Clip list will change; the system stays. |
| Dialogue and tutorials | `CutsceneScreen.vue`, `TutorialOverlay.vue` | Mechanism reusable for Town NPCs and facility tutorials. The scene/step content goes. |
| Animation layers | `FlyingIconLayer.vue`, `XpOrbLayer.vue`, `CombatBubble.vue` | XP still exists; icons will need new types (elements, Barrier, Poison, ...). |
| Ending screen | `EndingScreen.vue` | Could show "Fin?" / "Fin!". |

### Keep the skeleton, rework the inside

| Part | Files | What survives | What changes |
| ---- | ----- | ------------- | ------------ |
| Combat engine | `combat/engine.ts` | Tick loop, cooldowns, staggered multi-hits, Stun, AGI charges, heal-over-time (→ Regeneration), hooks | The old `def` pool becomes **Shield**. New: damage types and responses, flat DEF with split/overflow, Barrier, Absorb, Poison (replaces Bleed), new Curse (delayed reflection). Counter/Recovery/Offensive Care go. |
| Combat types | `types/combatant.ts`, `types/effects.ts`, `types/weapon.ts`, `types/skill.ts`, `types/monster.ts` | Combatant model (player and monsters share it) | Weapons get Physical + one element; player has 3 weapon attacks plus 3 active skills instead of one basic attack. |
| Battle view | `BattleCard.vue` | Monster sprite, HP bars, status display | Element/Barrier/Shield display. |
| Player panel | `PlayerTab.vue` | Skill rows with cooldown bars | 3 weapons + active skills; Focus Pulse becomes the weapon empowerment bar/burst. |
| Simulator | `combat/simulator.ts` | One engine for game and simulator | Simulates runs instead of farming one monster. |
| Main view | `GameWindow.vue` | Screen layout, fades, overlay wiring | Tutorial steps, level-up and skill-tree wiring, area tabs, badges go. |
| Game store | `stores/game.ts` | Tick, battle phases, animation event queues, original-save flags | Level/XP curves, level-ups, areas, badges, skill choices go; run and Town state come in. |
| Monster data | `data/monster/forest-, cave-monsters.ts` | Data shape, the ten reused monsters (stages 1–10) | All stats retuned, elements added. |
| Engine tests | `combat/__tests__/engine.spec.ts` | Test style | Rewritten for the new rules. |

## Not reusable

| Part | Files |
| ---- | ----- |
| Level-ups | `LevelUpModal.vue`, `data/player-xp-curve.ts`, `data/player-hp-curve.ts`, `data/player-power-curve.ts` |
| Old skill tree | `SkillTreeModal.vue`, `SkillTreeHelpModal.vue`, `SkillRow.vue`, `SkillDescription.vue`, `utils/skill-description.ts`, `data/skill-progression.ts`, `types/skill-progression.ts`, `data/__tests__/skill-progression.spec.ts` |
| Area/level selection | `AreaTabs.vue`, `data/areas.ts` (8 old areas), `data/area-backgrounds.ts` (rebuild for new areas) |
| Badges | `BadgeShelf.vue`, `data/badges.ts` |
| Old weapons | `data/weapons.ts` (Power formula, level-based tiers), `data/__tests__/weapons.spec.ts` |
| Focus Pulse | `data/focus.ts`, `stores/__tests__/focus.spec.ts` |
| Old monsters | `data/monster/tutorial-monster.ts` (the other unused monster files are already deleted) |
| Balance suite | all of `src/balance/` (scenarios, `mandatory-clear.ts`, every `__tests__` spec) |
| Old store tests | `stores/__tests__/area-unlock.spec.ts`, `skill-choice.spec.ts`; `battle-intermission.spec.ts` and `save.spec.ts` need rewriting |
| Old cutscenes | `data/cutscenes.ts` content (`intro`, `wolf`, `dragon`, `credits`) |
| Small data | `data/player.ts`, `data/xp-orb-thresholds.ts`, `data/heal-icon-thresholds.ts` (check while reworking) |
| Assets | `public/areas/` for the old areas, `public/badge/`, `public/cutscene/` (Gatekeeper may stay). The original enemy sprites are already gone. |

Assets are optional to remove early; they don't affect the build.

## How to remove them

1. **Delete the pure leftovers first**: the balance suite, level-up, skill tree, area tabs, badges,
   old weapons, Focus Pulse, the Dungeon/Hell/Abyss monsters, and their tests. Nothing reusable
   depends on them except `game.ts`, `GameWindow.vue`, `PlayerTab.vue`, and `MenuModal.vue`.
2. **Cut `game.ts` down** to what survives: tick, battle phases, animation queues, snapshot with
   the original-save flags. Everything level/area/badge-related goes.
3. **Fix the dependents**: remove the now-missing imports and template parts from
   `GameWindow.vue`, `PlayerTab.vue`, and `MenuModal.vue` (Player Status).
4. **Run `npm run type-check`** until it passes. That finds every leftover reference.
5. **Clean up around the code**:
   - `package.json`: remove the `balance:*` scripts; rename `"name": "level-40"`.
   - `index.html`: title still says "Level 40".
   - `CLAUDE.md`: commands and current state.
6. **Assets last**, once the monster rosters are decided.

The game will not be playable in between. That is expected: it cannot play as Level 40 2 yet anyway.
