<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { SkillChoice } from '@/types/skill-progression'
import SkillTreeHelpModal from './SkillTreeHelpModal.vue'
import ModalCloseButton from './ModalCloseButton.vue'
import SkillDescription from './SkillDescription.vue'

const props = withDefaults(defineProps<{
  title: string
  currentHp: number
  maxHp: number
  power: number
  skillChoices: SkillChoice[]
  ownedSkillChoiceIds?: string[]
  selectedSkillChoiceId?: string
  selectable?: boolean
}>(), {
  ownedSkillChoiceIds: () => [],
  selectedSkillChoiceId: undefined,
  selectable: false,
})

const emit = defineEmits<{
  close: []
  select: [choice: SkillChoice]
}>()

const helpOpen = ref(false)
const helpButton = ref<HTMLButtonElement>()
const treeEl = ref<HTMLElement>()
const powerStatEl = ref<HTMLElement>()

defineExpose({ treeEl, powerStatEl })

async function closeHelp() {
  helpOpen.value = false
  await nextTick()
  helpButton.value?.focus()
}

const ownedSkillChoiceIds = computed(() => new Set(props.ownedSkillChoiceIds))
const choicesById = computed(() => new Map(props.skillChoices.map(choice => [choice.id, choice])))
const connections = computed(() => props.skillChoices.flatMap(target =>
  target.prerequisiteIds.flatMap(sourceId => {
    const source = choicesById.value.get(sourceId)
    return source ? [{ source, target }] : []
  }),
))

function isOwned(choice: SkillChoice): boolean {
  return ownedSkillChoiceIds.value.has(choice.id)
}

function isAvailable(choice: SkillChoice): boolean {
  return !isOwned(choice) && choice.prerequisiteIds.every(id => ownedSkillChoiceIds.value.has(id))
}

function canSelect(choice: SkillChoice): boolean {
  return props.selectable && isAvailable(choice)
}

function nodeStyle(choice: SkillChoice) {
  return {
    left: `${choice.position.x / 8.2}%`,
    top: `${choice.position.y / 4.2}%`,
  }
}

function connectionPath(source: SkillChoice, target: SkillChoice): string {
  const sourceY = source.position.y + 34
  // Stop the stroke at the arrowhead's base; the marker extends to the old tip position.
  const targetY = target.position.y - 48
  const bendY = sourceY + (targetY - sourceY) / 2
  return `M ${source.position.x} ${sourceY} V ${bendY} H ${target.position.x} V ${targetY}`
}

function isConnectionActive(source: SkillChoice): boolean {
  return isOwned(source) || props.selectedSkillChoiceId === source.id
}

function choiceAriaLabel(choice: SkillChoice): string {
  if (isOwned(choice)) return `${choice.name}, already learned. ${choice.description}`
  if (isAvailable(choice)) {
    const state = props.selectable ? 'available' : 'available at your next skill choice'
    return `${choice.name}, ${state}. ${choice.description}`
  }
  const missing = choice.prerequisiteIds
    .filter(id => !ownedSkillChoiceIds.value.has(id))
    .map(id => choicesById.value.get(id)?.name ?? id)
  return `${choice.name}, locked. Requires ${missing.join(' and ')}. ${choice.description}`
}

function selectSkill(choice: SkillChoice) {
  if (canSelect(choice)) emit('select', choice)
}
</script>

<template>
  <div class="skill-picker-overlay">
    <div class="skill-picker-modal" role="dialog" aria-modal="true" :aria-label="title" :inert="helpOpen || undefined">
      <header class="skill-picker-header">
        <p class="player-stat"><span>HP</span> {{ Math.round(currentHp) }} / {{ Math.round(maxHp) }}</p>
        <h3 class="skill-picker-title">{{ title }}</h3>
        <div class="skill-picker-header-right">
          <p ref="powerStatEl" class="player-stat player-power">
            <img class="player-power-icon" src="/icons/attack-power.png" alt="" />
            <span>Power</span> {{ power }}
          </p>
          <button
            ref="helpButton"
            type="button"
            class="skill-picker-help"
            aria-label="Combat terms"
            aria-haspopup="dialog"
            :aria-expanded="helpOpen"
            @click="helpOpen = true"
          >?</button>
        </div>
        <ModalCloseButton label="Close" @click="emit('close')" />
      </header>

      <div ref="treeEl" class="skill-tree" aria-label="Skill tree">
        <svg class="skill-tree-connections" viewBox="0 0 820 420" aria-hidden="true">
          <defs>
            <marker id="skill-arrow-muted" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" class="skill-arrow-muted" />
            </marker>
            <marker id="skill-arrow-active" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" class="skill-arrow-active" />
            </marker>
          </defs>
          <path
            v-for="connection in connections"
            :key="`${connection.source.id}-${connection.target.id}`"
            class="skill-tree-connection"
            :class="{ active: isConnectionActive(connection.source) }"
            :d="connectionPath(connection.source, connection.target)"
            :marker-end="isConnectionActive(connection.source) ? 'url(#skill-arrow-active)' : 'url(#skill-arrow-muted)'"
          />
        </svg>
        <button
          v-for="choice in skillChoices"
          :key="choice.id"
          type="button"
          class="skill-tree-node"
          :class="{
            owned: isOwned(choice),
            available: isAvailable(choice),
            selectable: canSelect(choice),
            locked: !isOwned(choice) && !isAvailable(choice),
            selected: selectedSkillChoiceId === choice.id,
          }"
          :style="nodeStyle(choice)"
          :aria-disabled="!canSelect(choice)"
          :aria-label="choiceAriaLabel(choice)"
          @click="selectSkill(choice)"
        >
          <span
            class="skill-picker-icon"
            :style="{ backgroundImage: `url(${choice.icon})` }"
          />
          <strong>{{ choice.name }}</strong>
          <SkillDescription
            class="skill-picker-description"
            :class="{ below: choice.position.y < 100 }"
            role="tooltip"
            :text="choice.description"
          />
        </button>
      </div>
    </div>
    <SkillTreeHelpModal v-if="helpOpen" @close="closeHelp" />
  </div>
</template>

<style scoped>
.skill-picker-overlay {
  position: absolute;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 11, 25, 0.68);
  backdrop-filter: blur(2px);
}

.skill-picker-modal {
  box-sizing: border-box;
  width: calc(100% - 1.25rem);
  max-width: 780px;
  padding: 0.7rem 1rem 1rem;
  border: 3px solid var(--ui-ink);
  border-radius: 0.35rem;
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, rgba(18, 121, 135, 0.92), rgba(5, 68, 91, 0.93) 56%, rgba(2, 37, 60, 0.94));
  color: var(--ui-text);
  box-shadow: 0 0.8rem 1.8rem rgba(0, 7, 18, 0.72);
}

.skill-picker-header {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 1.8rem;
  margin-bottom: 0.15rem;
}

.skill-picker-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
}

.skill-picker-help {
  flex: none;
  width: 1.35rem;
  height: 1.35rem;
  padding: 0;
  border: 2px solid var(--ui-cyan);
  border-radius: 50%;
  background: var(--ui-panel-strong);
  color: var(--ui-text);
  font: bold 0.9rem/1 Arial, sans-serif;
  cursor: pointer;
}

.skill-picker-help:hover,
.skill-picker-help:focus-visible {
  background: var(--ui-active);
  color: var(--ui-ink);
  outline: none;
}

.skill-picker-title,
.player-stat {
  margin: 0;
}

.skill-picker-title {
  font-size: 1.1rem;
  text-align: center;
}

.player-stat {
  color: var(--ui-text);
  font-size: 0.85rem;
  font-weight: bold;
}

.player-stat span {
  color: var(--ui-active);
  text-transform: uppercase;
}

.player-power {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
  text-align: right;
}

.player-power span {
  color: var(--ui-enemy-hp, #d95b63);
}

.player-power-icon {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}

.skill-tree {
  position: relative;
  width: 100%;
  aspect-ratio: 820 / 420;
}

.skill-tree-connections {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.skill-tree-connection {
  fill: none;
  stroke: rgba(87, 132, 145, 0.62);
  stroke-width: 3;
  transition: stroke 160ms ease-out, filter 160ms ease-out;
}

.skill-tree-connection.active {
  stroke: var(--ui-cyan);
  filter: drop-shadow(0 0 4px rgba(49, 226, 212, 0.8));
}

.skill-arrow-muted {
  fill: rgba(87, 132, 145, 0.8);
}

.skill-arrow-active {
  fill: var(--ui-cyan);
}

.skill-tree-node {
  position: absolute;
  z-index: 1;
  width: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ui-text);
  font: inherit;
  transform: translate(-50%, -50%);
  transition: filter 120ms ease-out, opacity 120ms ease-out, transform 120ms ease-out;
}

.skill-tree-node.selectable {
  cursor: pointer;
}

.skill-tree-node.selectable:hover,
.skill-tree-node.selectable:focus-visible {
  z-index: 5;
  transform: translate(-50%, calc(-50% - 2px));
  outline: none;
}

.skill-tree-node:not(.selectable):hover,
.skill-tree-node:not(.selectable):focus-visible {
  z-index: 5;
  outline: none;
}

.skill-picker-icon {
  display: block;
  width: 2.35rem;
  height: 2.35rem;
  box-sizing: border-box;
  border: 2px solid rgba(101, 165, 178, 0.7);
  border-radius: 0.35rem;
  background-color: rgba(2, 31, 51, 0.78);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.skill-tree-node strong {
  max-width: 82px;
  font-size: 0.66rem;
  line-height: 1.05;
  text-align: center;
}

.skill-tree-node.locked {
  opacity: 0.42;
}

.skill-tree-node.locked .skill-picker-icon {
  filter: grayscale(0.85);
  box-shadow: none;
}

.skill-tree-node.owned .skill-picker-icon,
.skill-tree-node.selected .skill-picker-icon {
  border-color: var(--ui-cyan);
  background-color: rgba(8, 92, 104, 0.88);
  box-shadow: 0 0 5px #fff, 0 0 13px rgba(49, 226, 212, 0.95), 0 0 21px rgba(49, 226, 212, 0.62);
}

.skill-tree-node.selectable:not(.owned) .skill-picker-icon {
  animation: skill-glow 1.8s ease-in-out infinite alternate;
}

.skill-picker-description {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.4rem);
  z-index: 4;
  width: 145px;
  box-sizing: border-box;
  padding: 0.45rem;
  border: 2px solid var(--ui-border);
  border-radius: 0.35rem;
  background: linear-gradient(145deg, rgba(10, 84, 103, 0.98), rgba(2, 42, 65, 0.99));
  color: var(--ui-text);
  font-size: 0.62rem;
  line-height: 1.3;
  text-align: center;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 0.2rem);
  transition: opacity 120ms ease-out, transform 120ms ease-out;
}

.skill-picker-description.below {
  top: calc(100% + 0.4rem);
  bottom: auto;
}

.skill-tree-node:hover .skill-picker-description,
.skill-tree-node:focus-visible .skill-picker-description {
  opacity: 1;
  transform: translate(-50%, 0);
}

@keyframes skill-glow {
  from {
    box-shadow: 0 0 4px #fff, 0 0 9px rgba(70, 190, 255, 0.85), 0 0 14px rgba(45, 120, 255, 0.6);
  }
  to {
    box-shadow: 0 0 7px #fff, 0 0 15px rgba(70, 210, 255, 1), 0 0 24px rgba(70, 110, 255, 0.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-tree-node.selectable:not(.owned) .skill-picker-icon {
    animation: none;
  }
}
</style>
