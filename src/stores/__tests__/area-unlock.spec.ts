import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { fieldMonsters } from '@/data/monster/field-monsters'
import { useGameStore } from '@/stores/game'

afterEach(() => {
  vi.useRealTimers()
})

describe('Area/level unlocking', () => {
  it('starts a new game in tutorial-only level 0 with only level 1 unlocked', () => {
    setActivePinia(createPinia())
    const game = useGameStore()

    expect(game.activeLevel).toBe(0)
    expect(game.isTutorialActive).toBe(true)
    expect(game.monster?.combatant.name).toBe('Training Dummy')
    expect(game.isLevelUnlocked(0)).toBe(false)
    expect(game.highestUnlockedLevel).toBe(1)
    expect(game.isLevelUnlocked(1)).toBe(true)
    expect(game.isLevelUnlocked(2)).toBe(false)
    expect(game.isAreaUnlocked('Field')).toBe(true)
    expect(game.isAreaUnlocked('Forest')).toBe(false)
  })

  it('moves from the tutorial to Field 1 without changing progression', () => {
    setActivePinia(createPinia())
    const game = useGameStore()

    game.completeTutorial()

    expect(game.tutorialComplete).toBe(true)
    expect(game.isTutorialActive).toBe(false)
    expect(game.activeArea).toBe('Field')
    expect(game.activeLevel).toBe(1)
    expect(game.highestUnlockedLevel).toBe(1)
    expect(game.monster?.combatant.name).toBe('Slime')
  })

  it('never turns training-dummy wins into normal progression', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()

    game.start()
    vi.advanceTimersByTime(60_000)
    game.stop()

    expect(game.activeLevel).toBe(0)
    expect(game.player.xp).toBe(0)
    expect(game.highestUnlockedLevel).toBe(1)
    expect(game.earnedBadgeIds).toEqual([])
  })

  it('unlocks the next level only after clearing the current frontier, not by farming an old one', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()
    game.activeLevel = 1
    game.startFight(fieldMonsters[0]!)
    game.start()

    vi.advanceTimersByTime(60_000)
    const frontierAfterFirstClear = game.highestUnlockedLevel
    expect(frontierAfterFirstClear).toBeGreaterThan(1)
    expect(game.isLevelUnlocked(2)).toBe(true)

    // activeLevel is still 1 (below the new frontier), so further kills here must not advance it again.
    vi.advanceTimersByTime(60_000)
    expect(game.highestUnlockedLevel).toBe(frontierAfterFirstClear)

    game.stop()
  })

  it('never unlocks past the final level', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()
    game.activeLevel = 40
    game.highestUnlockedLevel = 40

    game.startFight(fieldMonsters[0]!)
    game.start()
    vi.advanceTimersByTime(60_000)
    game.stop()

    expect(game.highestUnlockedLevel).toBe(40)
  })
})
