export type SkillFamily = 'attack' | 'defense' | 'heal'

export interface SkillChoice {
  id: string
  family: SkillFamily
  kind: 'baseline' | 'upgrade'
  name: string
  description: string
  icon: string
  prerequisiteIds: string[]
  position: { x: number; y: number }
}
