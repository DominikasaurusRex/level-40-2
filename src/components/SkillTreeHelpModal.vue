<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ModalCloseButton from './ModalCloseButton.vue'

const emit = defineEmits<{ close: [] }>()
const closeButton = ref<InstanceType<typeof ModalCloseButton>>()

onMounted(() => closeButton.value?.focus())

function keepFocus(event: KeyboardEvent) {
  event.preventDefault()
  closeButton.value?.focus()
}
</script>

<template>
  <div class="skill-help-overlay" @click.self="emit('close')" @keydown.esc="emit('close')" @keydown.tab="keepFocus">
    <div class="skill-help-dialog" role="dialog" aria-modal="true" aria-labelledby="skill-help-title">
      <div class="skill-help-modal">
        <h3 id="skill-help-title">Combat Terms</h3>

        <dl class="combat-terms">
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/attack-power.png" alt="" />Power</dt>
            <dd>Raises weapon damage and the strength of learned skills. Level-ups increase Power once every three levels; each first boss badge adds +2 Power.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/defense.png" alt="" />Shields</dt>
            <dd>Absorb damage from a hit before HP is lost. Unused Shield points stay until hits consume them.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/agi.png" alt="" />Evasion</dt>
            <dd>One charge dodges one entire hit, then is spent. Each hit of a multi-hit attack is checked separately.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/stun.png" alt="" />Stun</dt>
            <dd>Freezes skill cooldowns and Focus charging while it lasts. Hits already launched still land.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/bleed.png" alt="" />Bleed</dt>
            <dd>Damages HP over time, bypassing Shields and Evasion. Immunity blocks Bleed damage while active.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/invincibility.png" alt="" />Immunity</dt>
            <dd>Blocks incoming damage for its duration, including Bleed. New status effects can still be applied.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/curse.png" alt="" />Curse</dt>
            <dd>Reduces healing received for its duration; the amount depends on the attack. Cleanse removes Curse and Bleed.</dd>
          </div>
          <div class="combat-term">
            <dt><img class="term-icon" src="/icons/heal.png" alt="" />Regeneration</dt>
            <dd>Restores HP gradually over time. Curse reduces each healing tick.</dd>
          </div>
        </dl>
      </div>
      <ModalCloseButton ref="closeButton" class="skill-help-close-offset" label="Close combat terms" @click="emit('close')" />
    </div>
  </div>
</template>

<style scoped>
.skill-help-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  background: rgba(0, 11, 25, 0.76);
  backdrop-filter: blur(3px);
}

.skill-help-dialog {
  position: relative;
  width: min(40rem, calc(100% - 4rem));
  max-height: calc(100% - 3rem);
}

.skill-help-modal {
  width: 100%;
  max-height: 31rem;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 1.4rem 1.5rem 1.25rem;
  border: 3px solid var(--ui-ink);
  border-radius: 0.35rem;
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, #126f80, #06465e 58%, #02273e);
  box-shadow: 0 0.8rem 1.8rem rgba(0, 7, 18, 0.78);
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
}

.skill-help-modal h3 {
  margin: 0 1.5rem 1rem 0;
  font-size: 1.2rem;
}

.combat-terms {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1.5rem;
  margin: 0;
}

.combat-term dt {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 1.35rem;
  margin-bottom: 0.2rem;
  color: var(--ui-active);
  font-size: 0.9rem;
  font-weight: bold;
}

.term-icon {
  flex: none;
  width: 1.35rem;
  height: 1.35rem;
  object-fit: contain;
}

.combat-term dd {
  margin: 0;
  color: var(--ui-text);
  font-size: 0.78rem;
  line-height: 1.4;
}

.skill-help-dialog :deep(.skill-help-close-offset) {
  right: -0.5rem;
}

</style>
