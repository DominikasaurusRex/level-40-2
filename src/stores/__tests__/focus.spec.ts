import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { fieldMonsters } from '@/data/monster/field-monsters'
import { axe } from '@/data/weapons'
import { useGameStore } from '@/stores/game'

afterEach(() => {
  vi.useRealTimers()
})

describe('Focus Pulse', () => {
  it('charges for three seconds, skips three seconds, and keeps charging across automatic activations', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()
    game.startFight(fieldMonsters[0]!)
    game.start()

    const basicAttack = game.playerState.skills[0]!
    expect(game.focusedSkillId).toBe('basic-attack')
    expect(game.useFocus('basic-attack')).toBe(false)

    vi.advanceTimersByTime(3_000)
    expect(game.focusPulseReady).toBe(true)
    expect(basicAttack.remaining).toBe(basicAttack.cooldown)

    expect(game.useFocus('basic-attack')).toBe(true)
    expect(basicAttack.remaining).toBe(0)
    expect(game.useFocus('basic-attack')).toBe(false)

    vi.advanceTimersByTime(100)
    expect(basicAttack.remaining).toBe(basicAttack.cooldown)
    expect(game.focusChargeMs).toBe(100)
    expect(game.focusPulseReady).toBe(false)

    vi.advanceTimersByTime(2_900)
    expect(game.focusPulseReady).toBe(true)

    // A banked Pulse also survives the next automatic attack instead of restarting with it.
    vi.advanceTimersByTime(basicAttack.remaining)
    expect(basicAttack.remaining).toBe(basicAttack.cooldown)
    expect(game.focusChargeMs).toBe(3_000)
    expect(game.focusPulseReady).toBe(true)

    expect(game.useFocus('basic-attack')).toBe(true)
    expect(basicAttack.remaining).toBe(0)
    game.stop()
  })

  it('preserves absolute charge on a weapon swap and allows immediate Focus changes', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()
    expect(game.restoreSnapshot({
      activeArea: 'Field',
      activeLevel: 5,
      activeWeapon: 'sword',
      level: 2,
      xp: 0,
      skills: ['strike'],
      focusedSkill: 'basic-attack',
      highestUnlockedLevel: 5,
    })).toBe(true)
    game.startFight(fieldMonsters[0]!)
    game.start()

    const basicAttack = game.playerState.skills[0]!
    vi.advanceTimersByTime(750)
    const chargeBeforeSwap = game.focusChargeMs
    expect(chargeBeforeSwap).toBeGreaterThan(0)
    game.equipWeapon(axe)
    expect(game.focusChargeMs).toBe(chargeBeforeSwap)
    expect(game.focusPulseReady).toBe(false)

    vi.advanceTimersByTime(2_500)
    expect(game.focusPulseReady).toBe(true)
    expect(game.useFocus('basic-attack')).toBe(true)
    expect(basicAttack.remaining).toBe(0)

    expect(game.useFocus('strike')).toBe(true)
    expect(game.focusedSkillId).toBe('strike')
    expect(game.useFocus('basic-attack')).toBe(true)
    expect(game.focusedSkillId).toBe('basic-attack')
    expect(game.useFocus('strike')).toBe(true)
    expect(game.focusedSkillId).toBe('strike')
    game.stop()
  })

  it('can spend a ready Pulse to fire an ability while stunned', () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const game = useGameStore()
    game.startFight(fieldMonsters[0]!)
    game.start()

    vi.advanceTimersByTime(3_000)
    expect(game.focusPulseReady).toBe(true)

    const basicAttack = game.playerState.skills[0]!
    game.playerState.statuses.push({ type: 'stun', remaining: 1_000 })
    expect(game.useFocus('basic-attack')).toBe(true)
    expect(basicAttack.remaining).toBe(0)

    vi.advanceTimersByTime(100)
    expect(game.playerState.statuses.some(status => status.type === 'stun')).toBe(true)
    expect(basicAttack.remaining).toBe(basicAttack.cooldown)
    expect(game.focusChargeMs).toBe(0)
    game.stop()
  })
})
