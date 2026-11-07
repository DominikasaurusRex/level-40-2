import type { DamageResponse, DamageType, HitDamage } from './damage'

/** The Level 40 2 skill effects (see `level40-2-balance-progression.md`). */
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
  DamageResponse = 'damage-response',
  AttackSpeed = 'attack-speed',
}

/** Who an effect (or a cleanse) lands on. Written out on every effect, even the obvious ones. */
export enum EffectTarget {
  Self = 'self',
  Opponent = 'opponent',
}

interface EffectBase {
  target: EffectTarget
}

export interface DamageEffect extends EffectBase {
  type: EffectType.Damage
  hit: HitDamage
  hits: number
}

export interface PoisonEffect extends EffectBase {
  type: EffectType.Poison
  amountPerTick: number
  tickInterval: number
  duration: number
}

export interface StunEffect extends EffectBase {
  type: EffectType.Stun
  duration: number
}

/** Records the damage the cursed combatant deals and reflects it on expiry (or when cleansed). */
export interface CurseEffect extends EffectBase {
  type: EffectType.Curse
  duration: number
}

export interface RegenerationEffect extends EffectBase {
  type: EffectType.Regeneration
  amountPerTick: number
  tickInterval: number
  duration: number
}

export interface HealEffect extends EffectBase {
  type: EffectType.Heal
  amount: number
}

/** Stacks and never expires. */
export interface ShieldEffect extends EffectBase {
  type: EffectType.Shield
  amount: number
}

/** Flat reduction per hit. */
export interface DefEffect extends EffectBase {
  type: EffectType.Def
  amount: number
  duration: number
}

export interface AgiEffect extends EffectBase {
  type: EffectType.Agi
  charges: number
}

/**
 * A temporary damage response for the given damage types, overriding the innate one while it lasts.
 * Shown to the player as Barrier (Resisted / Immune), Absorb, or Vulnerability (Vulnerable).
 */
export interface DamageResponseEffect extends EffectBase {
  type: EffectType.DamageResponse
  damageTypes: DamageType[]
  response: Exclude<DamageResponse, DamageResponse.Normal>
  duration: number
}

/**
 * Speeds up or slows down the target's default attacks (the player's weapons, a monster's basic
 * attack), never its skills. Shown as Haste (`multiplier` above 1) or Slow (below 1). The multiplier
 * scales how fast the attack timer fills, including a running one. Haste and Slow are one status:
 * the most recent application replaces the active one.
 */
export interface AttackSpeedEffect extends EffectBase {
  type: EffectType.AttackSpeed
  multiplier: number
  duration: number
}

export type SkillEffect =
  | DamageEffect
  | PoisonEffect
  | StunEffect
  | CurseEffect
  | RegenerationEffect
  | HealEffect
  | ShieldEffect
  | DefEffect
  | AgiEffect
  | DamageResponseEffect
  | AttackSpeedEffect

/**
 * Cleansing is not an effect: a skill may additionally cleanse. On `Self` it removes the caster's
 * negative statuses; on `Opponent` (forced cleanse) it removes every positive effect from the
 * opponent, Shield included. Empowered weapon states are never removed.
 */
export type CleanseTarget = EffectTarget
