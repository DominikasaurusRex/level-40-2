import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { skillTreeChoices } from '@/data/skill-progression'
import { useGameStore, type GameSnapshot } from '@/stores/game'

function levelTwoSnapshot(): GameSnapshot {
  return {
    activeArea: 'Field',
    activeLevel: 1,
    activeWeapon: 'sword',
    level: 2,
    xp: 0,
    skills: [],
    focusedSkill: 'basic-attack',
    highestUnlockedLevel: 1,
    badges: [],
  }
}

describe('skill-choice level ups', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the complete tree and rejects locked choices in the store', () => {
    const game = useGameStore()
    expect(game.restoreSnapshot(levelTwoSnapshot())).toBe(true)
    expect(game.levelUpEvent?.skillChoices).toHaveLength(skillTreeChoices.length)

    expect(game.acceptLevelUp('guard-counter')).toBe(false)
    expect(game.levelUpEvent).toBeDefined()
    expect(game.player.ownedSkillChoiceIds).toEqual([])

    expect(game.acceptLevelUp('strike')).toBe(true)
    expect(game.levelUpEvent).toBeUndefined()
    expect(game.player.ownedSkillChoiceIds).toEqual(['strike'])
  })
})
