import type { Effect } from './effects'
import type { Skill } from './skill'
import type { Weapon } from './weapon'
import { basicAttackSkill } from './weapon'

/**
 * Static combat-relevant data — shared shape for both player and monsters,
 * since both follow the same combat rules. Player/Monster profiles (level,
 * XP, loot, etc.) wrap this rather than duplicating it.
 */
export interface CombatantDefinition {
  name: string
  maxHp: number
  weapon: Weapon
  skills: Skill[]
}

export function allSkills(definition: CombatantDefinition): Skill[] {
  return [basicAttackSkill(definition.weapon), ...definition.skills]
}

/**
 * One combatant's live copy of a skill: every field of `Skill` (flattened,
 * not nested — `state.cooldown`, not `state.skill.cooldown`) plus how much
 * of ITS OWN cooldown is left right now. A fresh copy per combatant, since
 * the underlying `Skill` is a shared, reusable definition (see `Skill`/
 * `CombatantDefinition`) that multiple encounters may reference.
 */
export interface SkillState extends Skill {
  remaining: number
  /**
   * A multi-hit weapon's later hits, waiting their turn instead of landing
   * all at once — `target` is captured when the swing fires so a hit still
   * resolves against the foe it was aimed at even if that foe dies/respawns
   * before this hit's delay runs out.
   */
  pendingHits: PendingHit[]
}

export interface PendingHit {
  effect: Effect
  target: CombatantState
  /** Milliseconds until this hit lands. */
  delay: number
}

export interface PendingBleedHit {
  amount: number
  /** Milliseconds until the damage icon reaches this combatant's HP bar. */
  delay: number
}

export interface PendingHealHit {
  amount: number
  overhealToDamage: boolean
  /** Milliseconds until the heart icon reaches this combatant's HP bar. */
  delay: number
}

interface StatusEffectBase {
  /** Milliseconds left before this status expires. */
  remaining: number
}

export interface BleedStatus extends StatusEffectBase {
  type: 'bleed'
  amountPerTick: number
  tickInterval: number
  /** Milliseconds accumulated since the last tick fired. */
  sinceLastTick: number
}

export interface CurseStatus extends StatusEffectBase {
  type: 'curse'
  healingReduction: number
}

export interface StunStatus extends StatusEffectBase {
  type: 'stun'
}

export interface InvincibleStatus extends StatusEffectBase {
  type: 'invincible'
}

/**
 * Runtime form of a `heal` effect that has a `duration` — spread over time the
 * same way Bleed is, just healing instead of damaging. A `heal` with no
 * duration applies instantly and never becomes a status.
 */
export interface HealStatus extends StatusEffectBase {
  type: 'heal'
  amountPerTick: number
  tickInterval: number
  /** Milliseconds accumulated since the last tick fired. */
  sinceLastTick: number
  /** Offensive Care remains active for every tick of this heal-over-time status. */
  overhealToDamage: boolean
}

/** A combatant can have at most one of each, tracked as a list rather than one field per type. */
export type StatusEffect = BleedStatus | CurseStatus | StunStatus | InvincibleStatus | HealStatus

export function isPositiveStatus(status: StatusEffect): boolean {
  return status.type === 'invincible' || status.type === 'heal'
}

export function findStatus<T extends StatusEffect['type']>(
  state: CombatantState,
  type: T,
): Extract<StatusEffect, { type: T }> | undefined {
  return state.statuses.find(status => status.type === type) as Extract<StatusEffect, { type: T }> | undefined
}

/**
 * Runtime battle state for one combatant. DEF and AGI stay as their own
 * fields — they deplete by damage absorbed / charges consumed, not by time,
 * so they don't fit the time-limited `statuses` list.
 */
export interface CombatantState {
  definition: CombatantDefinition
  hp: number
  def: number
  agiCharges: number
  statuses: StatusEffect[]
  pendingBleedHits: PendingBleedHit[]
  pendingHealHits: PendingHealHit[]
  skills: SkillState[]
}

export function createCombatantState(definition: CombatantDefinition): CombatantState {
  return {
    definition,
    hp: definition.maxHp,
    def: 0,
    agiCharges: 0,
    statuses: [],
    pendingBleedHits: [],
    pendingHealHits: [],
    skills: allSkills(definition).map(skill => ({
      ...skill,
      remaining: skill.startsReady ? 0 : (skill.initialDelay ?? skill.cooldown),
      pendingHits: [],
    })),
  }
}
