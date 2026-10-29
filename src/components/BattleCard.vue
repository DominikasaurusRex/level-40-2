<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Monster } from '@/types/monster'
import type { CombatantState, StatusEffect } from '@/types/combatant'
import type { SkillCategory } from '@/types/skill'
import type { BattlePhase } from '@/stores/game'
import type { AreaBackground } from '@/data/area-backgrounds'
import { isPositiveStatus } from '@/types/combatant'
import CombatBubble from './CombatBubble.vue'

const props = defineProps<{
  background: AreaBackground
  battlePhase: BattlePhase
  monster?: Monster
  monsterState?: CombatantState
  playerState?: CombatantState
}>()

/**
 * Detects "the monster's basic attack just fired" purely from `monsterState`
 * — no separate event needed. Right after a skill fires, its `remaining` is
 * reset to exactly `cooldown`, which never otherwise happens (it's always
 * counting down from there), so that transition is an unambiguous trigger.
 */
const monsterBasicAttack = computed(() => props.monsterState?.skills.find(skill => skill.id === 'basic-attack'))
const monsterTackling = ref(false)
const monsterSkillCallouts = ref<{ id: number; name: string; category: SkillCategory }[]>([])
let monsterSkillCalloutId = 0

watch(
  () => ({ skill: monsterBasicAttack.value, remaining: monsterBasicAttack.value?.remaining }),
  ({ skill, remaining }, previous) => {
    // A fresh combatant also starts at its full cooldown. Only animate when the
    // same live skill transitions back to full cooldown after actually firing.
    if (skill && skill === previous.skill && remaining === skill.cooldown) {
      monsterTackling.value = false
      requestAnimationFrame(() => { monsterTackling.value = true })
    }
  },
)

watch(
  () => props.monsterState?.skills.map(skill => ({ skill, remaining: skill.remaining })) ?? [],
  (skills, previousSkills) => {
    for (const { skill, remaining } of skills) {
      if (skill.id === 'basic-attack') continue

      const previous = previousSkills.find(candidate => candidate.skill === skill)
      if (previous && remaining === skill.cooldown && previous.remaining !== skill.cooldown) {
        monsterSkillCallouts.value.push({
          id: ++monsterSkillCalloutId,
          name: skill.name,
          category: skill.category,
        })
      }
    }
  },
)

function removeMonsterSkillCallout(id: number) {
  monsterSkillCallouts.value = monsterSkillCallouts.value.filter(callout => callout.id !== id)
}

const activeMonsterSkillCategories = computed(() =>
  new Set(monsterSkillCallouts.value.map(callout => callout.category)),
)

/** Shakes only when the stat actually drops — not just "an attack happened" — so a miss/full block stays still. */
function useDropShake(getValue: () => number | undefined) {
  const shaking = ref(false)
  watch(getValue, (value, previousValue) => {
    if (previousValue !== undefined && value !== undefined && value < previousValue) {
      shaking.value = false
      requestAnimationFrame(() => { shaking.value = true })
    }
  })
  return shaking
}

const playerHealthHit = useDropShake(() => props.playerState?.hp)
const playerDefHit = useDropShake(() => props.playerState?.def)
const playerAgiHit = useDropShake(() => props.playerState?.agiCharges)
const monsterAttackHit = ref(false)

watch(
  () => [props.playerState?.hp, props.playerState?.def, props.playerState?.agiCharges] as const,
  (values, previousValues) => {
    const playerWasHit = values.some((value, index) => {
      const previousValue = previousValues[index]
      return previousValue !== undefined && value !== undefined && value < previousValue
    })
    if (playerWasHit) {
      monsterAttackHit.value = false
      requestAnimationFrame(() => { monsterAttackHit.value = true })
    }
  },
)

/** Exposed so flying-icon layers know where the player's attacks/buffs/heals land. */
const enemyHealthBarEl = ref<HTMLElement>()
const xpOrbSpawnEl = ref<HTMLElement>()
const playerDefBadgeEl = ref<HTMLElement>()
const playerAgiBadgeEl = ref<HTMLElement>()
const playerHealthBarEl = ref<HTMLElement>()
const monsterStatusIconEls = reactive<Partial<Record<StatusEffect['type'], HTMLElement>>>({})
const playerStatusIconEls = reactive<Partial<Record<StatusEffect['type'], HTMLElement>>>({})

type CombatBubbleRef = InstanceType<typeof CombatBubble>

function setStatusBubble(side: 'monster' | 'player', type: StatusEffect['type'], bubble: unknown) {
  const icons = side === 'monster' ? monsterStatusIconEls : playerStatusIconEls
  const iconEl = (bubble as CombatBubbleRef | null)?.iconEl
  if (iconEl) icons[type] = iconEl
  else delete icons[type]
}

defineExpose({
  enemyHealthBarEl,
  xpOrbSpawnEl,
  playerDefBadgeEl,
  playerAgiBadgeEl,
  playerHealthBarEl,
  monsterStatusIconEls,
  playerStatusIconEls,
})

const monsterPositiveStatuses = computed(() =>
  props.monsterState?.statuses.filter(isPositiveStatus) ?? [],
)
const monsterNegativeStatuses = computed(() =>
  props.monsterState?.statuses.filter(status => !isPositiveStatus(status)) ?? [],
)
const playerPositiveStatuses = computed(() =>
  props.playerState?.statuses.filter(isPositiveStatus) ?? [],
)
const playerNegativeStatuses = computed(() =>
  props.playerState?.statuses.filter(status => !isPositiveStatus(status)) ?? [],
)

function statusValue(status: StatusEffect): string {
  if (status.type === 'bleed' || status.type === 'heal') {
    const remainingTicks = Math.ceil((status.remaining + status.sinceLastTick) / status.tickInterval)
    return `${remainingTicks} × ${status.amountPerTick}`
  }
  return `${(status.remaining / 1000).toFixed(1)}s`
}

const statusIcons: Partial<Record<StatusEffect['type'], string>> = {
  bleed: '/icons/bleed.png',
  heal: '/icons/heal.png',
  stun: '/icons/stun.png',
  curse: '/icons/curse.png',
  invincible: '/icons/invincibility.png',
}

function hpPercent(state?: CombatantState): number {
  return state ? Math.max(0, (state.hp / state.definition.maxHp) * 100) : 100
}
</script>

<template>
  <div
    class="battle-card"
    :class="{ 'player-defeated': battlePhase === 'defeat' }"
  >
    <CombatBubble
      class="monster-attack-badge"
      :class="{ hit: monsterAttackHit }"
      side="enemy"
      icon="/icons/attack-power.png"
      :value="monster?.combatant.weapon.damage ?? 0"
      @animationend="monsterAttackHit = false"
    />

    <div ref="enemyHealthBarEl" class="enemy-health-bar-target" />
    <div class="enemy-health-bar" :style="{ width: `${hpPercent(monsterState)}%` }" />

    <CombatBubble
      class="enemy-hp-badge"
      side="enemy"
      icon="/icons/health.png"
      :value="Math.round(monsterState?.hp ?? 0)"
    />

    <div v-if="monsterState?.def" class="monster-def-badge">
      <CombatBubble side="enemy" icon="/icons/defense.png" :value="Math.round(monsterState.def)" />
    </div>

    <div v-if="monsterState?.agiCharges" class="monster-agi-badge">
      <CombatBubble side="enemy" icon="/icons/agi.png" :value="monsterState.agiCharges" />
    </div>

    <div v-if="monsterPositiveStatuses.length" class="monster-positive-skills">
      <CombatBubble
        v-for="status in monsterPositiveStatuses"
        :key="status.type"
        :ref="bubble => setStatusBubble('monster', status.type, bubble)"
        side="enemy"
        :icon="statusIcons[status.type]"
        :value="statusValue(status)"
      />
    </div>

    <div v-if="monsterNegativeStatuses.length" class="monster-negative-skills">
      <CombatBubble
        v-for="status in monsterNegativeStatuses"
        :key="status.type"
        :ref="bubble => setStatusBubble('monster', status.type, bubble)"
        side="enemy"
        :icon="statusIcons[status.type]"
        :value="statusValue(status)"
      />
    </div>

    <div
      class="scene"
      :class="{ 'allows-sprite-overflow': monster?.spriteOverflow }"
    >
      <div class="scene-background-clip" aria-hidden="true">
        <div
          class="scene-background"
          :style="{
            backgroundImage: `url(${background.image})`,
            transform: `translate(${background.xOffset ?? 0}px, ${background.yOffset ?? 0}px) scale(${background.scale ?? 1})`,
          }"
        />
      </div>

      <div class="monster-skill-callouts" aria-live="polite">
        <div
          v-for="callout in monsterSkillCallouts"
          :key="callout.id"
          class="monster-skill-callout"
          @animationend="removeMonsterSkillCallout(callout.id)"
        >
          {{ callout.name }}
        </div>
      </div>

      <div class="monster-skill-effects" aria-hidden="true">
        <div
          v-for="callout in monsterSkillCallouts"
          :key="`effect-${callout.id}`"
          class="monster-skill-effect"
          :class="`monster-skill-effect-${callout.category}`"
        >
          <template v-if="callout.category === 'attack'">
            <span class="attack-charge" />
            <span class="attack-projectile" />
            <span class="attack-impact">
              <span v-for="fragment in 8" :key="fragment" class="attack-impact-fragment" />
            </span>
          </template>

          <span v-else-if="callout.category === 'guard'" class="guard-aura">
            <img src="/icons/defense.png" alt="" class="guard-aura-icon" />
          </span>

          <span v-else class="heal-particles">
            <img v-for="particle in 5" :key="particle" src="/icons/heal.png" alt="" class="heal-particle" />
          </span>
        </div>
      </div>

      <div
        ref="xpOrbSpawnEl"
        class="xp-orb-spawn-point"
        :style="{
          bottom: `${(monster?.spriteGroundOffset ?? 16) + (monster?.xpOrbOffset ?? 20)}px`,
          left: `calc(50% + ${monster?.spriteWallOffset ?? 0}px)`,
        }"
        aria-hidden="true"
      />

      <Transition name="monster-change" mode="out-in">
        <div
          v-if="monster?.image"
          :key="monster.combatant.name"
          class="monster-sprite-stage"
          :class="{ 'is-invincible': monsterState?.statuses.some(status => status.type === 'invincible') }"
          :style="{
            '--monster-scale': monster.spriteScale ?? 1,
            '--monster-ground-offset': `${monster.spriteGroundOffset ?? 16}px`,
            '--monster-wall-offset': `${monster.spriteWallOffset ?? 0}px`,
          }"
        >
          <img
            :src="monster.image"
            alt=""
            class="monster-sprite"
            :class="{
              tackling: monsterTackling,
              'using-attack-skill': activeMonsterSkillCategories.has('attack'),
              'using-guard-skill': activeMonsterSkillCategories.has('guard'),
              'using-heal-skill': activeMonsterSkillCategories.has('heal'),
              defeated: battlePhase === 'victory',
              spawning: battlePhase === 'spawning',
            }"
            @animationend="monsterTackling = false"
          />
        </div>
      </Transition>
    </div>

    <div
      class="player-health-bar"
      :class="{ hit: playerHealthHit }"
      :style="{ width: `${hpPercent(playerState)}%` }"
      @animationend="playerHealthHit = false"
    />
    <div ref="playerHealthBarEl" class="player-health-bar-target" />

    <div
      ref="playerDefBadgeEl"
      class="player-def-badge"
      :class="{ hit: playerDefHit, visible: !!playerState?.def }"
      @animationend="playerDefHit = false"
    >
      <CombatBubble side="player" icon="/icons/defense.png" :value="Math.round(playerState?.def ?? 0)" />
    </div>

    <div
      ref="playerAgiBadgeEl"
      class="player-agi-badge"
      :class="{ hit: playerAgiHit, visible: !!playerState?.agiCharges }"
      @animationend="playerAgiHit = false"
    >
      <CombatBubble side="player" icon="/icons/agi.png" :value="playerState?.agiCharges ?? 0" />
    </div>

    <div v-if="playerPositiveStatuses.length" class="player-positive-skills">
      <CombatBubble
        v-for="status in playerPositiveStatuses"
        :key="status.type"
        :ref="bubble => setStatusBubble('player', status.type, bubble)"
        side="player"
        :icon="statusIcons[status.type]"
        :value="statusValue(status)"
      />
    </div>

    <div v-if="playerNegativeStatuses.length" class="player-negative-skills">
      <CombatBubble
        v-for="status in playerNegativeStatuses"
        :key="status.type"
        :ref="bubble => setStatusBubble('player', status.type, bubble)"
        side="player"
        :icon="statusIcons[status.type]"
        :value="statusValue(status)"
      />
    </div>

    <CombatBubble
      class="player-hp-badge"
      side="player"
      icon="/icons/health.png"
      :value="Math.round(playerState?.hp ?? 0)"
    />
  </div>
</template>

<style scoped>
.battle-card {
  position: relative;
  box-sizing: border-box;
  width: 320px;
  aspect-ratio: 4 / 5;
  border: 4px solid var(--ui-ink);
  outline: 1px solid var(--ui-border-soft);
  outline-offset: -5px;
  border-radius: 0.75rem;
  background: linear-gradient(180deg, rgba(5, 55, 91, 0.9), rgba(24, 151, 108, 0.78));
  box-shadow: 0 0.7rem 1.35rem rgba(0, 10, 24, 0.42);
  overflow: visible;
}

.monster-attack-badge {
  position: absolute;
  top: 2rem;
  left: 0.5rem;
  z-index: 2;
}

.enemy-health-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  z-index: 2;
  border-radius: 0.45rem 0.45rem 0 0;
  background: var(--ui-enemy-hp);
}

.enemy-health-bar-target,
.player-health-bar-target {
  position: absolute;
  left: 0;
  right: 0;
  height: 1.75rem;
  pointer-events: none;
}

.enemy-health-bar-target {
  top: 0;
}

.player-health-bar-target {
  bottom: 0;
}

.monster-def-badge,
.monster-agi-badge {
  position: absolute;
  top: 0.125rem;
  height: 1.5rem;
  z-index: 2;
}

.monster-def-badge {
  left: 3.25rem;
}

.monster-agi-badge {
  left: 0.5rem;
}

.player-def-badge,
.player-agi-badge {
  position: absolute;
  bottom: 0.125rem;
  height: 1.5rem;
  z-index: 2;
  /* Stay measurable as flying-icon targets, but remain hidden until the first point lands. */
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.player-def-badge {
  right: 3.25rem;
}

.player-agi-badge {
  right: 0.25rem;
}

.player-def-badge.visible,
.player-agi-badge.visible {
  opacity: 1;
}

.monster-positive-skills,
.monster-negative-skills,
.player-positive-skills,
.player-negative-skills {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  z-index: 2;
}

/* Below the level/def badges, same side — grows further down. */
.monster-positive-skills {
  top: 3.75rem;
  left: 0.5rem;
}

/* Same band as the def badge, opposite side. */
.monster-negative-skills {
  top: 2rem;
  right: 0.5rem;
}

/* Above the def badge, same side — grows further up. */
.player-positive-skills {
  bottom: 2rem;
  right: 0.5rem;
}

/* Bottom-center status anchor; additional player debuffs grow upward. */
.player-negative-skills {
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
}

.scene {
  position: absolute;
  top: 1.75rem;
  bottom: 1.75rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1;
  overflow: hidden;
  background-color: var(--ui-ink);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.scene.allows-sprite-overflow {
  overflow: visible;
}

.scene-background-clip {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.scene-background-clip::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(180deg, rgba(4, 45, 79, 0.5), rgba(25, 150, 108, 0.38));
}

.scene-background {
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  transform-origin: center;
}

.xp-orb-spawn-point {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.monster-sprite-stage {
  position: relative;
  z-index: 1;
  display: flex;
  width: 80%;
  height: 80%;
  margin-bottom: var(--monster-ground-offset);
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
  transform: translateX(var(--monster-wall-offset)) scale(var(--monster-scale));
  transform-origin: center bottom;
  transition: opacity 180ms ease;
}

.monster-sprite-stage.is-invincible {
  opacity: 0.78;
}

.monster-sprite {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  transform-origin: center bottom;
}

.monster-change-enter-active,
.monster-change-leave-active {
  transition: opacity 180ms ease, translate 180ms ease;
}

.monster-change-enter-from,
.monster-change-leave-to {
  opacity: 0;
  translate: -1.5rem 0;
}

.monster-sprite-stage.monster-change-enter-from,
.monster-sprite-stage.monster-change-leave-to {
  opacity: 0;
}

.monster-skill-callouts {
  position: absolute;
  top: 22%;
  left: 50%;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  transform: translateX(-50%);
  pointer-events: none;
}

.monster-skill-callout {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.78);
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.2;
  white-space: nowrap;
  text-shadow: 0 1px 2px #000;
  animation: monster-skill-callout 1100ms ease-out forwards;
}

@keyframes monster-skill-callout {
  0% {
    opacity: 0;
    transform: translateY(0.75rem);
  }
  15% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-0.75rem);
  }
}

.monster-skill-effects,
.monster-skill-effect {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.monster-skill-effects {
  z-index: 3;
  overflow: hidden;
}

/* Attack: charge at the monster, travel toward the player, then burst at impact. */
.attack-charge {
  position: absolute;
  top: 48%;
  left: 50%;
  width: 4rem;
  height: 4rem;
  border: 2px solid rgba(255, 225, 125, 0.9);
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0 8%, #ffd45b 12%, rgba(255, 91, 35, 0.65) 38%, transparent 70%);
  box-shadow: 0 0 0.7rem #fff2a8, 0 0 1.7rem rgba(255, 72, 20, 0.95);
  animation: enemy-attack-charge 420ms ease-out forwards;
}

.attack-projectile {
  position: absolute;
  top: 48%;
  left: 50%;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 50%;
  background: #fff8cc;
  box-shadow: 0 0 0.45rem #fff, 0 0 1rem #ffb21c, 0 0 1.8rem #ff3d16;
  opacity: 0;
  animation: enemy-attack-projectile 280ms 90ms cubic-bezier(0.3, 0.05, 0.7, 1) forwards;
}

.attack-impact {
  position: absolute;
  bottom: 4%;
  left: 50%;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0 7%, #ffe06a 9%, rgba(255, 85, 22, 0.92) 23%, rgba(180, 20, 0, 0.35) 48%, transparent 70%);
  opacity: 0;
  animation: enemy-attack-impact 420ms 340ms ease-out forwards;
}

.attack-impact::before,
.attack-impact::after {
  content: '';
  position: absolute;
  inset: 13%;
  border: 3px solid rgba(255, 226, 99, 0.95);
  border-radius: 50%;
  animation: enemy-attack-impact-ring 420ms 340ms ease-out forwards;
}

.attack-impact::after {
  inset: 28%;
  border-color: #fff;
  animation-delay: 390ms;
}

.attack-impact-fragment {
  --fragment-angle: 0deg;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.35rem;
  height: 1.15rem;
  border-radius: 999px;
  background: linear-gradient(#fff8b5, #ff641f);
  box-shadow: 0 0 0.35rem #ff6b1f;
  opacity: 0;
  transform-origin: 50% 0;
  animation: enemy-attack-fragment 380ms 360ms ease-out forwards;
}

.attack-impact-fragment:nth-child(2) { --fragment-angle: 45deg; }
.attack-impact-fragment:nth-child(3) { --fragment-angle: 90deg; }
.attack-impact-fragment:nth-child(4) { --fragment-angle: 135deg; }
.attack-impact-fragment:nth-child(5) { --fragment-angle: 180deg; }
.attack-impact-fragment:nth-child(6) { --fragment-angle: 225deg; }
.attack-impact-fragment:nth-child(7) { --fragment-angle: 270deg; }
.attack-impact-fragment:nth-child(8) { --fragment-angle: 315deg; }

@keyframes enemy-attack-charge {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.15); }
  35% { opacity: 1; }
  75% { opacity: 0.95; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
}

@keyframes enemy-attack-projectile {
  0% { top: 48%; opacity: 0; transform: translate(-50%, -50%) scale(0.35); }
  18% { opacity: 1; }
  80% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
  100% { top: 92%; opacity: 0; transform: translate(-50%, -50%) scale(1.7); }
}

@keyframes enemy-attack-impact {
  0% { opacity: 0; transform: translate(-50%, 50%) scale(0.15); }
  25% { opacity: 1; }
  70% { opacity: 0.9; transform: translate(-50%, 50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, 50%) scale(1.35); }
}

@keyframes enemy-attack-impact-ring {
  0% { opacity: 0; transform: scale(0.1); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: scale(2); }
}

@keyframes enemy-attack-fragment {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--fragment-angle)) translateY(0) scaleY(0.25); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--fragment-angle)) translateY(-2.6rem) scaleY(0.7); }
}

/* Guard: a blue protective orb and shield icon form around the monster. */
.guard-aura {
  position: absolute;
  top: 51%;
  left: 50%;
  width: min(62%, 12rem);
  aspect-ratio: 1;
  border: 3px solid rgba(137, 222, 255, 0.9);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(205, 245, 255, 0.18) 0 45%, rgba(37, 139, 255, 0.35) 63%, transparent 72%);
  box-shadow: inset 0 0 1.8rem rgba(91, 197, 255, 0.85), 0 0 1.6rem rgba(47, 135, 255, 0.9);
  animation: enemy-guard-aura 850ms ease-out forwards;
}

.guard-aura::before {
  content: '';
  position: absolute;
  inset: 9%;
  border: 2px solid rgba(218, 249, 255, 0.9);
  border-radius: 50%;
  animation: enemy-guard-ring 850ms ease-out forwards;
}

.guard-aura-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2.8rem;
  height: 2.8rem;
  object-fit: contain;
  filter: drop-shadow(0 0 0.45rem #a6e9ff) drop-shadow(0 0 0.8rem #247dff);
  animation: enemy-guard-icon 850ms ease-out forwards;
}

@keyframes enemy-guard-aura {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.25); }
  30% { opacity: 1; }
  70% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.12); }
}

@keyframes enemy-guard-ring {
  0% { opacity: 0; transform: scale(0.5); }
  45% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.25); }
}

@keyframes enemy-guard-icon {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.35); }
  35% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); }
  70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -65%) scale(0.9); }
}

/* Heal: several hearts drift independently upward around the monster. */
.heal-particles {
  position: absolute;
  inset: 0;
}

.heal-particle {
  position: absolute;
  top: 66%;
  left: 50%;
  width: 1.7rem;
  height: 1.7rem;
  object-fit: contain;
  opacity: 0;
  filter: drop-shadow(0 0 0.35rem #c3ffcc) drop-shadow(0 0 0.7rem #32d16d);
  animation: enemy-heal-particle 950ms ease-out forwards;
}

.heal-particle:nth-child(1) { left: 30%; animation-delay: 0ms; }
.heal-particle:nth-child(2) { left: 40%; top: 72%; animation-delay: 90ms; }
.heal-particle:nth-child(3) { left: 50%; top: 64%; animation-delay: 25ms; }
.heal-particle:nth-child(4) { left: 61%; top: 70%; animation-delay: 130ms; }
.heal-particle:nth-child(5) { left: 70%; top: 62%; animation-delay: 55ms; }

@keyframes enemy-heal-particle {
  0% { opacity: 0; transform: translate(-50%, 0.8rem) scale(0.45) rotate(-8deg); }
  22% { opacity: 1; }
  65% { opacity: 1; transform: translate(-50%, -2.5rem) scale(1.05) rotate(7deg); }
  100% { opacity: 0; transform: translate(-50%, -4.8rem) scale(0.75) rotate(-4deg); }
}

.monster-sprite.tackling {
  animation: monster-tackle 500ms ease-in-out;
}

/* Steps back (wind-up), lunges down toward the player, holds a beat at impact, then recoils back to rest. */
@keyframes monster-tackle {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-12px);
  }
  45%,
  60% {
    transform: translateY(16px) scale(1.08);
  }
  85% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}

.monster-sprite.using-heal-skill {
  animation: monster-heal-cast 850ms ease-out;
}

.monster-sprite.using-guard-skill {
  animation: monster-guard-cast 720ms ease-out;
}

/* Kept last so an offensive skill wins if multiple categories activate in the same tick. */
.monster-sprite.using-attack-skill {
  animation: monster-attack-cast 620ms ease-out;
}

/* Outcome animations come last so the decisive hit cannot be visually overwritten by a cast animation. */
.monster-sprite.defeated {
  animation: monster-defeated 700ms cubic-bezier(0.25, 0.7, 0.35, 1) forwards;
}

.monster-sprite.spawning {
  animation: monster-spawn 300ms ease-out both;
}

@keyframes monster-defeated {
  0% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
  12% { opacity: 1; transform: translateY(-0.2rem) scale(1.08, 0.94); filter: brightness(2.7) saturate(0); }
  35% { opacity: 1; transform: translateY(0.35rem) rotate(2deg) scale(0.98, 1.02); filter: brightness(1.15) saturate(0.55); }
  70% { opacity: 0.65; transform: translateY(1.2rem) rotate(5deg) scale(1.02, 0.78); filter: brightness(0.75) saturate(0.25); }
  100% { opacity: 0; transform: translateY(2.5rem) rotate(7deg) scale(1.08, 0.25); filter: brightness(0.45) saturate(0); }
}

@keyframes monster-spawn {
  0% { opacity: 0; transform: translateY(1.5rem) scale(0.72); filter: brightness(1.8) saturate(0.5); }
  65% { opacity: 1; transform: translateY(-0.15rem) scale(1.04); filter: brightness(1.15); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
}

@keyframes monster-attack-cast {
  0% { transform: scale(1); filter: brightness(1); }
  22% { transform: scale(0.9, 1.08); filter: brightness(1.25) sepia(0.35); }
  52% { transform: scale(1.13, 0.92); filter: brightness(1.8) sepia(0.6) saturate(1.8); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes monster-guard-cast {
  0% { transform: scale(1); filter: brightness(1); }
  38% { transform: scale(0.94); filter: brightness(1.35) drop-shadow(0 0 0.7rem #63b9ff); }
  68% { transform: scale(1.05); filter: brightness(1.2) drop-shadow(0 0 1rem #2d76ff); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes monster-heal-cast {
  0% { transform: translateY(0) scale(1); filter: brightness(1); }
  40% { transform: translateY(-0.3rem) scale(1.04); filter: brightness(1.35) drop-shadow(0 0 0.75rem #69e889); }
  75% { transform: translateY(-0.15rem) scale(1.02); filter: brightness(1.2) drop-shadow(0 0 0.45rem #6bdc85); }
  100% { transform: translateY(0) scale(1); filter: brightness(1); }
}

.player-health-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1.75rem;
  z-index: 2;
  border-radius: 0 0 0.45rem 0.45rem;
  background: var(--ui-player-hp);
}

.battle-card.player-defeated .scene {
  animation: player-defeat-scene 900ms ease-out both;
}

.battle-card.player-defeated::after {
  position: absolute;
  inset: 0;
  z-index: 6;
  content: '';
  pointer-events: none;
  background: radial-gradient(circle at 50% 100%, rgba(255, 88, 88, 0.06) 0 24%, rgba(104, 0, 22, 0.62) 100%);
  animation: player-defeat-vignette 900ms ease-out both;
}

@keyframes player-defeat-scene {
  0% { filter: brightness(1) saturate(1); transform: translate(0); }
  12% { filter: brightness(1.35) saturate(0.25); transform: translate(-3px, 2px); }
  22% { transform: translate(3px, -2px); }
  38% { transform: translate(-2px, 1px); }
  100% { filter: brightness(0.52) saturate(0.2); transform: translate(0); }
}

@keyframes player-defeat-vignette {
  0% { opacity: 0; }
  18%, 72% { opacity: 1; }
  100% { opacity: 0.72; }
}

/**
 * No extra delay here — the actual hp/def change already lands late (the
 * combat engine delays it by HIT_BURST_MS + HIT_HOLD_MS + HIT_TRAVEL_MS so it
 * syncs with the attacker's own hit-icon/tackle animation), so the shake
 * should react to that change immediately rather than pushing it out even
 * further and landing after the value has already visibly changed.
 */
.player-health-bar.hit,
.player-def-badge.hit,
.player-agi-badge.hit,
.monster-attack-badge.hit {
  animation: player-hit-shake 280ms ease-out;
}

/* Jitters in all four directions, not just side to side. */
@keyframes player-hit-shake {
  0% {
    transform: translate(0, 0);
  }
  15% {
    transform: translate(-4px, -3px);
  }
  30% {
    transform: translate(4px, 3px);
  }
  45% {
    transform: translate(-3px, 4px);
  }
  60% {
    transform: translate(3px, -4px);
  }
  75% {
    transform: translate(-2px, 2px);
  }
  100% {
    transform: translate(0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .monster-sprite-stage,
  .monster-change-enter-active,
  .monster-change-leave-active {
    transition: none;
  }

  .monster-sprite.defeated {
    opacity: 0;
    animation: none;
  }

  .monster-sprite.spawning,
  .battle-card.player-defeated .scene,
  .battle-card.player-defeated::after {
    animation: none;
  }
}

.player-hp-badge,
.enemy-hp-badge {
  position: absolute;
  z-index: 2;
}

.player-hp-badge {
  bottom: 0.125rem;
  left: 0.25rem;
}

/* Mirrors the player's hp badge into the opposite corner. */
.enemy-hp-badge {
  top: 0.125rem;
  right: 0.25rem;
}

</style>
