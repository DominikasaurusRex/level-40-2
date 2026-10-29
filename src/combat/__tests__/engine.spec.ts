import { describe, expect, it } from 'vitest'
import type { CombatantDefinition } from '@/types/combatant'
import { createCombatantState } from '@/types/combatant'
import type { Skill } from '@/types/skill'
import { advanceFight, type FightOutcome } from '@/combat/engine'

const TICK_MS = 100
const INERT_WEAPON = { name: 'Wait', damage: 0, cooldown: 60000 }

function combatant(name: string, maxHp: number, skills: Skill[] = []): CombatantDefinition {
  return {
    name,
    maxHp,
    weapon: INERT_WEAPON,
    skills,
  }
}

function activeSkill(id: string, effects: Skill['effects'], cooldown = 1000): Skill {
  return { id, name: id, category: 'attack', cooldown, startsReady: true, effects }
}

function advanceTicks(
  player: ReturnType<typeof createCombatantState>,
  foe: ReturnType<typeof createCombatantState>,
  ticks: number,
): FightOutcome {
  let outcome: FightOutcome = 'ongoing'
  for (let i = 0; i < ticks && outcome === 'ongoing'; i += 1) {
    outcome = advanceFight(player, foe, TICK_MS)
  }
  return outcome
}

describe('advanceFight', () => {
  it('uses initialDelay only for the first skill activation', () => {
    const timedSkill: Skill = {
      id: 'timed',
      name: 'Timed',
      category: 'attack',
      initialDelay: 300,
      cooldown: 1000,
      effects: [],
    }
    const player = createCombatantState(combatant('Player', 10, [timedSkill]))
    const foe = createCombatantState(combatant('Foe', 10))
    const firedAt: number[] = []

    for (let elapsed = TICK_MS; elapsed <= 1400; elapsed += TICK_MS) {
      advanceFight(player, foe, TICK_MS, {
        onPlayerSkillFired: skill => {
          if (skill.id === 'timed') firedAt.push(elapsed)
        },
      })
    }

    expect(firedAt).toEqual([300, 1300])
  })

  it('lands a fired effect only after the shared icon-travel delay', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('hit', [{ type: 'dmg', amount: 3 }], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))

    advanceTicks(player, foe, 4)
    expect(foe.hp).toBe(10)

    advanceTicks(player, foe, 1)
    expect(foe.hp).toBe(7)
  })

  it('resolves AGI before DEF and DEF before HP', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('hit', [{ type: 'dmg', amount: 8 }]),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))
    foe.agiCharges = 1
    foe.def = 5

    advanceTicks(player, foe, 5)
    expect(foe.agiCharges).toBe(0)
    expect(foe.def).toBe(5)
    expect(foe.hp).toBe(10)

    advanceTicks(player, foe, 10)
    expect(foe.def).toBe(0)
    expect(foe.hp).toBe(7)
  })

  it('counters with the full incoming hit when that hit consumes the remaining Shield', () => {
    const guard: Skill = {
      id: 'guard',
      name: 'Guard',
      category: 'guard',
      cooldown: 60000,
      effects: [],
      traits: [{ type: 'counter' }],
    }
    const player = createCombatantState(combatant('Player', 10, [guard]))
    const foe = createCombatantState(combatant('Foe', 20, [
      activeSkill('hit', [{ type: 'dmg', amount: 8 }], 60000),
    ]))
    player.def = 2

    advanceTicks(player, foe, 9)

    expect(player.def).toBe(0)
    expect(player.hp).toBe(4)
    expect(foe.hp).toBe(12)
  })

  it('applies Bleed directly to HP without consuming DEF', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('bleed', [
        { type: 'bleed', amountPerTick: 2, tickInterval: 1000, duration: 2000 },
      ], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))
    foe.def = 20

    advanceTicks(player, foe, 19)

    expect(foe.hp).toBe(8)
    expect(foe.def).toBe(20)
  })

  it('reduces healing while Curse is active', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('heal', [{ type: 'heal', amount: 4 }], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))
    player.hp = 4
    player.statuses.push({ type: 'curse', remaining: 5000, healingReduction: 0.5 })

    advanceTicks(player, foe, 6)

    expect(player.hp).toBe(6)
    expect(player.statuses.some(status => status.type === 'curse')).toBe(true)
  })

  it('lets Cleanse remove Curse and Bleed before later healing lands', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('cleanse-heal', [
        { type: 'cleanse', statuses: ['bleed', 'curse'] },
        { type: 'heal', amount: 4 },
      ], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))
    player.hp = 4
    player.statuses.push(
      { type: 'curse', remaining: 5000, healingReduction: 0.5 },
      { type: 'bleed', remaining: 5000, amountPerTick: 1, tickInterval: 1000, sinceLastTick: 0 },
    )

    advanceTicks(player, foe, 7)

    expect(player.hp).toBe(8)
    expect(player.statuses.some(status => status.type === 'curse' || status.type === 'bleed')).toBe(false)
  })

  it('lets the player finish first when both queued attacks would be lethal', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('player-hit', [{ type: 'dmg', amount: 10 }], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10, [
      activeSkill('foe-hit', [{ type: 'dmg', amount: 10 }], 60000),
    ]))

    const outcome = advanceTicks(player, foe, 5)

    expect(outcome).toBe('monster-defeated')
    expect(player.hp).toBe(10)
    expect(foe.hp).toBe(0)
  })

  it('turns only healing past maximum HP into Offensive Care damage', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('heal', [{ type: 'heal', amount: 4, overhealToDamage: true }], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))
    player.hp = 8

    advanceTicks(player, foe, 6)

    expect(player.hp).toBe(10)
    expect(foe.hp).toBe(8)
  })

  it('turns Regeneration overhealing into Offensive Care damage', () => {
    const player = createCombatantState(combatant('Player', 10, [
      activeSkill('heal', [
        { type: 'heal', amount: 4, duration: 2000, overhealToDamage: true },
      ], 60000),
    ]))
    const foe = createCombatantState(combatant('Foe', 10))

    advanceTicks(player, foe, 30)

    expect(player.hp).toBe(10)
    expect(foe.hp).toBe(6)
  })

  it('turns Recovery overhealing into Offensive Care damage', () => {
    const guard: Skill = {
      id: 'guard',
      name: 'Guard',
      category: 'guard',
      cooldown: 60000,
      effects: [],
      traits: [{ type: 'recovery', amount: 4, overhealToDamage: true }],
    }
    const player = createCombatantState(combatant('Player', 10, [guard]))
    const foe = createCombatantState(combatant('Foe', 10, [
      activeSkill('hit', [{ type: 'dmg', amount: 2 }], 60000),
    ]))
    player.def = 2

    advanceTicks(player, foe, 9)

    expect(player.hp).toBe(10)
    expect(foe.hp).toBe(6)
  })
})
