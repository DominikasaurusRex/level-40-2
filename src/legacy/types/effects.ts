export type Effect =
  | DmgEffect
  | DefEffect
  | HealEffect
  | BleedEffect
  | AgiEffect
  | InvincibleEffect
  | StunEffect
  | CurseEffect
  | CleanseEffect

export interface DmgEffect {
  type: 'dmg'
  amount: number
}

export interface DefEffect {
  type: 'def'
  amount: number
}

export interface HealEffect {
  type: 'heal'
  amount: number
  duration?: number
  overhealToDamage?: boolean
}

export interface BleedEffect {
  type: 'bleed'
  amountPerTick: number
  tickInterval: number
  duration: number
}

export interface AgiEffect {
  type: 'agi'
  charges: number
}

export interface InvincibleEffect {
  type: 'invincible'
  duration: number
}

export interface StunEffect {
  type: 'stun'
  duration: number
}

export interface CurseEffect {
  type: 'curse'
  healingReduction: number
  duration: number
}

export interface CleanseEffect {
  type: 'cleanse'
  statuses: ('bleed' | 'curse')[]
}
