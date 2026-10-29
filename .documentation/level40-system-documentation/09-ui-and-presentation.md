# UI & Presentation

The game is drawn as a handheld console. Everything lives inside one scaled container
(`App.vue` fits it to the viewport; on small screens it crops to the console's screen).
No browser automation is used for this project; visuals are checked by hand.

## Screen flow

```text
Start Screen ──Continue──► (load save) ──► Game
     │
     └─New Game (confirm)──► Intro cutscene ──► Level 0 tutorial ──► Field 1 ──► ...
```

Screen changes involving cutscenes fade through black (360ms each way, 920ms for the ending;
instant with reduced motion). The view switches while dark.

- **Start Screen:** Continue, New Game (with confirmation), Credits.
- **Menu** (console button): Player Status (read-only skill tree), download/import save, New Game,
  Credits, save age.
- **Console Home** opens `dominikasaurus.com` in a new tab. Volume buttons change the persisted
  sound volume.

## Main game view

- **AreaTabs:** unlocked area tabs and level tabs; the **BattleCard** shows the area background,
  monster sprite, HP bars, DEF/AGI badges, status bubbles, and combat callouts for monster skills.
- **PlayerTab:** XP bar, the skill list (Basic Attack first, then Strike/Guard/Heal), each row with
  a yellow cooldown bar and, on the focused row, a thin cyan Focus Pulse bar. Clicking a row
  focuses it / spends the Pulse. The weapon picker expands inline in the Basic Attack row.
- **BadgeShelf:** earned badges only (locked ones hidden). Tooltip: area + `+2 Power`.

## Battle rhythm

| Phase | Duration | Notes |
| ----- | -------: | ----- |
| Victory pause | 700ms | combat, cooldowns, and Focus frozen |
| Defeat pause | 900ms | then both combatants reset |
| Enemy entrance | 300ms | after either pause |
| "Area Reclaimed" banner | 3200ms | first boss clear; runs alongside the normal pauses |

Selecting a different encounter slides the old creature out and the new one in from the left;
ordinary respawns use the normal entrance. Level-up, skill tree, and menu overlays always render
above combat banners.

## Animations

Combat effects are visualised as flying icons, and the engine's 370ms impact delay exists so the
icon arrives as the damage lands.

- Player attacks: one attack icon per `dmg` hit, flying from the skill row to the enemy HP bar
  (200ms stagger).
- DEF/AGI: one icon per point from the skill row to the player's DEF/AGI badge (80ms stagger).
- Heals: heart icons (count from `heal-icon-thresholds.ts`) to the player HP bar.
- Bleed / HoT ticks: one icon from the status bubble to the HP bar.
- XP: orbs from the monster to the XP bar; orb count from `xp-orb-thresholds.ts` (visual only).
- Badge earned: reveals at 600% scale in the playfield center, flies to its shelf slot, bounces.
  Not replayed when loaded from a save.

All positions use `offsetLeft/Top` walking because of the outer `scale()` transform.

### Art placement knobs

- Monster: `spriteScale`, `spriteGroundOffset`, `spriteWallOffset` (positive = right),
  `spriteOverflow` (Abyss monsters + Angel only), `xpOrbOffset`, `xpOrbRadius`.
- Area background (`data/area-backgrounds.ts`): `image`, `scale`, `xOffset`, `yOffset`; always
  clipped to the battle scene.

## Tutorials

Both use `TutorialOverlay`: a full-screen layer that blocks all clicks except the Gatekeeper's
dialogue button and, on interactive steps, one spotlighted control.

**Level 0 tutorial** (`tutorialSteps` in `GameWindow.vue`), against the Training Dummy:
introduction → enemy HP → player HP → win/death outcomes → XP bar → skill list → yellow cooldown →
cyan Focus Pulse → *interactive:* click Basic Attack with a full Pulse → complete → `completeTutorial()`
(Field 1) and save.

**Level-up tutorial** at the first skill choice (level 2), guarded by `levelUpTutorialComplete`:
announce → *interactive:* open the skill picker → tree overview → prerequisites/arrows → Power
stat. The flag is set when that level-up is accepted.

## Cutscenes (`data/cutscenes.ts`)

Gatekeeper dialogue scenes (background, portrait, lines):

| Id | Trigger |
| -- | ------- |
| `intro` | New Game, before the tutorial |
| `wolf` | First Field boss clear |
| `dragon` | First Dungeon boss clear |
| `credits` | First Abyss boss clear → ending screen ("FIN") → Continue back to the game |

Boss scenes wait for the reclaimed banner and badge reveal; combat is held meanwhile
(`holdCombatForCutscene`). Closing a boss scene starts a fresh fight (full HP, cleared
statuses, reset cooldowns). The ending is shown only once and is not replayable. The Credits
button (attribution list, `CreditsModal`) is unrelated to the `credits` cutscene.

## Sound (`audio/sounds.ts`)

Preloaded clips with a small reusable pool per clip: `normal-click`, `hardware-click`, `close`,
`error-click`, `focus`, `level-up`, `boss` (selecting a boss level), `outro`, `badge-drop`,
`reclaimed`. Default volume 60, persisted in `localStorage`.

## Assets (`public/`)

```text
areas/        area backgrounds (*_bg.webp)
badge/        badge_<area>.webp
cutscene/     gate_bg.webp, guard.png (Gatekeeper), fin.webp
enemies/<area>/  monster sprites (+ tutorial/dummy.png)
icons/        combat icons (attack, defense, agi, heal, bleed, curse, stun, invincibility, ...)
icons/weapons/   dagger1-6, sword1-6, axe1-6
skills/       skill tree node icons
audio/ui/     UI sounds
credits/      credit logos
```
