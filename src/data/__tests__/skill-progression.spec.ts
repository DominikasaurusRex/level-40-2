import { describe, expect, it } from 'vitest'
import {
  iconForPlayerSkill,
  isSkillChoiceAvailable,
  skillsForPlayer,
  skillTreeChoices,
} from '@/data/skill-progression'
import type { Player } from '@/types/player'

function playerWithSkills(ownedSkillChoiceIds: string[], power = 5): Player {
  const weapon = { name: 'Test Sword', damage: 1, cooldown: 3000, slot: 'sword' as const }
  return {
    level: 16,
    xp: 0,
    power,
    ownedSkillChoiceIds,
    weapons: [weapon],
    equippedWeaponSlot: 'sword',
    combatant: { name: 'Player', maxHp: 100, weapon, skills: [] },
  }
}

describe('skill tree progression', () => {
  it('uses the requested icon priority within each Player skill family', () => {
    expect(iconForPlayerSkill('heal', ['heal-safeguard', 'heal-cleanse', 'heal']))
      .toBe('/skills/offensive_care.png')
    expect(iconForPlayerSkill('guard', ['guard-recovery', 'guard-counter', 'guard']))
      .toBe('/skills/recovery.png')
    expect(iconForPlayerSkill('strike', ['strike-stun', 'strike-bleed', 'strike']))
      .toBe('/skills/stunning_strike.png')
    expect(iconForPlayerSkill('heal', ['heal', 'heal-greater', 'heal-quick']))
      .toBe('/skills/quick_heal.png')
    expect(iconForPlayerSkill('basic-attack', ['strike'])).toBeUndefined()
  })

  it('matches the complete Draw.io prerequisite graph', () => {
    const prerequisites = Object.fromEntries(
      skillTreeChoices.map(choice => [choice.id, choice.prerequisiteIds]),
    )

    expect(prerequisites).toEqual({
      strike: [],
      guard: [],
      heal: [],
      'strike-quick': ['strike'],
      'strike-power': ['strike'],
      'guard-fortify': ['guard'],
      'guard-evasion': ['guard'],
      'guard-quick': ['guard'],
      'heal-greater': ['heal'],
      'heal-quick': ['heal'],
      'strike-double': ['strike-quick'],
      'guard-counter': ['strike-power', 'guard-fortify'],
      'guard-recovery': ['guard-quick', 'heal-greater'],
      'heal-regeneration': ['heal-quick'],
      'strike-bleed': ['strike-double'],
      'strike-stun': ['guard-counter'],
      'heal-safeguard': ['guard-recovery'],
      'heal-cleanse': ['heal-regeneration'],
    })
  })

  it('requires every incoming branch before a joined node becomes available', () => {
    expect(isSkillChoiceAvailable('guard-counter', ['strike-power'])).toBe(false)
    expect(isSkillChoiceAvailable('guard-counter', ['guard-fortify'])).toBe(false)
    expect(isSkillChoiceAvailable('guard-counter', ['strike-power', 'guard-fortify'])).toBe(true)

    expect(isSkillChoiceAvailable('guard-recovery', ['guard-quick'])).toBe(false)
    expect(isSkillChoiceAvailable('guard-recovery', ['heal-greater'])).toBe(false)
    expect(isSkillChoiceAvailable('guard-recovery', ['guard-quick', 'heal-greater'])).toBe(true)
  })

  it('offers roots immediately and never offers an already-owned node', () => {
    expect(isSkillChoiceAvailable('strike', [])).toBe(true)
    expect(isSkillChoiceAvailable('guard', [])).toBe(true)
    expect(isSkillChoiceAvailable('heal', [])).toBe(true)
    expect(isSkillChoiceAvailable('strike-power', [])).toBe(false)
    expect(isSkillChoiceAvailable('strike', ['strike'])).toBe(false)
  })

  it('keeps Double Strike at 80% total direct damage rounded up across Power tiers', () => {
    for (const power of [3, 4, 5, 6, 7, 8]) {
      const [strike] = skillsForPlayer(playerWithSkills(['strike', 'strike-double'], power))
      const hits = strike!.effects.filter(effect => effect.type === 'dmg')
      const damage = hits.reduce((total, effect) => total + effect.amount, 0)

      expect(hits).toHaveLength(2)
      expect(damage).toBe(Math.ceil(power * 3 * 0.8))
    }
  })

  it('scales Strike and Power Strike to their described Power multipliers', () => {
    for (const power of [1, 5, 10, 20]) {
      const [strike] = skillsForPlayer(playerWithSkills(['strike'], power))
      const [powerStrike] = skillsForPlayer(playerWithSkills(['strike', 'strike-power'], power))
      expect(strike!.effects[0]).toMatchObject({ type: 'dmg', amount: power * 3 })
      expect(powerStrike!.effects[0]).toMatchObject({ type: 'dmg', amount: power * 4 })
    }
  })

  it('makes Fortify double the full Guard DEF amount', () => {
    for (const power of [1, 5, 10, 20]) {
      const [guard] = skillsForPlayer(playerWithSkills(['guard'], power))
      const [fortifiedGuard] = skillsForPlayer(playerWithSkills(['guard', 'guard-fortify'], power))
      expect(guard!.effects[0]).toMatchObject({ type: 'def', amount: power + 2 })
      expect(fortifiedGuard!.effects[0]).toMatchObject({ type: 'def', amount: (power + 2) * 2 })
    }
  })

  it('makes Greater Heal double the instant Heal amount', () => {
    for (const power of [1, 5, 10, 20]) {
      const [heal] = skillsForPlayer(playerWithSkills(['heal'], power))
      const [greaterHeal] = skillsForPlayer(playerWithSkills(['heal', 'heal-greater'], power))
      expect(heal!.effects[0]).toMatchObject({ type: 'heal', amount: power + 2 })
      expect(greaterHeal!.effects[0]).toMatchObject({ type: 'heal', amount: (power + 2) * 2 })
    }
  })

  it('applies Offensive Care to Heal, Regeneration, and Recovery', () => {
    const skills = skillsForPlayer(playerWithSkills([
      'guard',
      'guard-quick',
      'heal',
      'heal-greater',
      'guard-recovery',
      'heal-safeguard',
      'heal-quick',
      'heal-regeneration',
    ]))
    const guard = skills.find(skill => skill.id === 'guard')!
    const heal = skills.find(skill => skill.id === 'heal')!
    const recovery = guard.traits?.find(trait => trait.type === 'recovery')

    expect(heal.effects.filter(effect => effect.type === 'heal')).toHaveLength(2)
    for (const effect of heal.effects.filter(effect => effect.type === 'heal')) {
      expect(effect).toMatchObject({ overhealToDamage: true })
    }
    expect(heal.effects.some(effect => effect.type === 'def')).toBe(false)
    expect(recovery).toMatchObject({ type: 'recovery', amount: 7, overhealToDamage: true })
  })
})
