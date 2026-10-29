# Saving

Source: `src/stores/save.ts` (persistence) and `createSnapshot()` / `restoreSnapshot()` in
`src/stores/game.ts`.

## What is saved

Only stable progression. Everything derivable is rebuilt on load.

```ts
{
  version: 1,
  savedAt: '2026-01-01T12:00:00.000Z',
  activeArea: 'Forest',
  activeLevel: 8,
  activeWeapon: 'dagger' | 'sword' | 'axe',
  level: 9,
  xp: 340,
  skills: ['strike', 'strike-power', ...],   // owned skill-choice ids
  focusedSkill: 'basic-attack',
  highestUnlockedLevel: 9,
  badges: ['Field'],                          // area names
  tutorialComplete: true,
  levelUpTutorialComplete: true,
}
```

**Not saved (transient):** HP, DEF, AGI, statuses, cooldowns, Focus charge, current monster
state, level-up dialogs, animation queues. Loading always starts a fresh fight.

## Storage

- `localStorage` key `level-40.save`, JSON. `SAVE_FORMAT_VERSION = 1`; other versions are rejected.
- **Autosave** every 60s, plus on `pagehide` and when the save session stops.
- The menu shows "Saved Ns ago" (`secondsSinceSave`) and any `saveError`.
- **Export:** menu → download `level-40-YYYY-MM-DD.sav` = Base64 of the same JSON.
- **Import:** reads a `.sav`, Base64-decodes, validates, restores, then saves immediately.
- **New game:** `reset()` restores defaults and saves immediately.
- Sound volume is stored separately (`level-40.sound-volume`).

## Restore rules

`restoreSnapshot()` validates and repairs instead of trusting the file:

- `level` must be an integer 1–30 and `xp` ≥ 0, otherwise the save is rejected. XP above the
  next threshold is kept (one level-up per kill can leave a surplus).
- Max HP, Power, weapons, and skills are recomputed from level, badges, and skill ids.
- Unknown skill ids, unknown badges, and duplicates are dropped. Invalid weapon → Sword.
  Unknown focused skill → Basic Attack.
- If the save has fewer skills than the skill-choice levels already reached (saved during an open
  level-up dialog), the missing choices are re-queued as level-up dialogs.
- `highestUnlockedLevel` is clamped to 1–40; the active level is clamped to the frontier.
- Missing `tutorialComplete` counts as complete (older saves). An unfinished tutorial reloads into
  Level 0.
- `levelUpTutorialComplete` is forced true for any save above level 1.

## Flow

The Start Screen owns initial loading: **Continue** loads the save (or starts a new game if none
or invalid); **New Game** asks for confirmation. Combat and autosave only run after the start
screen is left.
