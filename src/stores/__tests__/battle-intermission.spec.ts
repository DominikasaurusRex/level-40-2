import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { fieldMonsters } from '@/data/monster/field-monsters'
import {
  AREA_RECLAIMED_BANNER_MS,
  DEFEAT_PAUSE_MS,
  RESPAWN_PAUSE_MS,
  VICTORY_PAUSE_MS,
  useGameStore,
} from '@/stores/game'

describe('battle intermission', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('holds a defeated enemy, freezes combat, then plays a fresh enemy entrance', () => {
    const game = useGameStore()
    game.startFight(fieldMonsters[0]!)
    game.start()

    game.monsterState!.hp = 0
    vi.advanceTimersByTime(100)

    expect(game.battlePhase).toBe('victory')
    const defeatedMonsterState = game.monsterState
    const frozenCooldown = game.playerState.skills[0]!.remaining
    const frozenFocus = game.focusChargeMs

    vi.advanceTimersByTime(VICTORY_PAUSE_MS - 100)
    expect(game.battlePhase).toBe('victory')
    expect(game.monsterState).toBe(defeatedMonsterState)
    expect(game.playerState.skills[0]!.remaining).toBe(frozenCooldown)
    expect(game.focusChargeMs).toBe(frozenFocus)
    expect(game.useFocus('basic-attack')).toBe(false)

    vi.advanceTimersByTime(100)
    expect(game.battlePhase).toBe('spawning')
    expect(game.monsterState).not.toBe(defeatedMonsterState)
    expect(game.monsterState!.hp).toBe(game.monsterState!.definition.maxHp)

    vi.advanceTimersByTime(RESPAWN_PAUSE_MS)
    expect(game.battlePhase).toBe('fighting')
    game.stop()
  })

  it('holds a player defeat, then resets both combatants before the entrance', () => {
    const game = useGameStore()
    game.startFight(fieldMonsters[0]!)
    game.start()

    game.playerState.hp = 0
    const defeatedPlayerState = game.playerState
    const defeatedMonsterState = game.monsterState
    vi.advanceTimersByTime(100)

    expect(game.battlePhase).toBe('defeat')
    expect(game.playerState).toBe(defeatedPlayerState)
    expect(game.playerState.hp).toBe(0)

    vi.advanceTimersByTime(DEFEAT_PAUSE_MS)
    expect(game.battlePhase).toBe('spawning')
    expect(game.playerState).not.toBe(defeatedPlayerState)
    expect(game.monsterState).not.toBe(defeatedMonsterState)
    expect(game.playerState.hp).toBe(game.player.combatant.maxHp)

    vi.advanceTimersByTime(RESPAWN_PAUSE_MS)
    expect(game.battlePhase).toBe('fighting')
    game.stop()
  })

  it('keeps the first boss banner visible after the ordinary victory pause', () => {
    const game = useGameStore()
    game.activeLevel = 5
    game.highestUnlockedLevel = 5
    game.startFight(fieldMonsters[4]!)
    game.start()

    game.monsterState!.hp = 0
    vi.advanceTimersByTime(100)
    expect(game.battlePhase).toBe('victory')
    expect(game.hasBadge('Field')).toBe(true)
    expect(game.areaReclaimedEvent?.area).toBe('Field')

    vi.advanceTimersByTime(VICTORY_PAUSE_MS + RESPAWN_PAUSE_MS)
    expect(game.battlePhase).toBe('fighting')
    expect(game.areaReclaimedEvent?.area).toBe('Field')

    vi.advanceTimersByTime(AREA_RECLAIMED_BANNER_MS - VICTORY_PAUSE_MS - RESPAWN_PAUSE_MS)
    expect(game.areaReclaimedEvent).toBeUndefined()

    game.monsterState!.hp = 0
    vi.advanceTimersByTime(100)
    expect(game.battlePhase).toBe('victory')
    vi.advanceTimersByTime(VICTORY_PAUSE_MS)
    expect(game.battlePhase).toBe('spawning')
    game.stop()
  })

  it('finishes the boss reveal before allowing the next fight to progress', () => {
    const game = useGameStore()
    game.activeLevel = 5
    game.highestUnlockedLevel = 5
    game.startFight(fieldMonsters[4]!)
    game.start()

    game.monsterState!.hp = 0
    vi.advanceTimersByTime(100)
    expect(game.areaReclaimedEvent?.area).toBe('Field')
    game.holdCombatForCutscene()

    vi.advanceTimersByTime(AREA_RECLAIMED_BANNER_MS)
    expect(game.areaReclaimedEvent).toBeUndefined()
    expect(game.battlePhase).toBe('fighting')
    const heldMonsterHp = game.monsterState!.hp
    const heldFocusCharge = game.focusChargeMs

    vi.advanceTimersByTime(1000)
    expect(game.monsterState!.hp).toBe(heldMonsterHp)
    expect(game.focusChargeMs).toBe(heldFocusCharge)

    game.releaseCombatFromCutscene()
    vi.advanceTimersByTime(100)
    expect(game.focusChargeMs).toBeGreaterThan(heldFocusCharge)
    game.stop()
  })
})
