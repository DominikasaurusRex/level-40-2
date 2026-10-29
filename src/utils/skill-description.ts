import type { Effect } from '@/types/effects'
import type { Skill } from '@/types/skill'

function describeEffect(effect: Effect): string {
  switch (effect.type) {
    case 'dmg':
      return `Deals ${effect.amount} DMG`
    case 'def':
      return `Gain ${effect.amount} DEF`
    case 'heal':
      return (effect.duration
        ? `Restore ${effect.amount} HP over ${effect.duration / 1000}s`
        : `Restore ${effect.amount} HP`) + (effect.overhealToDamage ? ', with overhealing damaging the enemy' : '')
    case 'bleed':
      return `Deal ${effect.amountPerTick} damage per second for ${effect.duration / 1000}s, ignoring DEF`
    case 'agi':
      return `Gain ${effect.charges} dodge charges`
    case 'invincible':
      return `Become invincible for ${effect.duration / 1000}s`
    case 'stun':
      return `Stun for ${effect.duration / 1000}s`
    case 'curse':
      return `Inflict Curse: reduce healing by ${effect.healingReduction * 100}% for ${effect.duration / 1000}s`
    case 'cleanse':
      return `Remove ${effect.statuses.map(status => status[0]!.toUpperCase() + status.slice(1)).join(' and ')}`
  }
}

function collapseRepeats(descriptions: string[]): string[] {
  const collapsed: { text: string; count: number }[] = []
  for (const text of descriptions) {
    const last = collapsed[collapsed.length - 1]
    if (last?.text === text) last.count++
    else collapsed.push({ text, count: 1 })
  }
  return collapsed.map(({ text, count }) => (count > 1 ? `${text} ×${count}` : text))
}

export function describeSkill(skill: Skill): string {
  const effects = collapseRepeats(skill.effects.map(describeEffect)).join('. ')
  return `${effects}. Cooldown: ${skill.cooldown / 1000}s.`
}
