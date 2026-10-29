import type {Player} from '@/types/player'
import type {Skill} from '@/types/skill'
import type {SkillChoice} from '@/types/skill-progression'

export const skillChoiceLevels = new Set([2, 3, 5, 8, 11, 16, 21, 25, 27, 30])

export const skillTreeChoices: SkillChoice[] = [
  {
    id: 'strike',
    family: 'attack',
    kind: 'baseline',
    name: 'Strike',
    description: 'Learn Strike: deals 3x Power as DMG. Cooldown: 8s.',
    icon: '/skills/strike.png',
    prerequisiteIds: [],
    position: {x: 123, y: 55},
  },
  {
    id: 'guard',
    family: 'defense',
    kind: 'baseline',
    name: 'Guard',
    description: 'Learn Guard: gain Power + 2 Shield. Cooldown: 10s.',
    icon: '/skills/guard.png',
    prerequisiteIds: [],
    position: {x: 417, y: 60},
  },
  {
    id: 'heal',
    family: 'heal',
    kind: 'baseline',
    name: 'Heal',
    description: 'Learn Heal: restore Power + 2 HP. Cooldown: 12s.',
    icon: '/skills/heal.png',
    prerequisiteIds: [],
    position: {x: 703, y: 60},
  },
  {
    id: 'strike-quick',
    family: 'attack',
    kind: 'upgrade',
    name: 'Quick Strike',
    description: 'Reduce Strike cooldown from 8s to 6s.',
    icon: '/skills/quick_strike.png',
    prerequisiteIds: ['strike'],
    position: {x: 60, y: 180}
  },
  {
    id: 'strike-power',
    family: 'attack',
    kind: 'upgrade',
    name: 'Power Strike',
    description: 'Increase Strike from 3x to 4x Power.',
    icon: '/skills/power_strike.png',
    prerequisiteIds: ['strike'],
    position: {x: 180, y: 180}
  },
  {
    id: 'guard-fortify',
    family: 'defense',
    kind: 'upgrade',
    name: 'Fortify',
    description: 'Double the Shield gained from Guard.',
    icon: '/skills/fortify.png',
    prerequisiteIds: ['guard'],
    position: {x: 300, y: 180}
  },
  {
    id: 'guard-evasion',
    family: 'defense',
    kind: 'upgrade',
    name: 'Evasion',
    description: 'Guard also grants 1 Evasion.',
    icon: '/skills/evasion.png',
    prerequisiteIds: ['guard'],
    position: {x: 417, y: 180}
  },
  {
    id: 'guard-quick',
    family: 'defense',
    kind: 'upgrade',
    name: 'Quick Guard',
    description: 'Reduce Guard cooldown from 10s to 8s.',
    icon: '/skills/quick_guard.png',
    prerequisiteIds: ['guard'],
    position: {x: 530, y: 180}
  },
  {
    id: 'heal-greater',
    family: 'heal',
    kind: 'upgrade',
    name: 'Greater Heal',
    description: 'Double the HP restored by Heal.',
    icon: '/skills/greater_heal.png',
    prerequisiteIds: ['heal'],
    position: {x: 640, y: 180}
  },
  {
    id: 'heal-quick',
    family: 'heal',
    kind: 'upgrade',
    name: 'Quick Heal',
    description: 'Reduce Heal cooldown from 12s to 9s.',
    icon: '/skills/quick_heal.png',
    prerequisiteIds: ['heal'],
    position: {x: 760, y: 180}
  },
  {
    id: 'strike-double',
    family: 'attack',
    kind: 'upgrade',
    name: 'Double Strike',
    description: 'Strike becomes two hits dealing 80% total DMG.',
    icon: '/skills/double_strike.png',
    prerequisiteIds: ['strike-quick'],
    position: {x: 60, y: 280}
  },
  {
    id: 'guard-counter',
    family: 'defense',
    kind: 'upgrade',
    name: 'Counter',
    description: 'When Shield is fully consumed, deal the final hit\'s full pre-Shield DMG.',
    icon: '/skills/counter.png',
    prerequisiteIds: ['strike-power', 'guard-fortify'],
    position: {x: 260, y: 280}
  },
  {
    id: 'guard-recovery',
    family: 'defense',
    kind: 'upgrade',
    name: 'Recovery',
    description: 'Restore HP when Shield is fully consumed.',
    icon: '/skills/recovery.png',
    prerequisiteIds: ['guard-quick', 'heal-greater'],
    position: {x: 570, y: 280}
  },
  {
    id: 'heal-regeneration',
    family: 'heal',
    kind: 'upgrade',
    name: 'Regeneration',
    description: 'Heal also restores Power + 3 HP over 4s.',
    icon: '/skills/regeneration.png',
    prerequisiteIds: ['heal-quick'],
    position: {x: 760, y: 290}
  },
  {
    id: 'strike-bleed',
    family: 'attack',
    kind: 'upgrade',
    name: 'Bleeding Strike',
    description: 'Strike also inflicts Bleed for 4s.',
    icon: '/skills/bleeding_strike.png',
    prerequisiteIds: ['strike-double'],
    position: {x: 60, y: 380}
  },
  {
    id: 'strike-stun',
    family: 'attack',
    kind: 'upgrade',
    name: 'Stunning Strike',
    description: 'Strike also Stuns for 1.5s.',
    icon: '/skills/stunning_strike.png',
    prerequisiteIds: ['guard-counter'],
    position: {x: 260, y: 380}
  },
  {
    id: 'heal-safeguard',
    family: 'heal',
    kind: 'upgrade',
    name: 'Offensive Care',
    description: 'Healing beyond maximum HP damages the enemy.',
    icon: '/skills/offensive_care.png',
    prerequisiteIds: ['guard-recovery'],
    position: {x: 570, y: 380}
  },
  {
    id: 'heal-cleanse',
    family: 'heal',
    kind: 'upgrade',
    name: 'Cleanse',
    description: 'Heal removes Bleed and Curse.',
    icon: '/skills/cleans.png',
    prerequisiteIds: ['heal-regeneration'],
    position: {x: 760, y: 380}
  },
]

const skillChoicesById = new Map(skillTreeChoices.map(choice => [choice.id, choice]))
const skillChoiceIds = new Set(skillChoicesById.keys())

// Priority for the icon shown on each learned skill in the Player panel.
const playerSkillIconOrder: Record<'heal' | 'guard' | 'strike', readonly string[]> = {
  heal: ['heal', 'heal-greater', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-safeguard'],
  guard: ['guard', 'guard-evasion', 'guard-fortify', 'guard-quick', 'guard-counter', 'guard-recovery'],
  strike: ['strike', 'strike-quick', 'strike-power', 'strike-double', 'strike-bleed', 'strike-stun'],
}

export function iconForPlayerSkill(skillId: string, ownedIds: Iterable<string>): string | undefined {
  if (skillId !== 'heal' && skillId !== 'guard' && skillId !== 'strike') return undefined
  const owned = new Set(ownedIds)
  const order = playerSkillIconOrder[skillId]
  for (let index = order.length - 1; index >= 0; index--) {
    const choiceId = order[index]!
    if (owned.has(choiceId)) return skillChoicesById.get(choiceId)?.icon
  }
  return undefined
}

export function isSkillChoiceId(value: string): boolean {
  return skillChoiceIds.has(value)
}

export function isSkillChoiceAvailable(choiceId: string, ownedIds: Iterable<string>): boolean {
  const choice = skillChoicesById.get(choiceId)
  if (!choice) return false

  const owned = new Set(ownedIds)
  return !owned.has(choiceId) && choice.prerequisiteIds.every(prerequisiteId => owned.has(prerequisiteId))
}

export function skillsForPlayer(player: Player): Skill[] {
  const owned = new Set(player.ownedSkillChoiceIds)
  const skills: Skill[] = []

  if (owned.has('strike')) skills.push(buildStrike(owned, player.power))
  if (owned.has('guard')) skills.push(buildGuard(owned, player.power))
  if (owned.has('heal')) skills.push(buildHeal(owned, player.power))

  return skills
}

function buildStrike(owned: Set<string>, power: number): Skill {
  const multiplier = owned.has('strike-power') ? 4 : 3
  const totalDamage = power * multiplier
  const doubleStrikeDamage = Math.ceil(totalDamage * 0.8)
  const directDamage = owned.has('strike-double')
    ? [
      {type: 'dmg' as const, amount: Math.ceil(doubleStrikeDamage / 2)},
      {type: 'dmg' as const, amount: Math.floor(doubleStrikeDamage / 2)},
    ]
    : [{type: 'dmg' as const, amount: totalDamage}]

  return {
    id: 'strike',
    name: 'Strike',
    category: 'attack',
    cooldown: owned.has('strike-quick') ? 6000 : 8000,
    effects: [
      ...directDamage,
      ...(owned.has('strike-bleed')
        ? [{
          type: 'bleed' as const,
          amountPerTick: Math.max(1, Math.round(power / 3)),
          tickInterval: 1000,
          duration: 4000
        }]
        : []),
      ...(owned.has('strike-stun') ? [{type: 'stun' as const, duration: 1500}] : []),
    ],
  }
}

function buildGuard(owned: Set<string>, power: number): Skill {
  return {
    id: 'guard',
    name: 'Guard',
    category: 'guard',
    cooldown: owned.has('guard-quick') ? 8000 : 10000,
    effects: [
      {type: 'def', amount: owned.has('guard-fortify') ? power * 2 + 4 : power + 2},
      ...(owned.has('guard-evasion') ? [{type: 'agi' as const, charges: 1}] : []),
    ],
    traits: [
      ...(owned.has('guard-counter') ? [{type: 'counter' as const}] : []),
      ...(owned.has('guard-recovery')
        ? [{type: 'recovery' as const, amount: power + 2, overhealToDamage: owned.has('heal-safeguard')}]
        : []),
    ],
  }
}

function buildHeal(owned: Set<string>, power: number): Skill {
  const offensiveCare = owned.has('heal-safeguard')
  return {
    id: 'heal',
    name: 'Heal',
    category: 'heal',
    cooldown: owned.has('heal-quick') ? 9000 : 12000,
    effects: [
      {
        type: 'heal',
        amount: owned.has('heal-greater') ? power * 2 + 4 : power + 2,
        overhealToDamage: offensiveCare
      },
      ...(owned.has('heal-regeneration')
        ? [{type: 'heal' as const, amount: power + 3, duration: 4000, overhealToDamage: offensiveCare}]
        : []),
      ...(owned.has('heal-cleanse') ? [{
        type: 'cleanse' as const,
        statuses: ['bleed' as const, 'curse' as const]
      }] : []),
    ],
  }
}
