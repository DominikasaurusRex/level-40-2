<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Weapon } from '@/types/weapon'
import type { SkillChoice } from '@/types/skill-progression'
import { basicAttackSkill } from '@/types/weapon'
import { describeSkill } from '@/utils/skill-description'
import { playSound } from '@/audio/sounds'
import SkillTreeModal from './SkillTreeModal.vue'
import SkillDescription from './SkillDescription.vue'

const props = defineProps<{
  level: number
  oldMaxHp: number
  newMaxHp: number
  oldPower: number
  newPower: number
  currentHp: number
  currentMaxHp: number
  currentPower: number
  weapons?: Weapon[]
  skillChoices?: SkillChoice[]
  ownedSkillChoiceIds?: string[]
}>()

const emit = defineEmits<{
  accept: [skillChoiceId?: string]
}>()

const skillPickerOpen = ref(false)
const selectedSkillChoice = ref<SkillChoice>()
const needsSkillChoice = computed(() => Boolean(props.skillChoices?.length))
const skillRewardButtonEl = ref<HTMLElement>()
const skillTreeModal = ref<InstanceType<typeof SkillTreeModal>>()

defineExpose({ skillRewardButtonEl, skillPickerOpen, skillTreeModal })

onMounted(() => playSound('level-up'))

function selectSkill(choice: SkillChoice) {
  selectedSkillChoice.value = choice
  skillPickerOpen.value = false
}

function accept() {
  if (needsSkillChoice.value && !selectedSkillChoice.value) return
  emit('accept', selectedSkillChoice.value?.id)
}
</script>

<template>
  <div class="level-up-overlay">
    <div class="level-up-modal">
      <h2 class="level-up-title">Level Up!</h2>
      <p class="level-up-level">Level {{ level }}</p>
      <p class="level-up-stat">HP {{ oldMaxHp }} <span class="level-up-stat-arrow">&rarr;</span> HP {{ newMaxHp }}</p>
      <p v-if="oldPower !== newPower" class="level-up-stat">Power {{ oldPower }} <span class="level-up-stat-arrow">&rarr;</span> Power {{ newPower }}</p>
      <div v-if="weapons?.length" class="weapon-upgrades" aria-label="Weapon upgrades">
        <div
          v-for="weapon in weapons"
          :key="weapon.slot"
          class="weapon-upgrade"
          tabindex="0"
        >
          <div
            class="weapon-upgrade-icon"
            :style="{ backgroundImage: weapon.icon ? `url(${weapon.icon})` : undefined }"
          />
          <div class="weapon-upgrade-tooltip" role="tooltip">
            <strong>{{ weapon.name }}</strong>
            <SkillDescription :text="describeSkill(basicAttackSkill(weapon))" />
          </div>
        </div>
      </div>
      <div v-if="needsSkillChoice" class="skill-reward">
        <button
          ref="skillRewardButtonEl"
          type="button"
          class="weapon-upgrade skill-reward-button"
          :aria-label="selectedSkillChoice ? `Selected: ${selectedSkillChoice.name}` : 'Choose a skill'"
          @click="skillPickerOpen = true"
        >
          <div
            class="weapon-upgrade-icon skill-reward-icon"
            :style="{ backgroundImage: selectedSkillChoice ? `url(${selectedSkillChoice.icon})` : undefined }"
          />
          <div class="weapon-upgrade-tooltip" role="tooltip">
            <strong>{{ selectedSkillChoice?.name ?? 'Choose Skill' }}</strong>
            <SkillDescription :text="selectedSkillChoice?.description ?? 'Click to choose a skill or upgrade.'" />
          </div>
        </button>
        <span class="skill-reward-name">{{ selectedSkillChoice?.name ?? 'Choose Skill' }}</span>
      </div>
      <button class="level-up-accept" :disabled="needsSkillChoice && !selectedSkillChoice" @click="accept">Accept</button>
    </div>

    <SkillTreeModal
      v-if="skillPickerOpen && skillChoices"
      ref="skillTreeModal"
      title="Choose a Skill"
      :current-hp="currentHp"
      :max-hp="currentMaxHp"
      :power="currentPower"
      :skill-choices="skillChoices"
      :owned-skill-choice-ids="ownedSkillChoiceIds"
      :selected-skill-choice-id="selectedSkillChoice?.id"
      selectable
      @close="skillPickerOpen = false"
      @select="selectSkill"
    />
  </div>
</template>

<style scoped>
.level-up-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 14, 28, 0.58);
  backdrop-filter: blur(2px) saturate(0.8);
  z-index: 100;
}

.level-up-modal {
  box-sizing: border-box;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 3px solid var(--ui-ink);
  border-radius: 0.35rem;
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, rgba(18, 126, 138, 0.88), rgba(6, 72, 94, 0.9) 58%, rgba(2, 40, 63, 0.92));
  box-shadow:
    inset 0 0 0 1px var(--ui-border-soft),
    0 0.8rem 1.8rem rgba(0, 7, 18, 0.7);
  color: var(--ui-text);
  backdrop-filter: blur(8px) saturate(1.2);
}

.level-up-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--ui-active);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 0.65rem rgba(229, 236, 114, 0.3);
}

.level-up-level {
  margin: 0;
  font-weight: bold;
}

.level-up-stat {
  margin: 0;
  font-size: 0.9rem;
}

.level-up-stat-arrow {
  color: var(--ui-cyan);
  font-weight: bold;
}

.weapon-upgrades {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  padding: 0.35rem 0 0.6rem;
}

.weapon-upgrade {
  position: relative;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  outline: none;
}

.weapon-upgrade-icon {
  width: 2.75rem;
  height: 2.75rem;
  box-sizing: border-box;
  border: 2px solid rgba(101, 165, 178, 0.7);
  border-radius: 0.35rem;
  background-color: rgba(2, 31, 51, 0.78);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow:
    0 0 4px rgba(255, 255, 255, 0.95),
    0 0 10px rgba(70, 190, 255, 0.95),
    0 0 18px rgba(45, 120, 255, 0.75);
  animation: weapon-glow 1.8s ease-in-out infinite alternate;
}

.weapon-upgrade-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.75rem);
  width: 145px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem;
  border: 2px solid var(--ui-border);
  border-radius: 0.35rem;
  background: linear-gradient(145deg, rgba(10, 84, 103, 0.94), rgba(2, 42, 65, 0.95));
  color: var(--ui-text);
  font-size: 0.7rem;
  line-height: 1.3;
  text-align: center;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 0.25rem);
  transition: opacity 120ms ease-out, transform 120ms ease-out;
  z-index: 2;
}

.weapon-upgrade:hover .weapon-upgrade-tooltip,
.weapon-upgrade:focus-visible .weapon-upgrade-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

@keyframes weapon-glow {
  from {
    box-shadow: 0 0 4px #fff, 0 0 9px rgba(70, 190, 255, 0.85), 0 0 14px rgba(45, 120, 255, 0.6);
  }
  to {
    box-shadow: 0 0 7px #fff, 0 0 15px rgba(70, 210, 255, 1), 0 0 24px rgba(70, 110, 255, 0.85);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weapon-upgrade-icon {
    animation: none;
  }
}

.skill-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0 0.15rem;
}

.skill-reward-button {
  cursor: pointer;
}

.skill-reward-icon {
  width: 3rem;
  height: 3rem;
}

.skill-reward-name {
  font-size: 0.75rem;
  font-weight: bold;
}

.level-up-accept {
  padding: 0.5rem 1.5rem;
  border: 2px solid var(--ui-ink);
  border-radius: 0.5rem;
  background: linear-gradient(180deg, #eef07d, #bfd25e);
  color: var(--ui-ink);
  font-weight: bold;
  cursor: pointer;
  /* Light block peeking out bottom-right — reads as a raised 3D button sitting up off the modal. */
  box-shadow: 3px 3px 0 #52786e;
  transition: background 100ms ease-out, box-shadow 100ms ease-out, transform 100ms ease-out;
}

/* The button's own face darkens — as if it's already sinking under a held-down finger. */
.level-up-accept:hover {
  background: linear-gradient(180deg, #f6f59a, #d6e76b);
}

/* Follows through on the hover cue — the button actually sinks flush into its base on click. */
.level-up-accept:active {
  box-shadow: 0 0 0 #52786e;
  transform: translate(3px, 3px);
}

.level-up-accept:disabled,
.level-up-accept:disabled:hover,
.level-up-accept:disabled:active {
  border-color: #335365;
  background: #3a5965;
  color: #829da5;
  box-shadow: 3px 3px 0 #183747;
  transform: none;
  cursor: not-allowed;
}
</style>
