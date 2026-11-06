import type { CombatantCore, HitDamage } from './damage'
import type { CleanseTarget, SkillEffect } from './skill-effect'
import type { MaterialId } from '@/data/resources'

/**
 * A Level 40 2 monster (see `.documentation/enemies.md`). Its stage is its position in the stage
 * list. Skill conditions (the monster AI) follow from what a skill does, so they are not stored.
 */
export interface MonsterDefinition extends CombatantCore {
  /** Every fifth stage. The Library shows a boss icon next to the name. */
  boss: boolean
  weapon: MonsterWeapon
  /** At most three. */
  skills: MonsterSkill[]
  /** Handwritten hint for the Library. */
  defensiveWeaknesses: DefensiveWeakness[]
  rewards: MonsterRewards
  sprite: MonsterSprite
}

/** The basic attack. */
export interface MonsterWeapon {
  name: string
  hit: HitDamage
  hits: number
  cooldown: number
  /** Wait before the first attack of a fight. */
  initialCooldown: number
}

export interface MonsterSkill {
  /** Stable: the save records which skills the player has seen. */
  id: string
  name: string
  /** Handwritten Library text. */
  description: string
  cooldown: number
  /** Wait before the first use in a fight; afterwards `cooldown` applies. */
  initialCooldown: number
  effects: SkillEffect[]
  cleanse?: CleanseTarget
}

export enum DefensiveWeakness {
  /** Many small hits: flat DEF per hit blocks a large share. */
  Def = 'def',
  /** Big, slow hits: each evasion charge avoids a lot. */
  Agi = 'agi',
}

export interface MonsterRewards {
  xp: number
  gold: { min: number; max: number }
  drops: MaterialDrop[]
}

export interface MaterialDrop {
  resource: MaterialId
  amount: number
  /** 0–1. Never shown to the player. */
  chance: number
}

export interface MonsterSprite {
  image: string
  scale?: number
  groundOffset?: number
  wallOffset?: number
  overflow?: boolean
}
