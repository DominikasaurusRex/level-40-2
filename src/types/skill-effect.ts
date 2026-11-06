import type { DamageResponse, DamageType, HitDamage } from './damage'

/**
 * The Level 40 2 skill effects (see `level40-2-balance-progression.md`). Damage, Poison, Stun, and
 * Curse land on the opponent; every other effect lands on the caster.
 */
export enum EffectType {
  Damage = 'damage',
  Poison = 'poison',
  Stun = 'stun',
  Curse = 'curse',
  Regeneration = 'regeneration',
  Heal = 'heal',
  Shield = 'shield',
  Def = 'def',
  Agi = 'agi',
  Barrier = 'barrier',
  Absorb = 'absorb',
}

export interface DamageEffect {
  type: EffectType.Damage
  hit: HitDamage
  hits: number
}

export interface PoisonEffect {
  type: EffectType.Poison
  amountPerTick: number
  tickInterval: number
  duration: number
}

export interface StunEffect {
  type: EffectType.Stun
  duration: number
}

export interface RegenerationEffect {
  type: EffectType.Regeneration
  amountPerTick: number
  tickInterval: number
  duration: number
}

export interface HealEffect {
  type: EffectType.Heal
  amount: number
}

/** Stacks and never expires. */
export interface ShieldEffect {
  type: EffectType.Shield
  amount: number
}

/** Flat reduction per hit. */
export interface DefEffect {
  type: EffectType.Def
  amount: number
  duration: number
}

export interface AgiEffect {
  type: EffectType.Agi
  charges: number
}

export interface BarrierEffect {
  type: EffectType.Barrier
  damageTypes: DamageType[]
  response: DamageResponse.Resisted | DamageResponse.Immune
  duration: number
}

export interface AbsorbEffect {
  type: EffectType.Absorb
  damageType: DamageType
  duration: number
}

/** Records the damage the target deals and reflects it on expiry (or when cleansed). */
export interface CurseEffect {
  type: EffectType.Curse
  duration: number
}

export type SkillEffect =
  | DamageEffect
  | PoisonEffect
  | StunEffect
  | RegenerationEffect
  | HealEffect
  | ShieldEffect
  | DefEffect
  | AgiEffect
  | BarrierEffect
  | AbsorbEffect
  | CurseEffect

/** Cleansing is not an effect: a skill may additionally cleanse itself or its target. */
export enum CleanseTarget {
  /** Removes the caster's negative statuses. */
  Self = 'self',
  /** Forced cleanse: removes every positive effect from the target, Shield included. */
  Target = 'target',
}
