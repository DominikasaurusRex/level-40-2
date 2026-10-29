<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSaveStore } from '@/stores/save'
import MenuButton from './MenuButton.vue'
import NewGameConfirmation from './NewGameConfirmation.vue'

const emit = defineEmits<{
  close: []
  openPlayerStatus: []
  newGame: []
  openCredits: []
}>()

const saves = useSaveStore()
const fileInput = ref<HTMLInputElement>()
const resetConfirmationOpen = ref(false)
const loadError = ref<string>()
const saveMessage = ref<string>()

const saveAge = computed(() => saves.secondsSinceSave === undefined
  ? '-'
  : `Saved ${saves.secondsSinceSave}s ago`,
)

function downloadSave() {
  saveMessage.value = saves.download() ? 'Save file downloaded.' : undefined
}

async function loadSave(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  loadError.value = undefined
  if (await saves.importFile(file)) emit('close')
  else loadError.value = saves.saveError ?? 'The selected save file could not be loaded.'
}

function resetGame() {
  resetConfirmationOpen.value = false
  emit('newGame')
}
</script>

<template>
  <div class="menu-overlay">
    <div class="menu-modal" role="dialog" aria-modal="true" aria-labelledby="menu-title">
      <h2 id="menu-title" class="menu-title">Menu</h2>
      <p class="save-age">{{ saveAge }}</p>

      <div class="menu-actions">
        <MenuButton class="menu-action" @click="emit('openPlayerStatus')">Player Status</MenuButton>
        <div class="load-action">
          <MenuButton class="menu-action" @click="fileInput?.click()">Load</MenuButton>
          <p v-if="loadError" class="action-feedback load-error" role="alert">{{ loadError }}</p>
        </div>
        <div class="save-action">
          <MenuButton class="menu-action" @click="downloadSave">Save</MenuButton>
          <p v-if="saveMessage" class="action-feedback save-success" role="status">{{ saveMessage }}</p>
        </div>
        <MenuButton class="menu-action" danger @click="resetConfirmationOpen = true">New Game</MenuButton>
        <MenuButton class="menu-action" @click="emit('openCredits')">Credits</MenuButton>
      </div>

      <input
        ref="fileInput"
        class="save-file-input"
        type="file"
        accept=".sav,application/octet-stream"
        @change="loadSave"
      />

      <p v-if="saves.saveError && !loadError" class="menu-status menu-error" role="alert">{{ saves.saveError }}</p>
      <MenuButton class="menu-close" sound="close" @click="emit('close')">Close</MenuButton>
    </div>

    <Transition name="confirmation-fade">
      <NewGameConfirmation
        v-if="resetConfirmationOpen"
        @cancel="resetConfirmationOpen = false"
        @confirm="resetGame"
      />
    </Transition>
  </div>
</template>

<style scoped>
.menu-overlay {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 38%, rgba(49, 226, 212, 0.1), transparent 38%),
    rgba(0, 16, 31, 0.62);
  backdrop-filter: blur(2px) saturate(0.78);
}

.menu-modal {
  position: relative;
  box-sizing: border-box;
  width: 19rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2.5rem;
  border: 3px solid var(--ui-ink);
  border-radius: 0.3rem;
  background:
    repeating-linear-gradient(0deg, rgba(100, 240, 239, 0.025) 0 1px, transparent 1px 4px),
    linear-gradient(145deg, rgba(17, 119, 132, 0.84), rgba(6, 70, 91, 0.88) 55%, rgba(2, 39, 62, 0.9));
  box-shadow:
    inset 0 0 0 1px var(--ui-border-soft),
    0 0.75rem 1.75rem rgba(0, 0, 0, 0.78);
  color: var(--ui-text);
  font-family: Georgia, 'Times New Roman', serif;
  text-shadow: 0 2px 0 var(--ui-ink);
  backdrop-filter: blur(8px) saturate(1.2);
}

.menu-title,
.save-age,
.menu-status {
  margin: 0;
}

.menu-title {
  color: var(--ui-text);
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.05em;
}

.save-age {
  margin-top: -0.35rem;
  color: var(--ui-muted);
  font: 700 0.62rem/1.2 Arial, sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-actions {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.load-action,
.save-action {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.load-action .menu-action,
.save-action .menu-action {
  width: 100%;
}

.action-feedback {
  margin: 0;
  padding: 0.5rem 0.65rem;
  border: 2px solid;
  background: linear-gradient(105deg, rgba(11, 91, 110, 0.76), rgba(3, 48, 72, 0.74));
  font: 700 0.72rem/1.3 Arial, sans-serif;
  font-weight: bold;
  text-align: center;
  text-shadow: none;
}

.load-error {
  border-color: #e5b2a6;
  color: #ffd5cb;
}

.save-success {
  border-color: var(--ui-active);
  color: #eff5a4;
}

.menu-close {
  min-width: 7rem;
  margin-top: 0.1rem;
}

.save-file-input {
  display: none;
}

.menu-status {
  color: #eff5a4;
  font: 700 0.72rem/1.3 Arial, sans-serif;
  text-align: center;
  text-shadow: none;
}

.menu-error {
  color: #ffd5cb;
}

.confirmation-fade-enter-active {
  transition: opacity 180ms ease-out;
}

.confirmation-fade-leave-active {
  transition: opacity 140ms ease-in;
}

.confirmation-fade-enter-from,
.confirmation-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .confirmation-fade-enter-active,
  .confirmation-fade-leave-active {
    transition: none;
  }
}
</style>
