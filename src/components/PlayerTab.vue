<script setup lang="ts">
import {computed, onBeforeUnmount, reactive, ref} from 'vue'
import type {SkillState} from '@/types/combatant'
import type {Player} from '@/types/player'
import type {Weapon} from '@/types/weapon'
import {basicAttackSkill} from '@/types/weapon'
import {xpToNextPlayerLevel} from '@/data/player-xp-curve'
import {iconForPlayerSkill} from '@/data/skill-progression'
import {FOCUS_PULSE_MS} from '@/data/focus'
import {useGameStore} from '@/stores/game'
import {describeSkill} from '@/utils/skill-description'
import {playSound} from '@/audio/sounds'
import SkillRow from './SkillRow.vue'

const SEGMENTS = 20

const props = defineProps<{
  player: Player
  skills: SkillState[]
}>()

const emit = defineEmits<{
  openPlayerStatus: []
}>()

const game = useGameStore()

const xpBarEl = ref<HTMLElement>()
const skillListEl = ref<HTMLElement>()
const skillRowEls = reactive<Record<string, HTMLElement>>({})

function setSkillRowEl(id: string, el: Element | null) {
  if (el instanceof HTMLElement) skillRowEls[id] = el
}

function skillCooldownEl(id: string): HTMLElement | null {
  return skillRowEls[id]?.querySelector<HTMLElement>('.skill-cooldown') ?? null
}

function skillFocusTargetEl(id: string): HTMLElement | null {
  return skillRowEls[id]?.querySelector<HTMLElement>('.focus-target') ?? null
}

defineExpose({xpBarEl, skillListEl, skillRowEls, skillCooldownEl, skillFocusTargetEl})

const weaponMenuOpen = ref(false)
const pulseAnimationSkillId = ref<string>()
let pulseAnimationTimer: ReturnType<typeof setTimeout> | undefined

function selectWeapon(weapon: Weapon) {
  game.equipWeapon(weapon)
  weaponMenuOpen.value = false
}

function useFocus(skillId: string) {
  const spendsPulse = skillId === game.focusedSkillId && game.focusPulseReady
  if (!game.useFocus(skillId) || !spendsPulse) return

  playSound('focus')
  pulseAnimationSkillId.value = skillId
  clearTimeout(pulseAnimationTimer)
  pulseAnimationTimer = setTimeout(() => {
    if (pulseAnimationSkillId.value === skillId) pulseAnimationSkillId.value = undefined
  }, 480)
}

onBeforeUnmount(() => clearTimeout(pulseAnimationTimer))

/** No entry past the level cap — treat that as maxed out (full bar) rather than empty. */
const xpFillPercent = computed(() => {
  const required = xpToNextPlayerLevel.get(props.player.level)
  if (required === undefined) return 100
  return Math.min(100, Math.max(0, (props.player.xp / required) * 100))
})

function cooldownPercent(skillState: SkillState): number {
  return Math.min(100, Math.max(0, (skillState.remaining / skillState.cooldown) * 100))
}

function focusPercent(skillState: SkillState): number | undefined {
  if (skillState.id !== game.focusedSkillId) return undefined
  return Math.min(100, (game.focusChargeMs / FOCUS_PULSE_MS) * 100)
}

</script>

<template>
  <div class="player-tab">
    <div class="player-tab-frame">
      <div ref="xpBarEl" class="xp-bar">
        <div class="xp-bar-fill" :style="{ height: `${xpFillPercent}%` }"/>
        <div class="xp-bar-segments">
          <div v-for="i in SEGMENTS" :key="i" class="xp-bar-segment"/>
        </div>
      </div>

      <ul ref="skillListEl" class="skill-list">
        <template v-for="skillState in skills" :key="skillState.id">
          <li
            :ref="el => setSkillRowEl(skillState.id, el as Element | null)"
            class="skill"
            :class="{
              focused: skillState.id === game.focusedSkillId,
              'focus-ready': skillState.id === game.focusedSkillId && game.focusPulseReady,
            }"
          >
            <button
              class="focus-target"
              type="button"
              :aria-pressed="skillState.id === game.focusedSkillId"
              @click="useFocus(skillState.id)"
            >
              <SkillRow
                :name="skillState.name"
                :description="describeSkill(skillState)"
                :icon="skillState.id === 'basic-attack' ? player.combatant.weapon.icon
                      : iconForPlayerSkill(skillState.id, player.ownedSkillChoiceIds)"
                :cooldown-percent="cooldownPercent(skillState)"
                :focus-percent="focusPercent(skillState)"
                :pulse-used="pulseAnimationSkillId === skillState.id"
              />
            </button>
            <button
              v-if="skillState.id === 'basic-attack'"
              class="weapon-swap"
              type="button"
              :aria-expanded="weaponMenuOpen"
              aria-label="Swap weapon"
              title="Swap weapon"
              @click.stop="weaponMenuOpen = !weaponMenuOpen"
            >
              <img class="weapon-swap-icon" src="/icons/system/swap.svg" alt="">
            </button>
          </li>

          <template v-if="skillState.id === 'basic-attack' && weaponMenuOpen">
            <li
              v-for="weapon in player.weapons"
              :key="weapon.slot"
              class="skill equip-option"
              :class="{ equipped: weapon.slot === player.equippedWeaponSlot }"
              @click="selectWeapon(weapon)"
            >
              <SkillRow
                :name="weapon.name"
                :description="describeSkill(basicAttackSkill(weapon))"
                :icon="weapon.icon"
              />
            </li>
          </template>
        </template>
      </ul>
    </div>

    <!-- Sibling of the clipped frame, not a child, so it can poke above the frame's rounded top edge. -->
    <button
      type="button"
      class="level-badge"
      aria-label="Open player status"
      title="Player status"
      @click="emit('openPlayerStatus')"
    >{{ player.level }}
    </button>
  </div>
</template>

<style scoped>
.player-tab {
  position: relative;
  box-sizing: border-box;
  width: 220px;
  color: var(--ui-text);
}

/* Owns the border/rounded-corner clipping the xp-bar/skill-list rely on — split out from .player-tab so the level badge (a sibling) can escape that clip and poke above the top edge. */
.player-tab-frame {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 4px solid var(--ui-ink);
  border-radius: 0.75rem;
  background: radial-gradient(circle at 0 100%, rgba(72, 184, 116, 0.3), transparent 62%),
  linear-gradient(180deg, rgba(5, 57, 91, 0.86), rgba(21, 148, 105, 0.76));
  box-shadow: inset 0 0 0 1px var(--ui-border-soft),
  0 0.7rem 1.35rem rgba(0, 10, 24, 0.42);
  overflow: hidden;
}

.xp-bar {
  position: relative;
  flex: none;
  width: 1.5rem;
  border-right: 4px solid var(--ui-ink);
  background: var(--ui-track);
  overflow: hidden;
}

.xp-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--ui-cyan);
}

.xp-bar-segments {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.xp-bar-segment {
  flex: 1;
  border-bottom: 2px solid var(--ui-ink);
}

.xp-bar-segment:last-child {
  border-bottom: none;
}

/* Pokes slightly above the frame's top edge, nudged right so it overlaps onto the skill list's top-left corner — a fixed-size badge (unlike the hp pill, the level number never grows past 2 digits, so it doesn't need to). */
.level-badge {
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  width: 2rem;
  height: 2rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ui-ink);
  border-radius: 50%;
  background: var(--ui-active);
  color: var(--ui-ink);
  font-weight: bold;
  font-size: 1.1rem;
  font-family: inherit;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 0 0.6rem rgba(229, 236, 114, 0.38);
}

.level-badge:hover,
.level-badge:focus-visible {
  background: #f4f58a;
  box-shadow: 0 0 0.85rem rgba(229, 236, 114, 0.7);
}

.skill-list {
  flex: 1;
  min-width: 0;
  min-height: 0;
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  scrollbar-color: rgba(118, 174, 171, 0.72) rgba(1, 28, 45, 0.5);
  scrollbar-width: thin;
}

.skill-list::-webkit-scrollbar {
  width: 0.45rem;
}

.skill-list::-webkit-scrollbar-track {
  background: rgba(1, 28, 45, 0.5);
}

.skill-list::-webkit-scrollbar-thumb {
  border: 1px solid rgba(2, 42, 58, 0.72);
  border-radius: 999px;
  background: rgba(118, 174, 171, 0.72);
}

.skill {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid var(--ui-ink);
  border-radius: 0.5rem;
  background: rgba(7, 94, 116, 0.68);
  overflow: hidden;
}

.skill.focused {
  border-color: var(--ui-cyan);
  background: rgba(7, 105, 121, 0.82);
  box-shadow: inset 0 0 0.55rem rgba(50, 214, 194, 0.24);
}

.skill.focus-ready {
  animation: focus-ready-pulse 850ms ease-in-out infinite;
}

.focus-target {
  align-self: stretch;
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.1rem 0 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

@keyframes focus-ready-pulse {
  0%,
  100% {
    box-shadow: inset 0 0 0.45rem rgba(50, 214, 194, 0.28);
  }

  50% {
    box-shadow: inset 0 0 0.9rem rgba(50, 214, 194, 0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill.focus-ready {
    animation: none;
    box-shadow: inset 0 0 0.7rem rgba(50, 214, 194, 0.55);
  }
}

.weapon-swap {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  z-index: 2;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: 1px solid var(--ui-ink);
  border-radius: 50%;
  background: var(--ui-text);
  color: var(--ui-ink);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.weapon-swap-icon {
  display: block;
  width: 0.65rem;
  height: 0.65rem;
}

.weapon-swap:hover,
.weapon-swap:focus-visible {
  background: var(--ui-active);
}

/** A weapon choice under the equipped row — indented to read as a sub-list, highlighted when it's the equipped one. */
.equip-option {
  margin-left: 1rem;
  background: var(--ui-surface-deep);
  cursor: pointer;
}

.equip-option.equipped {
  border-color: var(--ui-active);
  background: linear-gradient(105deg, rgba(143, 151, 63, 0.84), rgba(55, 102, 81, 0.8));
}
</style>
