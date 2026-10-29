import type { CombatantState, SkillState, StatusEffect } from '@/types/combatant'
import { findStatus } from '@/types/combatant'
import type { Effect } from '@/types/effects'
import { healIconCountFor } from '@/data/heal-icon-thresholds'

/** Cadence for Bleed/heal-over-time ticks, matching the doc's "N per second" phrasing. */
const DOT_TICK_MS = 1000
/** Gap between a multiattack weapon's individual hits, so each is visible landing on its own instead of all at once. */
export const HIT_STAGGER_MS = 200
/** Gap between a buff's individual points (e.g. Guard's +10 def). */
export const BUFF_STAGGER_MS = 80
export const HIT_BURST_MS = 90
export const HIT_HOLD_MS = 100
export const HIT_TRAVEL_MS = 180

export type FightOutcome = 'ongoing' | 'monster-defeated' | 'player-defeated'

export interface FightHooks {
  onBleedTick?: (side: 'player' | 'monster') => void
  onHealTick?: (side: 'player' | 'monster') => void
  onPlayerSkillFired?: (skill: SkillState) => void
  onPlayerReactiveEffect?: (skill: SkillState, type: 'dmg' | 'heal', amount: number) => void
}

/**
 * Advances only the two combatants. The caller owns timers, XP, respawning,
 * and any UI reaction to the optional hooks.
 */
export function advanceFight(
  player: CombatantState,
  foe: CombatantState,
  dt: number,
  hooks: FightHooks = {},
): FightOutcome {
  processStatuses(
    player,
    foe,
    dt,
    () => hooks.onBleedTick?.('player'),
    () => hooks.onHealTick?.('player'),
  )
  processStatuses(
    foe,
    player,
    dt,
    () => hooks.onBleedTick?.('monster'),
    () => hooks.onHealTick?.('monster'),
  )

  actSkills(player, foe, dt, hooks.onPlayerSkillFired)
  if (foe.hp > 0) actSkills(foe, player, dt, undefined, hooks.onPlayerReactiveEffect)

  if (foe.hp <= 0) return 'monster-defeated'
  if (player.hp <= 0) return 'player-defeated'
  return 'ongoing'
}

/**
 * Ticks every skill's cooldown and fires it on reaching 0. Pending hits from
 * an earlier multiattack keep resolving even while stunned — the swing
 * already happened. Stun freezes cooldown recovery, but a skill already at
 * zero still fires.
 */
function actSkills(
  player: CombatantState,
  foe: CombatantState,
  dt: number,
  onFire?: (skill: SkillState) => void,
  onTargetReactiveEffect?: (skill: SkillState, type: 'dmg' | 'heal', amount: number) => void,
) {
  for (const skill of player.skills) resolvePendingHits(skill, player, dt, onTargetReactiveEffect)

  const stunned = Boolean(findStatus(player, 'stun'))

  for (const skill of player.skills) {
    if (!stunned) skill.remaining = Math.max(0, skill.remaining - dt)
    if (skill.remaining === 0) {
      fireSkill(skill, player, foe)
      skill.remaining = skill.cooldown
      onFire?.(skill)
    }
  }
}

/** Every hit waits out the visual delay before landing; later hits are staggered. */
function fireSkill(skill: SkillState, player: CombatantState, foe: CombatantState) {
  const hits = skill.effects.flatMap(splitIntoUnitHits)
  skill.pendingHits.push(
    ...hits.map((effect, i) => ({
      effect,
      target: foe,
      delay: HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS + i * staggerFor(effect),
    })),
  )
}

/** Splits DEF into visible points and instant healing into threshold-sized shares. */
function splitIntoUnitHits(effect: Effect): Effect[] {
  if (effect.type === 'def' && effect.amount > 1) {
    return Array.from({ length: effect.amount }, () => ({ type: 'def' as const, amount: 1 }))
  }
  if (effect.type === 'heal') {
    if (effect.duration) return [effect]
    const count = healIconCountFor(effect.amount)
    return Array.from({ length: count }, () => ({
      type: 'heal' as const,
      amount: effect.amount / count,
      overhealToDamage: effect.overhealToDamage,
    }))
  }
  return [effect]
}

function staggerFor(effect: Effect): number {
  return effect.type === 'dmg' ? HIT_STAGGER_MS : BUFF_STAGGER_MS
}

/** Counts down queued hits and applies whichever have finished waiting their turn. */
function resolvePendingHits(
  skill: SkillState,
  player: CombatantState,
  dt: number,
  onTargetReactiveEffect?: (skill: SkillState, type: 'dmg' | 'heal', amount: number) => void,
) {
  if (skill.pendingHits.length === 0) return

  for (const hit of skill.pendingHits) hit.delay -= dt
  while (skill.pendingHits.length > 0 && skill.pendingHits[0]!.delay <= 0) {
    const hit = skill.pendingHits.shift()!
    applyEffect(player, hit.target, hit.effect, onTargetReactiveEffect)
  }
}

/** Buffs land on the caster; damage and debuffs land on the target. */
function applyEffect(
  player: CombatantState,
  foe: CombatantState,
  effect: Effect,
  onTargetReactiveEffect?: (skill: SkillState, type: 'dmg' | 'heal', amount: number) => void,
) {
  switch (effect.type) {
    case 'dmg':
      dealDamage(foe, effect.amount, player, onTargetReactiveEffect)
      break
    case 'def':
      player.def += effect.amount
      break
    case 'heal':
      applyHeal(player, foe, effect.amount, effect.duration, effect.overhealToDamage)
      break
    case 'bleed':
      addStatus(foe, {
        type: 'bleed',
        remaining: effect.duration,
        amountPerTick: effect.amountPerTick,
        tickInterval: effect.tickInterval,
        sinceLastTick: 0,
      })
      break
    case 'agi':
      player.agiCharges += effect.charges
      break
    case 'invincible':
      addStatus(player, { type: 'invincible', remaining: effect.duration })
      break
    case 'stun':
      addStatus(foe, { type: 'stun', remaining: effect.duration })
      break
    case 'curse':
      addStatus(foe, { type: 'curse', remaining: effect.duration, healingReduction: effect.healingReduction })
      break
    case 'cleanse':
      player.statuses = player.statuses.filter(status => !effect.statuses.includes(status.type as 'bleed' | 'curse'))
      break
  }
}

/** Invincible blocks outright; otherwise AGI dodges; otherwise DEF absorbs before HP. */
function dealDamage(
  target: CombatantState,
  amount: number,
  attacker?: CombatantState,
  onReactiveEffect?: (skill: SkillState, type: 'dmg' | 'heal', amount: number) => void,
) {
  if (findStatus(target, 'invincible')) return

  if (target.agiCharges > 0) {
    target.agiCharges -= 1
    return
  }

  const defBefore = target.def
  const absorbed = Math.min(defBefore, amount)
  target.def -= absorbed
  target.hp = Math.max(0, target.hp - (amount - absorbed))

  const guard = target.skills.find(skill => skill.id === 'guard')
  if (
    defBefore > 0
    && target.def === 0
    && absorbed > 0
    && attacker
    && guard?.traits?.some(trait => trait.type === 'counter')
  ) {
    guard.pendingHits.push({
      effect: { type: 'dmg', amount },
      target: attacker,
      delay: HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS,
    })
    onReactiveEffect?.(guard, 'dmg', amount)
  }

  const recovery = guard?.traits?.find(trait => trait.type === 'recovery')
  if (guard && defBefore > 0 && target.def === 0 && recovery?.type === 'recovery') {
    target.pendingHealHits.push({
      amount: recovery.amount,
      overhealToDamage: recovery.overhealToDamage ?? false,
      delay: HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS,
    })
    onReactiveEffect?.(guard, 'heal', recovery.amount)
  }
}

/** Instant heals apply now; duration heals become a timed Heal status. */
function applyHeal(
  target: CombatantState,
  foe: CombatantState,
  amount: number,
  duration?: number,
  overhealToDamage = false,
) {
  if (duration) {
    addStatus(target, {
      type: 'heal',
      remaining: duration,
      amountPerTick: amount / (duration / DOT_TICK_MS),
      tickInterval: DOT_TICK_MS,
      sinceLastTick: 0,
      overhealToDamage,
    })
  } else {
    healNow(target, foe, amount, overhealToDamage)
  }
}

/** Curse reduces healing before optional overhealing becomes ordinary damage. */
function healNow(target: CombatantState, foe: CombatantState, amount: number, overhealToDamage = false) {
  const curse = findStatus(target, 'curse')
  const reduced = curse ? amount * (1 - curse.healingReduction) : amount
  const missingHp = target.definition.maxHp - target.hp
  const restored = Math.min(missingHp, reduced)
  target.hp += restored
  const overhealing = reduced - restored
  if (overhealToDamage && overhealing > 0) dealDamage(foe, overhealing, target)
}

/** A status re-applied while active refreshes rather than stacking. */
function addStatus(target: CombatantState, status: StatusEffect) {
  const existing = target.statuses.find(s => s.type === status.type)
  if (existing) Object.assign(existing, status)
  else target.statuses.push(status)
}

function processStatuses(
  state: CombatantState,
  foe: CombatantState,
  dt: number,
  onBleedTick: () => void,
  onHealTick: () => void,
) {
  resolvePendingBleedHits(state, dt)
  resolvePendingHealHits(state, foe, dt)

  for (const status of state.statuses) {
    status.remaining -= dt

    if (status.type === 'bleed' || status.type === 'heal') {
      status.sinceLastTick += dt
      while (status.sinceLastTick >= status.tickInterval) {
        status.sinceLastTick -= status.tickInterval
        if (status.type === 'bleed') {
          state.pendingBleedHits.push({
            amount: status.amountPerTick,
            delay: HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS,
          })
          onBleedTick()
        } else {
          state.pendingHealHits.push({
            amount: status.amountPerTick,
            overhealToDamage: status.overhealToDamage,
            delay: HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS,
          })
          onHealTick()
        }
      }
    }
  }

  state.statuses = state.statuses.filter(status => status.remaining > 0)
}

/** Applies queued healing only when its launched heart reaches the health bar. */
function resolvePendingHealHits(state: CombatantState, foe: CombatantState, dt: number) {
  for (const hit of state.pendingHealHits) hit.delay -= dt
  while (state.pendingHealHits.length > 0 && state.pendingHealHits[0]!.delay <= 0) {
    const hit = state.pendingHealHits.shift()!
    healNow(state, foe, hit.amount, hit.overhealToDamage)
  }
}

/** Applies Bleed only after its launched attack icon reaches the HP bar. */
function resolvePendingBleedHits(state: CombatantState, dt: number) {
  for (const hit of state.pendingBleedHits) hit.delay -= dt
  while (state.pendingBleedHits.length > 0 && state.pendingBleedHits[0]!.delay <= 0) {
    dealBleedTick(state, state.pendingBleedHits.shift()!.amount)
  }
}

/** Bleed ignores DEF but not Invincible. */
function dealBleedTick(target: CombatantState, amount: number) {
  if (findStatus(target, 'invincible')) return
  target.hp = Math.max(0, target.hp - amount)
}
