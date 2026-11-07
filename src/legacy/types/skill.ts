import type { Effect } from './effects'

export type SkillCategory = 'attack' | 'guard' | 'heal'

export type SkillTrait =
  | { type: 'counter' }
  | { type: 'recovery'; amount: number; overhealToDamage?: boolean }

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  cooldown: number
  initialDelay?: number
  startsReady?: boolean
  effects: Effect[]
  traits?: SkillTrait[]
}
